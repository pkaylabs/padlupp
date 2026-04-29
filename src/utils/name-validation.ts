export const NAME_MAX_LENGTH = 20;
export const NAME_ALLOWED_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export const sanitizeNameInput = (value: string) =>
  value.replace(/[^A-Za-z\s]/g, "").replace(/\s+/g, " ").slice(0, NAME_MAX_LENGTH);
