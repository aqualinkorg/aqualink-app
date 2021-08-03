import axios from 'axios';

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

export const sendSlackMessage = (payload: SlackMessage, token: string) => {
  return axios({
    url: 'https://slack.com/api/chat.postMessage',
    method: 'post',
    data: payload,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
