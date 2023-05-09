import { DataSource, In, MoreThan } from 'typeorm';
import { Logger } from '@nestjs/common';
import { difference } from 'lodash';
import moment from 'moment';
import { Site, SiteStatus } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { SlackMessage, sendSlackMessage } from '../utils/slack.utils';

const logger = new Logger('checkBuoysStatus');

export async function checkBuoysStatus(connection: DataSource) {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const slackChannel = process.env.SLACK_BOT_CHANNEL;

  const sitesDeployedBuoy = await connection.getRepository(Site).find({
    where: { status: SiteStatus.Deployed },
    select: { id: true, sensorId: true, sofarApiToken: true },
  });

  const siteIds = sitesDeployedBuoy.map((x) => x.id);

  if (!(siteIds.length > 0)) {
    logger.log('No site with deployed buoys found.');
    return;
  }

  const latestData = await connection.getRepository(LatestData).find({
    where: {
      source: SourceType.SPOTTER,
      site: { id: In(siteIds) },
      timestamp: MoreThan(
        new Date(moment().subtract(2, 'd').format('YYYY-MM-DD')),
      ),
    },
  });

  const sitesWithDeployedSpotters = [
    ...new Map(latestData.map((x) => [x.siteId, x])).values(),
  ].map((x) => x.siteId);

  const diff = difference(siteIds, sitesWithDeployedSpotters);

  if (diff.length === 0) {
    logger.log("No problems with spotters' status");
    return;
  }

  const diffSites = sitesDeployedBuoy.filter((x) => diff.includes(x.id));

  // Create a simple alert template for slack
  const messageTemplate: SlackMessage = {
    // The channel id is fetched by requesting the list on GET https://slack.com/api/conversations.list
    // (the auth token should be included in the auth headers)
    channel: slackChannel || '',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Spotters of:\n${diffSites
            .map(
              (x) =>
                `site: ${x.id}, spotter: ${x.sensorId} ${
                  x.sofarApiToken ? '(using private token)' : ''
                }\n`,
            )
            .join('')} have not received data for more than 2 days!`,
        },
      },
    ],
  };

  // Log message in stdout
  logger.warn(messageTemplate);

  if (!slackToken) {
    logger.error('No slack bot token was defined.');
    return;
  }

  if (!slackChannel) {
    logger.error('No slack target channel was defined.');
    return;
  }

  // Send an alert containing all irregular video stream along with the reason
  await sendSlackMessage(messageTemplate, slackToken);
}
