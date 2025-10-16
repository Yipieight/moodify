import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock face-api.js
jest.mock('face-api.js', () => ({
  nets: {
    tinyFaceDetector: {
      loadFromUri: jest.fn().mockResolvedValue(true),
    },
    faceExpressionNet: {
      loadFromUri: jest.fn().mockResolvedValue(true),
    },
  },
  detectAllFaces: jest.fn(),
  TinyFaceDetectorOptions: jest.fn(),
}))

// Mock react-webcam
jest.mock('react-webcam', () => {
  return {
    __esModule: true,
    default: jest.fn(({ children, ...props }) =>
      React.createElement('div', {
        'data-testid': 'webcam-mock',
        ...props
      }, children)
    ),
  }
})

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  LineElement: jest.fn(),
  ArcElement: jest.fn(),
  PointElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}))

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(({ data, options }) =>
    React.createElement('div', {
      'data-testid': 'line-chart',
      'data-chart-data': JSON.stringify(data),
      'data-chart-options': JSON.stringify(options)
    })
  ),
  Bar: jest.fn(({ data, options }) =>
    React.createElement('div', {
      'data-testid': 'bar-chart',
      'data-chart-data': JSON.stringify(data),
      'data-chart-options': JSON.stringify(options)
    })
  ),
  Doughnut: jest.fn(({ data, options }) =>
    React.createElement('div', {
      'data-testid': 'doughnut-chart',
      'data-chart-data': JSON.stringify(data),
      'data-chart-options': JSON.stringify(options)
    })
  ),
  PolarArea: jest.fn(({ data, options }) =>
    React.createElement('div', {
      'data-testid': 'polar-area-chart',
      'data-chart-data': JSON.stringify(data),
      'data-chart-options': JSON.stringify(options)
    })
  ),
}))

// Mock window objects that might not exist in test environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock ResizeObserver
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    constructor(cb) {
      this.cb = cb
    }
    observe() { }
    unobserve() { }
    disconnect() { }
  }
}

// Mock IntersectionObserver
if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(cb) {
      this.cb = cb
    }
    observe() { }
    unobserve() { }
    disconnect() { }
  }
}

// Global test utilities
global.React = require('react')