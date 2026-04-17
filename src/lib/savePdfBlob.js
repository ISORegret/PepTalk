import { Capacitor } from '@capacitor/core';

async function blobToBase64(blob) {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Save a PDF blob: native → cache file + share sheet; web → download link.
 */
export async function savePdfBlob(blob, filename, options = {}) {
  const { title = 'PepTalk', dialogTitle = 'Save PDF' } = options;

  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const base64 = await blobToBase64(blob);
    const result = await Filesystem.writeFile({
      path: filename.replace(/[^\w.\-]+/g, '_'),
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({
      title,
      files: [result.uri],
      dialogTitle,
    });
    return true;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
