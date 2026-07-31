// backend/utils/profanityFilter.js

// Dictionaries for English and Vietnamese profanity
const PROFANITY_PATTERNS = [
  // English common terms & variations
  /\bf+u+c+k+\w*/i,
  /\bs+h+i+t+\w*/i,
  /\bb+i+t+c+h+\w*/i,
  /\ba+s+s+h+o+l+e+\w*/i,
  /\bb+a+s+t+a+r+d+\w*/i,
  /\bd+i+c+k+\w*/i,
  /\bp+u+s+s+y+\w*/i,
  /\bc+u+n+t+\w*/i,
  /\bw+h+o+r+e+\w*/i,
  /\bs+l+u+t+\w*/i,

  // Vietnamese common terms & variations
  /\bđ+ị+t+\w*/i,
  /\bđ+m+\b/i,
  /\bđ+m+m+\b/i,
  /\bd+m+m+\b/i,
  /\bd+m+\b/i,
  /\bđ+á+m+á+\b/i,
  /\bđ+i+t+m+e+\w*/i,
  /\bd+i+t+m+e+\w*/i,
  /\bc+á+c+\b/i,
  /\bc+ặ+c+\b/i,
  /\bc+c+\b/i,
  /\bc+l+\b/i,
  /\bl+ồ+n+\w*/i,
  /\bl+o+n+\b/i,
  /\bb+u+ồ+i+\w*/i,
  /\bb+u+o+i+\b/i,
  /\bv+ã+i+l+ồ+n+\w*/i,
  /\bv+a+i+l+o+n+\w*/i,
  /\bv+l+\b/i,
  /\bó+c+c+h+ó+\b/i,
  /\bo+c+c+h+o+\b/i,
  /\bc+h+ó+đ+ẻ+\b/i,
  /\bđ+é+o+\b/i,
  /\bd+e+o+\b/i,
];

// Helper to remove Vietnamese diacritics
export const removeDiacritics = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// Helper to normalize leet speak (e.g. fuc1k, d!t, l0n, c@c)
export const normalizeLeet = (str = "") => {
  return str
    .replace(/@/g, "a")
    .replace(/4/g, "a")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/!/g, "i")
    .replace(/0/g, "o")
    .replace(/\$/g, "s")
    .replace(/5/g, "s")
    .replace(/7/g, "t");
};

/**
 * Checks text for profanity and masks matched words with asterisks.
 * @param {string} text - Input text to evaluate
 * @returns {{ containsProfanity: boolean, flaggedWords: string[], cleanText: string }}
 */
export const checkProfanity = (text = "") => {
  if (!text || typeof text !== "string") {
    return { containsProfanity: false, flaggedWords: [], cleanText: text || "" };
  }

  const words = text.split(/(\s+)/); // Keep whitespace delimiters intact for clean reconstruct
  const flaggedWords = new Set();
  let cleanTextParts = [];

  for (const part of words) {
    if (/^\s+$/.test(part) || !part) {
      cleanTextParts.push(part);
      continue;
    }

    // Clean word for checking
    const normalizedRaw = removeDiacritics(part.toLowerCase());
    const normalizedLeet = normalizeLeet(normalizedRaw);

    let isBad = false;

    for (const pattern of PROFANITY_PATTERNS) {
      if (pattern.test(part) || pattern.test(normalizedRaw) || pattern.test(normalizedLeet)) {
        isBad = true;
        flaggedWords.add(part.replace(/[^\w\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, ""));
        break;
      }
    }

    if (isBad) {
      // Replace non-space characters with asterisks
      const masked = part.replace(/[^\s]/g, "*");
      cleanTextParts.push(masked);
    } else {
      cleanTextParts.push(part);
    }
  }

  const containsProfanity = flaggedWords.size > 0;
  const cleanText = cleanTextParts.join("");

  return {
    containsProfanity,
    flaggedWords: Array.from(flaggedWords).filter(Boolean),
    cleanText,
  };
};
