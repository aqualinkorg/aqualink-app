import requests from "../helpers/requests";

interface GetFormData {
  createdAt: string;
  fundingSource: string | null;
  id: number;
  installationResources: string | null;
  installationSchedule: string | null;
  permitRequirements: string | null;
  reefId: {
    createdAt: string;
    depth: number;
    id: number;
    name: string;
    polygon: {
      coordinates: [number, number];
      type: string;
    };
    status: number;
    temperatureThreshold: number;
    updatedAt: string;
    videoStream: string;
  };
  uid: string;
  updatedAt: string;
  userId: {
    adminLevel: string;
    country: string | null;
    createdAt: string;
    description: string | null;
    email: string;
    firebaseUid: string;
    fullName: string;
    id: number;
    imageUrl: string | null;
    location: string | null;
    organization: string;
    updatedAt: string;
  };
}

export interface SendFormData {
  uid: string;
  reef: {
    name: string;
    polygon: {
      type: string;
      coordinates: [number, number];
    };
    depth: number;
  };
  reefApplication: {
    reefId: number | null;
    uid: string;
    permitRequirements: string | null;
    fundingSource: string | null;
    installationSchedule: string | null;
    installationResources: string | null;
  };
}

const getFormData = (appId: string, uid: string) =>
  requests.send<GetFormData>({
    url: `/reef-applications/${appId}`,
    method: "GET",
    params: {
      uid,
    },
  });

const sendFormData = (appId: string, data: SendFormData) =>
  requests.send<SendFormData>({
    url: `reef-applications/${appId}`,
    method: "PUT",
    data,
  });
export default {
  getFormData,
  sendFormData,
};
