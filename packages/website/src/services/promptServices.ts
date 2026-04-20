import requests from 'helpers/requests';

export interface AIPrompt {
  id: number;
  promptKey: string;
  content: string;
  description?: string;
  category?: string;
  version: number;
  updatedAt: string;
  updatedBy?: string;
  isActive: boolean;
}

export interface AIPromptHistory {
  id: number;
  promptId: number;
  promptKey: string;
  content: string;
  version: number;
  changedAt: string;
  changedBy?: string;
  changeNotes?: string;
}

export interface UpdatePromptParams {
  content: string;
  changeNotes?: string;
}

export interface RollbackParams {
  version: number;
}

const getAllPrompts = (token: string) =>
  requests.send<AIPrompt[]>({
    url: 'monitoring/prompts',
    method: 'GET',
    token,
  });

const getPrompt = (promptKey: string, token: string) =>
  requests.send<AIPrompt>({
    url: `monitoring/prompts/${promptKey}`,
    method: 'GET',
    token,
  });

const updatePrompt = (
  promptKey: string,
  data: UpdatePromptParams,
  token: string,
) =>
  requests.send<AIPrompt>({
    url: `monitoring/prompts/${promptKey}`,
    method: 'PUT',
    data,
    token,
  });

const getPromptHistory = (promptKey: string, token: string) =>
  requests.send<AIPromptHistory[]>({
    url: `monitoring/prompts/${promptKey}/history`,
    method: 'GET',
    token,
  });

const rollbackToVersion = (
  promptKey: string,
  data: RollbackParams,
  token: string,
) =>
  requests.send<AIPrompt>({
    url: `monitoring/prompts/${promptKey}/rollback`,
    method: 'POST',
    data,
    token,
  });

const refreshCache = (token: string) =>
  requests.send<{ success: boolean; message: string }>({
    url: 'monitoring/prompts/refresh-cache',
    method: 'POST',
    token,
  });

export default {
  getAllPrompts,
  getPrompt,
  updatePrompt,
  getPromptHistory,
  rollbackToVersion,
  refreshCache,
};
