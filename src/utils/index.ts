/**
 * 下载文件的公共方法
 * @param url - 文件的URL或Blob URL
 * @param filename - 下载的文件名，如果不提供则从URL中提取
 */
export const downloadFile = (url: string, filename?: string): void => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || url.split('/').pop() || 'download';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * 从对象键名中提取文件名
 * @param objectKey - 对象键名（通常包含路径）
 * @returns 提取的文件名
 */
export const extractFilename = (objectKey: string): string => {
  return objectKey.split('/').pop() || 'download';
};

/**
 * 下载文件（使用对象键名）
 * @param url - 文件的URL或Blob URL
 * @param objectKey - 对象键名，用于提取文件名
 */
export const downloadFileFromObjectKey = (url: string, objectKey: string): void => {
  const filename = extractFilename(objectKey);
  downloadFile(url, filename);
};
