// src/utils/cloudinaryHelper.js
// Helper functions để xử lý Cloudinary URLs

/**
 * Convert Cloudinary URL từ image/upload sang raw/upload (cho PDF files)
 * @param {string} url - Cloudinary URL
 * @returns {string} - Converted URL
 */
export function convertToRawUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  // Nếu URL đã là raw/upload thì không cần convert
  if (url.includes('/raw/upload/')) return url;
  
  // Convert từ image/upload sang raw/upload
  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/raw/upload/');
  }
  
  return url;
}

/**
 * Get proper URL để hiển thị PDF trong browser
 * @param {string} url - Cloudinary URL
 * @returns {string} - URL có thể dùng để view PDF
 */
export function getPdfViewUrl(url) {
  if (!url) return url;
  
  // Nếu là PDF (có extension .pdf hoặc đã là raw/upload)
  if (url.includes('.pdf') || url.includes('/raw/upload/')) {
    return convertToRawUrl(url);
  }
  
  // Nếu là image/upload nhưng có thể là PDF, convert sang raw
  if (url.includes('/image/upload/')) {
    return convertToRawUrl(url);
  }
  
  return url;
}

/**
 * Check nếu URL là PDF file
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isPdfUrl(url) {
  if (!url) return false;
  return url.toLowerCase().includes('.pdf') || url.includes('/raw/upload/');
}

