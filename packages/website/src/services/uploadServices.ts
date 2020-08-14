import axios from "axios";

const uploadMedia = (formData: FormData, token?: string | null) =>
  axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_BASE_URL}surveys/upload`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

export default { uploadMedia };
