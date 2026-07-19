/**
 * Extracts the Presentation ID from a full Google Slides URL or returns the input if it's already an ID.
 * @param {string} urlOrId - The input URL or ID.
 * @returns {string|null} The extracted presentation ID or null.
 */
export const extractPresentationId = (urlOrId) => {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Pattern matches "/presentation/d/{id}" in google slides URLs
  const match = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Check if it looks like a Google Slides ID (alphanumeric with hyphens/underscores, usually long)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
};
