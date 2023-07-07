export function downloadCsvFile(url: string, fileName: string) {
  const link = document.createElement('a');
  // eslint-disable-next-line fp/no-mutation
  link.href = url;
  // eslint-disable-next-line fp/no-mutation
  link.target = '_blank';
  // eslint-disable-next-line fp/no-mutation
  link.rel = 'noopener noreferrer';
  if (fileName) {
    link.setAttribute('download', fileName);
  }
  document.body.appendChild(link);
  link.click();
}
