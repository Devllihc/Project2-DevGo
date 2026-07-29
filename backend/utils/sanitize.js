import DOMPurify from 'isomorphic-dompurify';

/**
 * Recursively sanitizes input values (handles strings, arrays, and objects).
 * Strips all HTML tags and script elements from user inputs.
 * @param {any} input - Value to sanitize.
 * @returns {any} Sanitized value.
 */
export const sanitizeBackendValue = (input) => {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeBackendValue(item));
  }

  if (typeof input === 'object' && !(input instanceof Date) && !(input instanceof RegExp)) {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeBackendValue(value);
    }
    return sanitizedObj;
  }

  return input;
};

/**
 * Sanitizes HTML content intended for email templates.
 * Allows safe HTML tags (headings, paragraphs, links, basic formatting).
 * @param {string} dirtyHtml - HTML string to sanitize.
 * @returns {string} Clean HTML string.
 */
export const sanitizeEmailHtml = (dirtyHtml) => {
  if (dirtyHtml === null || dirtyHtml === undefined) return '';
  if (typeof dirtyHtml !== 'string') return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br', 'div', 'span', 'img', 'table', 'tr', 'td', 'th'],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'style', 'class', 'width', 'height', 'align']
  });
};
