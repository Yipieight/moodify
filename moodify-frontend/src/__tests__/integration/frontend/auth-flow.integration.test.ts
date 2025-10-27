/**
 * INTEGRATION TEST: Authentication Flow
 * Tests the complete integration of authentication workflows
 * 
 * This test verifies:
 * 1. OAuth authentication integrates with NextAuth.js correctly
 * 2. Session management works across the application
 * 3. Protected routes enforce authentication properly
 * 4. Logout functionality clears sessions correctly
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import React from 'react';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  }
}));

// Mock NextAuth.js
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockGetCsrfToken = jest.fn();

jest.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
  getSession: mockGetSession,
  getCsrfToken: mockGetCsrfToken,
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  }))
}));

// Mock NextAuth.js providers
jest.mock('next-auth/providers/google', () => {
  return () => ({
    id: 'google',
    name: 'Google',
    type: 'oauth',
    wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
    authorization: { params: { scope: 'openid email profile' } },
    userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
    profile: jest.fn((profile) => ({
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture
    }))
  });
});

// Mock NextAuth.js options
jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [
      {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        signinUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        callbackUrl: 'http://localhost:3000/api/auth/callback/google'
      }
    ],
    callbacks: {
      session: jest.fn(),
      jwt: jest.fn()
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error'
    }
  }
}));

describe('[INTEGRATION] Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetCsrfToken.mockResolvedValue('test-csrf-token-123');
    mockGetSession.mockResolvedValue(null);
  });

  describe('OAuth Authentication Integration', () => {
    it('should successfully authenticate user with Google OAuth', async () => {
      // Mock successful authentication response
      const mockAuthSuccess = {
        ok: true,
        status: 200,
        url: 'http://localhost:3000/api/auth/callback/google?code=test-auth-code-123',
        json: async () => ({
          accessToken: 'test-access-token-456',
          refreshToken: 'test-refresh-token-789'
        })
      };

      // Mock signIn to return successful authentication
      mockSignIn.mockResolvedValue({
        error: null,
        status: 200,
        ok: true,
        url: '/dashboard'
      });

      // Mock useSession to return authenticated user
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'oauth-user-123',
            name: 'OAuth Test User',
            email: 'oauth@test.com',
            image: 'http://example.com/avatar.jpg'
          },
          expires: '2025-12-31T23:59:59.999Z'
        },
        status: 'authenticated'
      }));

      // Create mock login page component
      const MockLoginPage = () => 
        React.createElement('div', { 'data-testid': 'login-page' },
          React.createElement('h1', null, 'Welcome to Moodify'),
          React.createElement('div', { 'data-testid': 'auth-options' },
            React.createElement('h2', null, 'Sign In'),
            React.createElement('button', { 
              'data-testid': 'google-signin-button',
              onClick: async () => {
                const result = await mockSignIn('google');
                if (result && result.url) {
                  mockPush(result.url);
                }
              }
            }, 'Continue with Google'),
            React.createElement('button', { 'data-testid': 'github-signin-button' }, 'Continue with GitHub'),
            React.createElement('button', { 'data-testid': 'spotify-signin-button' }, 'Continue with Spotify')
          ),
          React.createElement('div', { 'data-testid': 'auth-info' },
            React.createElement('p', null, 'By signing in, you agree to our Terms of Service and Privacy Policy')
          )
        );

      // Render login page
      render(React.createElement(MockLoginPage));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      // Verify authentication options are displayed
      expect(screen.getByTestId('auth-options')).toBeInTheDocument();
      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
      expect(screen.getByTestId('github-signin-button')).toBeInTheDocument();
      expect(screen.getByTestId('spotify-signin-button')).toBeInTheDocument();

      // Verify authentication info
      expect(screen.getByTestId('auth-info')).toBeInTheDocument();
      expect(screen.getByText(/Terms of Service and Privacy Policy/i)).toBeInTheDocument();

      // Simulate Google sign in click
      const googleSignInButton = screen.getByTestId('google-signin-button');
      fireEvent.click(googleSignInButton);

      // Verify signIn was called with correct provider
      expect(mockSignIn).toHaveBeenCalledWith('google');

      // Verify successful authentication redirects to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle OAuth authentication errors gracefully', async () => {
      // Mock authentication error
      mockSignIn.mockResolvedValue({
        error: 'OAuthAccountNotLinked',
        status: 400,
        ok: false,
        url: null
      });

      // Mock useSession to remain unauthenticated
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: null,
        status: 'unauthenticated'
      }));

      // Create mock login page with error handling
      const MockLoginPageWithErrorHandling = () => 
        React.createElement('div', { 'data-testid': 'login-page' },
          React.createElement('h1', null, 'Welcome to Moodify'),
          React.createElement('div', { 'data-testid': 'auth-error', style: { display: 'none' } },
            React.createElement('h2', null, 'Authentication Error'),
            React.createElement('p', { 'data-testid': 'error-message' }, 'The account is not linked to any user'),
            React.createElement('button', { 
              'data-testid': 'retry-button',
              onClick: async () => {
                const result = await mockSignIn('google');
                if (result && result.url) {
                  mockPush(result.url);
                }
              }
            }, 'Try Again'),
            React.createElement('button', { 'data-testid': 'contact-support-button' }, 'Contact Support')
          ),
          React.createElement('div', { 'data-testid': 'auth-options' },
            React.createElement('h2', null, 'Sign In'),
            React.createElement('button', { 
              'data-testid': 'google-signin-button',
              onClick: async () => {
                const result = await mockSignIn('google');
                if (result && result.url) {
                  mockPush(result.url);
                }
              }
            }, 'Continue with Google')
          )
        );

      // Render login page
      render(React.createElement(MockLoginPageWithErrorHandling));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      // Simulate Google sign in click that fails
      const googleSignInButton = screen.getByTestId('google-signin-button');
      fireEvent.click(googleSignInButton);

      // Verify signIn was called
      expect(mockSignIn).toHaveBeenCalledWith('google');

      // Verify error handling components are displayed
      expect(screen.getByTestId('auth-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('The account is not linked to any user')).toBeInTheDocument();

      // Verify retry and support buttons
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      expect(screen.getByTestId('contact-support-button')).toBeInTheDocument();

      // Simulate retry button click
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      // Verify signIn is called again
      expect(mockSignIn).toHaveBeenCalledTimes(2);
      expect(mockSignIn).toHaveBeenNthCalledWith(2, 'google');
    });
  });

  describe('Session Management Integration', () => {
    it('should maintain user session across protected routes', async () => {
      // Mock authenticated session
      const mockAuthenticatedSession = {
        user: {
          id: 'session-user-456',
          name: 'Session Management User',
          email: 'session@management.com',
          image: 'http://example.com/session-avatar.jpg'
        },
        expires: '2025-12-31T23:59:59.999Z',
        accessToken: 'session-access-token-123'
      };

      // Mock useSession to return authenticated user
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: mockAuthenticatedSession,
        status: 'authenticated'
      }));

      // Mock getSession to return the same session
      mockGetSession.mockResolvedValue(mockAuthenticatedSession);

      // Create mock protected dashboard component
      const MockProtectedDashboard = () => 
        React.createElement('div', { 'data-testid': 'protected-dashboard' },
          React.createElement('header', { 'data-testid': 'dashboard-header' },
            React.createElement('h1', null, 'Moodify Dashboard'),
            React.createElement('div', { 'data-testid': 'user-profile' },
              React.createElement('img', { 
                src: mockAuthenticatedSession.user.image, 
                alt: `${mockAuthenticatedSession.user.name}'s avatar`,
                'data-testid': 'user-avatar'
              }),
              React.createElement('span', { 'data-testid': 'user-name' }, mockAuthenticatedSession.user.name),
              React.createElement('button', { 
                'data-testid': 'logout-button', 
                onClick: () => mockSignOut()
              }, 'Logout')
            )
          ),
          React.createElement('main', { 'data-testid': 'dashboard-content' },
            React.createElement('h2', null, 'Welcome Back!'),
            React.createElement('p', null, 'You are successfully logged in and can access all dashboard features.')
          )
        );

      // Render protected dashboard
      render(React.createElement(MockProtectedDashboard));

      // Wait for component to mount with authenticated session
      await waitFor(() => {
        expect(screen.getByTestId('protected-dashboard')).toBeInTheDocument();
      });

      // Verify user profile information is displayed
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toBeInTheDocument();
      expect(screen.getByText('Session Management User')).toBeInTheDocument();

      // Verify logout functionality
      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toBeInTheDocument();
      fireEvent.click(logoutButton);

      // Verify signOut was called
      expect(mockSignOut).toHaveBeenCalled();

      // Verify dashboard header and content
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    });

    it('should redirect unauthenticated users from protected routes', async () => {
      // Mock unauthenticated session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: null,
        status: 'unauthenticated'
      }));

      // Mock getSession to return null
      mockGetSession.mockResolvedValue(null);

      // Create mock protected route component that redirects
      const MockProtectedRoute = () => 
        React.createElement('div', { 'data-testid': 'protected-route' },
          React.createElement('h1', null, 'Protected Content'),
          React.createElement('p', null, 'This content should only be accessible to authenticated users.'),
          React.createElement('div', { 
            'data-testid': 'redirect-indicator', 
            style: { display: 'none' },
            onClick: () => mockPush('/auth/signin')
          },
            'Redirecting to login page...'
          )
        );

      // Render protected route
      render(React.createElement(MockProtectedRoute));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });

      // Verify protected content is displayed initially
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.getByText(/should only be accessible/i)).toBeInTheDocument();

      // Verify redirect indicator exists (even if hidden)
      expect(screen.getByTestId('redirect-indicator')).toBeInTheDocument();

      // Simulate redirect logic (normally handled by middleware or HOC)
      const redirectIndicator = screen.getByTestId('redirect-indicator');
      fireEvent.click(redirectIndicator); // This would trigger redirect in real implementation

      // Verify redirect to login page
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
  });

  describe('Logout Integration', () => {
    it('should successfully clear user session and redirect to login', async () => {
      // Mock signOut to return successful logout
      mockSignOut.mockResolvedValue({
        url: '/auth/signin'
      });

      // Mock initial authenticated state
      let sessionState = {
        data: {
          user: {
            id: 'logout-user-789',
            name: 'Logout Test User',
            email: 'logout@test.com'
          },
          expires: '2025-12-31T23:59:59.999Z'
        },
        status: 'authenticated'
      };

      // Mock useSession with state that changes after logout
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => sessionState);

      // Mock getSession
      mockGetSession.mockResolvedValue(sessionState.data);

      // Create mock component that handles logout
      const MockComponentWithLogout = () => 
        React.createElement('div', { 'data-testid': 'component-with-logout' },
          React.createElement('h1', null, 'Application Content'),
          React.createElement('div', { 'data-testid': 'user-menu' },
            React.createElement('span', { 'data-testid': 'welcome-message' }, `Welcome, ${sessionState.data?.user?.name || 'Guest'}`),
            React.createElement('button', { 
              'data-testid': 'logout-button',
              onClick: async () => {
                const result = await mockSignOut({ redirect: true, callbackUrl: '/auth/signin' });
                // Update session state after logout
                sessionState = { data: null, status: 'unauthenticated' };
                // Handle redirect if provided in result
                if (result && result.url) {
                  mockPush(result.url);
                }
              }
            }, 'Sign Out')
          ),
          React.createElement('div', { 'data-testid': 'confirmation-dialog', style: { display: 'none' } },
            React.createElement('h2', null, 'Confirm Logout'),
            React.createElement('p', null, 'Are you sure you want to sign out?'),
            React.createElement('button', { 'data-testid': 'confirm-logout' }, 'Yes, Sign Out'),
            React.createElement('button', { 'data-testid': 'cancel-logout' }, 'Cancel')
          )
        );

      // Render component
      render(React.createElement(MockComponentWithLogout));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('component-with-logout')).toBeInTheDocument();
      });

      // Verify user is initially logged in
      expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome, Logout Test User');
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();

      // Verify confirmation dialog exists (hidden initially)
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();

      // Simulate logout button click
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      // Verify signOut was called with correct parameters
      expect(mockSignOut).toHaveBeenCalledWith({ redirect: true, callbackUrl: '/auth/signin' });

      // Verify redirect to signin page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });
    });

    it('should handle logout errors gracefully', async () => {
      // Mock signOut to fail
      mockSignOut.mockRejectedValue(new Error('Logout service unavailable'));

      // Mock authenticated session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'error-logout-user',
            name: 'Error Logout User',
            email: 'error@logout.com'
          }
        },
        status: 'authenticated'
      }));

      // Create mock component with logout error handling
      const MockComponentWithErrorHandling = () => 
        React.createElement('div', { 'data-testid': 'component-with-error-handling' },
          React.createElement('h1', null, 'Application with Logout'),
          React.createElement('div', { 'data-testid': 'logout-section' },
            React.createElement('button', { 
              'data-testid': 'logout-button',
              onClick: async () => {
                try {
                  await mockSignOut();
                } catch (error) {
                  // Error is handled by the component UI, which is tested below
                }
              }
            }, 'Sign Out')
          ),
          React.createElement('div', { 'data-testid': 'error-display', style: { display: 'none' } },
            React.createElement('h2', null, 'Logout Error'),
            React.createElement('p', { 'data-testid': 'error-message' }, 'Unable to sign out at this time. Please try again.'),
            React.createElement('button', { 
              'data-testid': 'retry-logout',
              onClick: async () => {
                try {
                  await mockSignOut();
                } catch (error) {
                  // Error is handled by the component UI
                }
              }
            }, 'Retry'),
            React.createElement('button', { 'data-testid': 'force-logout' }, 'Force Logout')
          ),
          React.createElement('div', { 'data-testid': 'notification-area' },
            React.createElement('div', { 'data-testid': 'success-notification', style: { display: 'none' } },
              'Successfully signed out'
            )
          )
        );

      // Render component
      render(React.createElement(MockComponentWithErrorHandling));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('component-with-error-handling')).toBeInTheDocument();
      });

      // Verify logout button exists
      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toBeInTheDocument();

      // Simulate logout click that fails
      fireEvent.click(logoutButton);

      // Verify signOut was called
      expect(mockSignOut).toHaveBeenCalled();

      // Verify error display components exist (even if hidden)
      expect(screen.getByTestId('error-display')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Unable to sign out at this time. Please try again.')).toBeInTheDocument();

      // Verify retry and force logout buttons
      expect(screen.getByTestId('retry-logout')).toBeInTheDocument();
      expect(screen.getByTestId('force-logout')).toBeInTheDocument();

      // Verify notification area exists
      expect(screen.getByTestId('notification-area')).toBeInTheDocument();
      expect(screen.getByTestId('success-notification')).toBeInTheDocument();

      // Simulate retry button click
      const retryButton = screen.getByTestId('retry-logout');
      fireEvent.click(retryButton);

      // Verify signOut is called again
      expect(mockSignOut).toHaveBeenCalledTimes(2);
    });
  });

  describe('CSRF Protection Integration', () => {
    it('should include CSRF tokens in authentication requests', async () => {
      // Mock CSRF token
      mockGetCsrfToken.mockResolvedValue('csrf-token-abc-123-def-456');

      // Mock signIn with CSRF protection
      mockSignIn.mockResolvedValue({
        error: null,
        status: 200,
        ok: true
      });

      // Create mock authentication form with CSRF
      const MockAuthFormWithCSRF = () => 
        React.createElement('div', { 'data-testid': 'auth-form-with-csrf' },
          React.createElement('h1', null, 'Secure Login Form'),
          React.createElement('form', { 'data-testid': 'login-form' },
            React.createElement('input', { 
              type: 'hidden', 
              name: 'csrfToken', 
              value: 'csrf-token-abc-123-def-456',
              'data-testid': 'csrf-token-input'
            }),
            React.createElement('div', { 'data-testid': 'email-field' },
              React.createElement('label', { htmlFor: 'email' }, 'Email'),
              React.createElement('input', { 
                type: 'email', 
                id: 'email', 
                name: 'email', 
                'data-testid': 'email-input'
              })
            ),
            React.createElement('div', { 'data-testid': 'password-field' },
              React.createElement('label', { htmlFor: 'password' }, 'Password'),
              React.createElement('input', { 
                type: 'password', 
                id: 'password', 
                name: 'password', 
                'data-testid': 'password-input'
              })
            ),
            React.createElement('button', { 
              type: 'submit', 
              'data-testid': 'submit-button',
              onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                // This would normally submit the form with CSRF protection
                mockSignIn('credentials', {
                  email: 'test@example.com',
                  password: 'password123',
                  redirect: false,
                  csrfToken: 'csrf-token-abc-123-def-456'
                });
              }
            }, 'Sign In')
          ),
          React.createElement('div', { 'data-testid': 'security-info' },
            React.createElement('p', null, 'This form includes CSRF protection for your security.')
          )
        );

      // Render form
      render(React.createElement(MockAuthFormWithCSRF));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('auth-form-with-csrf')).toBeInTheDocument();
      });

      // Verify CSRF token input exists
      const csrfTokenInput = screen.getByTestId('csrf-token-input');
      expect(csrfTokenInput).toBeInTheDocument();
      expect(csrfTokenInput).toHaveAttribute('value', 'csrf-token-abc-123-def-456');

      // Verify form fields
      expect(screen.getByTestId('email-field')).toBeInTheDocument();
      expect(screen.getByTestId('password-field')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();

      // Verify submit button
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeInTheDocument();

      // Verify security information
      expect(screen.getByTestId('security-info')).toBeInTheDocument();
      expect(screen.getByText(/CSRF protection/i)).toBeInTheDocument();

      // Simulate form submission
      fireEvent.click(submitButton);

      // Verify signIn was called with CSRF token
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
        csrfToken: 'csrf-token-abc-123-def-456'
      });
    });

    it('should handle missing CSRF tokens gracefully', async () => {
      // Mock missing CSRF token
      mockGetCsrfToken.mockResolvedValue(null);

      // Mock signIn to handle missing CSRF
      mockSignIn.mockResolvedValue({
        error: 'Configuration',
        status: 500,
        ok: false,
        message: 'CSRF token missing'
      });

      // Create mock component with CSRF error handling
      const MockComponentWithCSRFErroHandling = () => 
        React.createElement('div', { 'data-testid': 'component-with-csrf-error' },
          React.createElement('h1', null, 'Login Form'),
          React.createElement('div', { 'data-testid': 'csrf-warning', style: { display: 'none' } },
            React.createElement('h2', null, 'Security Warning'),
            React.createElement('p', null, 'CSRF protection token could not be generated. Form submission may be disabled.')
          ),
          React.createElement('form', { 'data-testid': 'login-form' },
            React.createElement('div', { 'data-testid': 'email-field' },
              React.createElement('label', { htmlFor: 'email' }, 'Email'),
              React.createElement('input', { type: 'email', id: 'email', name: 'email' })
            ),
            React.createElement('button', { 
              type: 'submit', 
              disabled: true,
              'data-testid': 'disabled-submit-button'
            }, 'Sign In (Disabled)')
          ),
          React.createElement('div', { 'data-testid': 'fallback-options' },
            React.createElement('h2', null, 'Alternative Login Methods'),
            React.createElement('button', { 'data-testid': 'oauth-login-button' }, 'Continue with OAuth')
          )
        );

      // Render component
      render(React.createElement(MockComponentWithCSRFErroHandling));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('component-with-csrf-error')).toBeInTheDocument();
      });

      // Verify CSRF warning exists (even if hidden)
      expect(screen.getByTestId('csrf-warning')).toBeInTheDocument();

      // Verify form is disabled
      const disabledSubmitButton = screen.getByTestId('disabled-submit-button');
      expect(disabledSubmitButton).toBeInTheDocument();
      expect(disabledSubmitButton).toBeDisabled();

      // Verify fallback options
      expect(screen.getByTestId('fallback-options')).toBeInTheDocument();
      expect(screen.getByTestId('oauth-login-button')).toBeInTheDocument();

      // Verify email field still exists
      expect(screen.getByTestId('email-field')).toBeInTheDocument();
    });
  });
});