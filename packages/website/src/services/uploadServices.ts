import requests from "../helpers/requests";

const uploadMedia = (
  formData: FormData,
  siteId: string,
  token?: string | null
) =>
  requests.send<string>({
    method: "POST",
    url: `sites/${siteId}/surveys/upload`,
    data: formData,
    token,
    contentType: "multipart/form-data",
    responseType: "text",
  });

export default { uploadMedia };
