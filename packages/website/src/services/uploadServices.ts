import requests from "../helpers/requests";

const uploadMedia = (
  formData: FormData,
  reefId: string,
  token?: string | null
) =>
  requests.send<string>({
    method: "POST",
    url: `reefs/${reefId}/surveys/upload`,
    data: formData,
    token,
    contentType: "multipart/form-data",
    responseType: "text",
  });

export default { uploadMedia };
