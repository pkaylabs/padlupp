export function getProperty<Type, Key extends keyof Type>(
  obj: Type,
  key: Key
): Type[Key] {
  return obj[key];
}

export { API_BASE_URL } from "./api";
