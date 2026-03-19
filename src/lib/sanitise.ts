type SanitiseInputOptions = {
  maxLength?: number;
  trim?: boolean;
  stripHtml?: boolean;
};

const HTML_TAG_REGEX = /<[^>]*>/g;
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitiseInput(value: string, options: SanitiseInputOptions = {}) {
  const {
    maxLength = 2000,
    trim = true,
    stripHtml = true,
  } = options;

  const raw = typeof value === 'string' ? value : String(value ?? '');
  let output = raw.replace(CONTROL_CHARS_REGEX, '');

  if (stripHtml) {
    output = output.replace(HTML_TAG_REGEX, '');
  }

  if (trim) {
    output = output.trim();
  }

  return output.slice(0, maxLength);
}

export function sanitiseEmail(value: string) {
  const email = sanitiseInput(value, { maxLength: 320 }).toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email address.');
  }

  return email;
}
