// Escapes user input before it is embedded in a Mongoose/MongoDB $regex filter,
// preventing regex-injection and ReDoS via crafted special characters.
export const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
