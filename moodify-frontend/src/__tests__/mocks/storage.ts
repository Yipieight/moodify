/**
 * Mock implementations for localStorage and storage operations
 */

export class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}
  private shouldThrowError = false
  private errorType: 'quota' | 'security' | 'generic' | null = null

  get length(): number {
    return Object.keys(this.store).length
  }

  /**
   * Set mock to throw error on next operation
   */
  setError(type: 'quota' | 'security' | 'generic') {
    this.shouldThrowError = true
    this.errorType = type
  }

  /**
   * Clear error state
   */
  clearError() {
    this.shouldThrowError = false
    this.errorType = null
  }

  /**
   * Throw error based on type if configured
   */
  private throwErrorIfConfigured(operation: string) {
    if (this.shouldThrowError && this.errorType) {
      switch (this.errorType) {
        case 'quota':
          throw new DOMException('QuotaExceededError', 'QuotaExceededError')
        case 'security':
          throw new DOMException('SecurityError', 'SecurityError')
        case 'generic':
          throw new Error(`Storage ${operation} failed`)
      }
    }
  }

  getItem(key: string): string | null {
    this.throwErrorIfConfigured('getItem')
    return this.store[key] || null
  }

  setItem(key: string, value: string): void {
    this.throwErrorIfConfigured('setItem')
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    this.throwErrorIfConfigured('removeItem')
    delete this.store[key]
  }

  clear(): void {
    this.throwErrorIfConfigured('clear')
    this.store = {}
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }

  /**
   * Get all stored data (for testing)
   */
  getAllData(): Record<string, string> {
    return { ...this.store }
  }

  /**
   * Set data directly (for test setup)
   */
  setData(data: Record<string, string>) {
    this.store = { ...data }
  }
}

/**
 * Create a fresh localStorage mock instance
 */
export const createLocalStorageMock = (): LocalStorageMock => {
  return new LocalStorageMock()
}

/**
 * Global localStorage mock for tests
 */
export const localStorageMock = new LocalStorageMock()

/**
 * Setup localStorage mock for tests
 */
export const setupLocalStorageMock = () => {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
}

/**
 * Mock sessionStorage (similar to localStorage)
 */
export class SessionStorageMock extends LocalStorageMock {}

export const sessionStorageMock = new SessionStorageMock()

/**
 * Setup sessionStorage mock for tests
 */
export const setupSessionStorageMock = () => {
  Object.defineProperty(global, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  })
}

/**
 * Setup both storage mocks
 */
export const setupStorageMocks = () => {
  setupLocalStorageMock()
  setupSessionStorageMock()
}
