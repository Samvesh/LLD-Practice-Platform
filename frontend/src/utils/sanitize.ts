import DOMPurify from 'dompurify';

/**
 * Sanitize user-submitted text for safe rendering.
 * Defense-in-depth: backend sanitizes on input, frontend sanitizes on output.
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
