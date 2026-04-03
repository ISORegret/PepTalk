/**
 * Resize and compress image file to JPEG data URL for localStorage (vial labels, etc.).
 * @param {File} file
 * @param {number} maxW
 * @param {number} quality 0–1
 * @returns {Promise<string|null>}
 */
export function compressImageFileToDataUrl(file, maxW = 400, quality = 0.72) {
  return new Promise((resolve) => {
    if (!file || !file.type?.startsWith('image/')) {
      resolve(null);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { width, height } = img;
        if (width > maxW) {
          height = (height * maxW) / width;
          width = maxW;
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width));
        canvas.height = Math.max(1, Math.round(height));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl.length < 900_000 ? dataUrl : null);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
