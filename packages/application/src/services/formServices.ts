import requests from "../helpers/requests";

interface FormData {
  userName: string;
  organization: string;
  latitude: number;
  longitude: number;
  depth: number;
}

const getFormData = (id: string) =>
  requests.send<FormData>({
    // Should be changed to the desired endpoint
    url: `/reefs/${id}`,
    method: "GET",
  });

export default {
  getFormData,
};
