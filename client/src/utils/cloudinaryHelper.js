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
  
  // QUAN TRỌNG: Nếu URL có /image/upload/, có thể file được lưu như image
  // Trong trường hợp này, KHÔNG convert vì file thực tế là image trong Cloudinary
  // Chỉ convert nếu chắc chắn file là raw
  
  // Nếu URL đã là /image/upload/ và có .pdf, có thể file được lưu như image
  // Giữ nguyên URL gốc từ Cloudinary (đã được test và hoạt động)
  if (url.includes('/image/upload/') && url.includes('.pdf')) {
    // File được lưu như image, giữ nguyên URL
    return url;
  }
  
  // Nếu URL là /raw/upload/, đảm bảo có .pdf
  if (url.includes('/raw/upload/')) {
    const urlParts = url.split('?');
    const baseUrl = urlParts[0];
    const queryParams = urlParts[1] || '';
    
    if (!baseUrl.includes('.pdf')) {
      return baseUrl + '.pdf' + (queryParams ? '?' + queryParams : '');
    }
  }
  
  // Convert từ image/upload sang raw/upload chỉ khi cần (file cũ)
  if (url.includes('/image/upload/') && !url.includes('.pdf')) {
    return convertToRawUrl(url) + '.pdf';
  }
  
  return url;
}

/**
 * Get Google Docs viewer URL để embed PDF
 * @param {string} url - PDF URL
 * @returns {string} - Google Docs viewer URL
 */
export function getGoogleDocsViewerUrl(url) {
  if (!url) return url;
  const pdfUrl = getPdfViewUrl(url);
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
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


