/**
 * Fetches a URL and ensures the response is an array.
 * If fetch fails, JSON is invalid, or result is not an array, returns [].
 */
export async function safeFetchArray<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`safeFetch failed for ${url}: ${res.status}`);
      return [];
    }
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error(`safeFetch exception for ${url}:`, error);
    return [];
  }
}