import DOMPurify from 'dompurify';

/**
 * Sanitizes dirty HTML strings using DOMPurify.
 * @param {string} dirty - The untrusted HTML string to sanitize.
 * @param {object} [options] - Optional DOMPurify configuration options.
 * @returns {string} Sanitized HTML string.
 */
export function sanitizeHtml(dirty, options) {
  if (dirty === null || dirty === undefined) return '';
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, options);
}

/**
 * Validates and sanitizes a URL against allowed protocols.
 * Allowed protocols: http:, https:, mailto:, tel:, or relative URLs starting with / (and not //).
 * @param {string} url - The URL string to validate.
 * @param {string} [fallback='#'] - Fallback URL if target URL is unsafe or invalid.
 * @returns {string} Sanitized URL or fallback.
 */
export function sanitizeUrl(url, fallback = '#') {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();

  // Allow relative URLs starting with '/' but NOT '//' (protocol-relative URLs)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (allowedProtocols.includes(protocol)) {
      return trimmed;
    }
  } catch {
    // URL parsing failed (e.g. invalid format or relative URL not starting with /)
    return fallback;
  }

  return fallback;
}

/**
 * Strips all HTML tags from a string using DOMPurify.
 * @param {string} str - Input text string.
 * @returns {string} Clean plain text string with all tags removed.
 */
export function sanitizeText(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') return '';
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Validates targetUrl with sanitizeUrl and navigates via navigateFn or window.location.href.
 * @param {string} targetUrl - Destination URL.
 * @param {function} [navigateFn] - Optional router navigation callback function.
 * @returns {boolean} True if navigation proceeded, false if URL was blocked as unsafe.
 */
export function safeNavigate(targetUrl, navigateFn) {
  const cleanUrl = sanitizeUrl(targetUrl, '');
  if (!cleanUrl) {
    return false;
  }

  if (typeof navigateFn === 'function') {
    navigateFn(cleanUrl);
  } else if (typeof window !== 'undefined' && window.location) {
    window.location.href = cleanUrl;
  }

  return true;
}
