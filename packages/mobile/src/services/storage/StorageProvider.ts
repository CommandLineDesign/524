/**
 * StorageProvider interface for abstracting storage operations.
 * Enables platform-specific implementations and easy mocking for tests.
 */
export interface StorageProvider {
  /**
   * Retrieve a value from storage
   * @param key - The storage key
   * @returns The stored value, or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Store a value
   * @param key - The storage key
   * @param value - The value to store
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Remove a value from storage
   * @param key - The storage key
   */
  delete(key: string): Promise<void>;
}
