function setLS(key: string, value: any): any {
  if (typeof window === "undefined") return value;
  if (typeof value === 'undefined' || value === null) {
      console.warn(`Attempted to set localStorage key '${key}' with undefined or null value.`);
      return value;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  } catch (error) {
    console.error(`Error setting localStorage key '${key}':`, error);
    return value;
  }
}

function getLS(key: string, defaultValue: any = null): any {
  if (typeof window === "undefined") return defaultValue;
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Error getting localStorage key '${key}':`, error);
    return defaultValue;
  }
}

function removeLS(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key '${key}':`, error);
  }
}

export { getLS, setLS, removeLS };