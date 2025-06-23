function setLS(key: string, value: any): any {
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
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    // Nếu là JSON, parse, còn không thì trả về chuỗi
    try {
      return JSON.parse(storedValue);
    } catch {
      return storedValue;
    }
  } catch (error) {
    console.error(`Error getting localStorage key '${key}':`, error);
    return defaultValue;
  }
}

function removeLS(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key '${key}':`, error);
  }
}

export { getLS, setLS, removeLS };