export function downloadCsvFile(url: string, fileName: string) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/csv',
    },
  })
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      // eslint-disable-next-line fp/no-mutation
      link.href = downloadUrl;
      if (fileName) {
        link.setAttribute('download', fileName);
      }
      document.body.appendChild(link);
      link.click();
    });
}
