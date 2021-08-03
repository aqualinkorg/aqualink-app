import { Logger } from '@nestjs/common';
import axios from 'axios';

const logger = new Logger('SlackUtils');

export interface SlackMessage {
  channel: string;
  text?: string;
  mrkdwn?: boolean;
  blocks?: {
    type: string;
    text?: {
      type: string;
      text: string;
    };
  }[];
}

interface SlackResponse {
  ok: boolean;
  error?: string;
  warning?: string;
}

export const sendSlackMessage = async (
  payload: SlackMessage,
  token: string,
) => {
  const rsp = await axios.post<SlackResponse>(
    'https://slack.com/api/chat.postMessage',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const { data } = rsp;
  // Slack returns { ok: false } if an error occurs
  if (!data.ok) {
    logger.error(
      `Slack responded with a non-ok status. Error: '${data.error}'. Warning: '${data.warning}'.`,
    );
  }
};
