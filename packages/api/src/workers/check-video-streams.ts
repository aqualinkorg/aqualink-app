import { Logger } from '@nestjs/common';
import axios, { AxiosPromise } from 'axios';
import { Dictionary } from 'lodash';
import { DataSource, IsNull, Not } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { sendSlackMessage, SlackMessage } from '../utils/slack.utils';
import { getYouTubeVideoId } from '../utils/urls';

const logger = new Logger('CheckVideoStreams');

type siteIdToVideoStreamDetails = Record<
  number,
  {
    id?: string;
    name: string | null;
    siteId: number;
    url: string;
    error: string;
  }
>;

// Create a basic structure for youTube response items
interface YouTubeVideoItem {
  id: string;
  status: {
    privacyStatus: 'private' | 'public' | 'unlisted';
    embeddable: boolean;
    uploadStatus: 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded';
  };
  liveStreamingDetails: {
    actualStartTime: string;
    actualEndTime: string;
  };
}

interface YouTubeApiResponse {
  items: YouTubeVideoItem[];
}

const getSiteFrontEndURL = (siteId: number, frontUrl: string) =>
  new URL(`sites/${siteId}`, frontUrl).href;

export const fetchVideoDetails = (
  youTubeIds: string[],
  apiKey: string,
  playlist = false,
): AxiosPromise<YouTubeApiResponse> =>
  axios({
    url: `https://www.googleapis.com/youtube/v3/${
      playlist ? 'playlists' : 'videos'
    }`,
    method: 'get',
    params: {
      key: apiKey,
      id: youTubeIds.join(),
      part: `status${playlist ? '' : ',liveStreamingDetails'}`,
    },
  });

export const getErrorMessage = (
  item: YouTubeVideoItem,
  isPlaylist: boolean,
) => {
  const { uploadStatus, privacyStatus, embeddable } = item.status;

  if (privacyStatus === 'private') {
    return 'Video is not public';
  }

  if (
    !isPlaylist &&
    uploadStatus !== 'uploaded' &&
    uploadStatus !== 'processed'
  ) {
    return 'Video is no longer available';
  }

  if (!isPlaylist && !embeddable) {
    return 'Video is not embeddable';
  }

  if (item.liveStreamingDetails) {
    if (item.liveStreamingDetails.actualEndTime) {
      return 'The live stream has ended';
    }

    if (!item.liveStreamingDetails.actualStartTime) {
      return 'The live stream has not started yet';
    }
  }

  return '';
};

const getYTErrors = async (
  sites: Site[],
  isPlaylist: boolean,
  apiKey: string,
  frontUrl: string,
) => {
  // Extract the youTube id from the URLs
  const siteIdToVideoStreamDetails = sites.reduce<siteIdToVideoStreamDetails>(
    (mapping, site) => {
      const id = getYouTubeVideoId(site.videoStream!, isPlaylist);

      return {
        ...mapping,
        [site.id]: {
          id,
          name: site.name,
          siteId: site.id,
          url: site.videoStream!,
          // If no id exists, then url is invalid
          error: id ? '' : 'Video stream URL is invalid',
        },
      };
    },
    {},
  );

  const youTubeIds = Object.values(siteIdToVideoStreamDetails)
    .map((videoStreamDetails) => videoStreamDetails.id)
    .filter((id) => id) as string[];

  // Fetch the youTube video information for each id
  const axiosResponse = await fetchVideoDetails(youTubeIds, apiKey, isPlaylist);

  // Validate that the streams are valid
  // For ids with no errors an empty string is returned
  const youTubeIdToError = checkVideoOptions(
    axiosResponse.data.items,
    isPlaylist,
  );

  const blocks = Object.values(siteIdToVideoStreamDetails).reduce<
    Exclude<SlackMessage['blocks'], undefined>
  >((msgs, { id, siteId, url, name, error }) => {
    const reportedError =
      error ||
      (!(id! in youTubeIdToError) && 'Video does not exist') ||
      youTubeIdToError[id!];

    if (!reportedError) {
      return msgs;
    }

    const template = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `*Site*: ${name} - ${getSiteFrontEndURL(siteId, frontUrl)}\n` +
          `*Video*: ${url}\n` +
          `*Error*: ${reportedError}`,
      },
    };

    return [...msgs, template];
  }, []);

  return blocks;
};

const checkVideoOptions = (
  youTubeVideoItems: YouTubeVideoItem[],
  isPlaylist: boolean,
) =>
  youTubeVideoItems.reduce<Dictionary<string>>(
    (mapping, item) => ({
      ...mapping,
      [item.id]: getErrorMessage(item, isPlaylist),
    }),
    {},
  );

export const checkVideoStreams = async (
  dataSource: DataSource,
  projectId: string,
) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const slackChannel = process.env.SLACK_BOT_CHANNEL;
  const frontUrl = process.env.FRONT_END_BASE_URL;

  // Check that the all necessary environment variables are set
  if (!apiKey) {
    logger.error('No google api key was defined');
    return;
  }

  if (!slackToken) {
    logger.error('No slack bot token was defined');
    return;
  }

  if (!slackChannel) {
    logger.error('No slack target channel was defined');
    return;
  }

  if (!frontUrl) {
    logger.error('No front url was defined');
    return;
  }

  // Fetch sites with streams
  const sitesWithStream = await dataSource.getRepository(Site).find({
    where: { videoStream: Not(IsNull()) },
  });

  const playlists = sitesWithStream.filter((x) =>
    x.videoStream?.includes('videoseries'),
  );
  const videos = sitesWithStream.filter(
    (x) => !x.videoStream?.includes('videoseries'),
  );

  const [playlistsBlock, videoBlocks] = await Promise.all([
    getYTErrors(playlists, true, apiKey, frontUrl),
    getYTErrors(videos, false, apiKey, frontUrl),
  ]);

  const blocks = [...playlistsBlock, ...videoBlocks];

  // No irregular video streams were found
  // So skip sending an alert on slack
  if (!blocks.length) {
    return;
  }

  // Create a simple alert template for slack
  const messageTemplate = {
    // The channel id is fetched by requesting the list on GET https://slack.com/api/conversations.list
    // (the auth token should be included in the auth headers)
    channel: slackChannel,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Scheduled check of video streams in *${projectId}* instance`,
        },
      },
      {
        type: 'divider',
      },
      ...blocks,
    ],
  } as SlackMessage;

  // Log message in stdout
  logger.log(messageTemplate);

  // Send an alert containing all irregular video stream along with the reason
  await sendSlackMessage(messageTemplate, slackToken);
};
