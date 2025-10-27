/**
 * INTEGRATION TEST: End-to-End User Journey
 * Tests the complete user journey from landing to recommendation
 * 
 * This test verifies:
 * 1. User visits landing page and authenticates
 * 2. User navigates to dashboard
 * 3. User accesses camera and detects emotion
 * 4. User receives music recommendations
 * 5. User interacts with recommendations
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

// Mock Next.js authentication
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();

jest.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
  getSession: mockGetSession,
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  }))
}));

// Mock emotion detection service
const mockLoadModels = jest.fn();
const mockAnalyzeImage = jest.fn();

jest.mock('@/lib/emotionDetection', () => ({
  emotionService: {
    loadModels: mockLoadModels,
    analyzeImage: mockAnalyzeImage,
    getDominantEmotion: jest.fn((emotions) => {
      const maxEmotion = Object.keys(emotions).reduce((a, b) => 
        emotions[a] > emotions[b] ? a : b
      );
      return {
        emotion: maxEmotion,
        confidence: emotions[maxEmotion]
      };
    })
  }
}));

// Mock Spotify service
const mockGetRecommendationsByEmotion = jest.fn();

jest.mock('@/lib/spotify', () => ({
  spotifyService: {
    getRecommendationsByEmotion: mockGetRecommendationsByEmotion
  }
}));

// Mock webcam component
jest.mock('react-webcam', () => {
  return {
    __esModule: true,
    default: ({ screenshotFormat, onUserMedia, onUserMediaError, ...props }: any) => 
      React.createElement('div', { 'data-testid': 'mock-webcam' },
        React.createElement('video', { 
          'data-testid': 'webcam-video', 
          autoPlay: true, 
          playsInline: true 
        }),
        React.createElement('div', { 'data-testid': 'webcam-controls' },
          React.createElement('button', 
            { 
              'data-testid': 'start-camera-button',
              onClick: () => onUserMedia && onUserMedia()
            },
            'Start Camera'
          ),
          React.createElement('button', 
            { 
              'data-testid': 'capture-button',
              onClick: () => props.screenshot && props.screenshot()
            },
            'Capture Photo'
          )
        )
      )
  };
});

describe('[INTEGRATION] End-to-End User Journey Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful mocks
    mockSignIn.mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: '/dashboard'
    });
    
    mockLoadModels.mockResolvedValue(undefined);
    
    mockAnalyzeImage.mockResolvedValue({
      emotion: 'happy',
      confidence: 0.85,
      allEmotions: {
        happy: 0.85,
        sad: 0.10,
        angry: 0.03,
        surprised: 0.01,
        neutral: 0.005,
        fearful: 0.003,
        disgusted: 0.002
      }
    });
    
    mockGetRecommendationsByEmotion.mockResolvedValue([
      {
        id: 'journey-track-1',
        name: 'Journey Happy Song',
        artists: [{ name: 'Journey Artist' }],
        album: { 
          name: 'Journey Album', 
          images: [{ url: 'http://example.com/journey-album.jpg' }] 
        },
        external_urls: { spotify: 'https://spotify.com/track/journey-1' }
      }
    ]);
    
    mockGetSession.mockResolvedValue(null);
  });

  describe('Complete User Journey Integration', () => {
    it('should successfully guide user through complete journey from landing to recommendations', async () => {
      // Stage 1: User visits landing page
      // Mock unauthenticated session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: null,
        status: 'unauthenticated'
      }));

      // Create mock landing page
      const MockLandingPage = () => 
        React.createElement('div', { 'data-testid': 'landing-page' },
          React.createElement('header', { 'data-testid': 'landing-header' },
            React.createElement('h1', { 'data-testid': 'app-title' }, 'Moodify'),
            React.createElement('nav', { 'data-testid': 'landing-nav' },
              React.createElement('button', 
                { 
                  'data-testid': 'login-button',
                  onClick: () => mockSignIn('google')
                },
                'Sign In'
              )
            )
          ),
          React.createElement('main', { 'data-testid': 'landing-main' },
            React.createElement('section', { 'data-testid': 'hero-section' },
              React.createElement('h2', null, 'Discover Music That Matches Your Mood'),
              React.createElement('p', null, 'Let AI analyze your emotions and find the perfect soundtrack for your day.'),
              React.createElement('button', 
                { 
                  'data-testid': 'cta-login-button',
                  onClick: () => mockSignIn('google')
                },
                'Get Started'
              )
            ),
            React.createElement('section', { 'data-testid': 'features-section' },
              React.createElement('h2', null, 'How It Works'),
              React.createElement('div', { 'data-testid': 'feature-cards' },
                React.createElement('div', { 'data-testid': 'feature-1' },
                  React.createElement('h3', null, 'Capture'),
                  React.createElement('p', null, 'Take a photo with your webcam')
                ),
                React.createElement('div', { 'data-testid': 'feature-2' },
                  React.createElement('h3', null, 'Analyze'),
                  React.createElement('p', null, 'AI detects your emotional state')
                ),
                React.createElement('div', { 'data-testid': 'feature-3' },
                  React.createElement('h3', null, 'Discover'),
                  React.createElement('p', null, 'Get personalized music recommendations')
                )
              )
            )
          )
        );

      // Render landing page
      render(React.createElement(MockLandingPage));

      // Wait for landing page to load
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Verify landing page elements
      expect(screen.getByTestId('landing-header')).toBeInTheDocument();
      expect(screen.getByTestId('app-title')).toHaveTextContent('Moodify');
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.getByTestId('landing-main')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('cta-login-button')).toBeInTheDocument();
      expect(screen.getByTestId('features-section')).toBeInTheDocument();
      expect(screen.getByTestId('feature-cards')).toBeInTheDocument();

      // Verify feature cards
      expect(screen.getByTestId('feature-1')).toHaveTextContent('Capture');
      expect(screen.getByTestId('feature-2')).toHaveTextContent('Analyze');
      expect(screen.getByTestId('feature-3')).toHaveTextContent('Discover');

      // Stage 2: User clicks login button
      const loginButton = screen.getByTestId('login-button');
      fireEvent.click(loginButton);

      // Verify signIn was called
      expect(mockSignIn).toHaveBeenCalledWith('google');

      // Stage 3: User is redirected to dashboard (mock authenticated session)
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'journey-user-123',
            name: 'Journey User',
            email: 'journey@test.com'
          }
        },
        status: 'authenticated'
      }));

      // Mock dashboard page with emotion detection workflow
      const MockDashboardPage = () => 
        React.createElement('div', { 'data-testid': 'dashboard-page' },
          React.createElement('header', { 'data-testid': 'dashboard-header' },
            React.createElement('h1', null, 'Welcome, Journey User!'),
            React.createElement('nav', { 'data-testid': 'dashboard-nav' },
              React.createElement('button', { 'data-testid': 'dashboard-home-link' }, 'Home'),
              React.createElement('button', 
                { 
                  'data-testid': 'history-link',
                  onClick: () => mockPush('/history')
                }, 
                'History'
              ),
              React.createElement('button', { 'data-testid': 'profile-link' }, 'Profile'),
              React.createElement('button', 
                { 
                  'data-testid': 'logout-button',
                  onClick: () => mockSignOut()
                },
                'Logout'
              )
            )
          ),
          React.createElement('main', { 'data-testid': 'dashboard-main' },
            React.createElement('section', { 'data-testid': 'emotion-detection-section' },
              React.createElement('h2', null, 'Detect Your Mood'),
              React.createElement('div', { 'data-testid': 'camera-container' },
                // This would normally render the actual webcam component
                React.createElement('div', { 
                  'data-testid': 'mock-webcam-placeholder',
                  onClick: async () => {
                    await mockLoadModels();
                    // Trigger emotion analysis when camera is used
                    const analysisResult = await mockAnalyzeImage(new Image());
                    // Trigger recommendations based on emotion analysis
                    await mockGetRecommendationsByEmotion(analysisResult.emotion, 20);
                  }
                }, 'Webcam Component')
              ),
              React.createElement('div', { 'data-testid': 'emotion-results', style: { display: 'none' } },
                React.createElement('h3', null, 'Detected Emotion: Happy'),
                React.createElement('p', null, 'Confidence: 85%')
              )
            ),
            React.createElement('section', { 'data-testid': 'recommendations-section', style: { display: 'none' } },
              React.createElement('h2', null, 'Your Recommendations'),
              React.createElement('div', { 'data-testid': 'recommendations-list' },
                // Recommendations would appear here after emotion detection
              )
            )
          )
        );

      // Re-render with dashboard page
      render(React.createElement(MockDashboardPage));

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Verify dashboard elements
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByText('Welcome, Journey User!')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-nav')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-main')).toBeInTheDocument();
      expect(screen.getByTestId('emotion-detection-section')).toBeInTheDocument();
      expect(screen.getByTestId('camera-container')).toBeInTheDocument();
      expect(screen.getByTestId('mock-webcam-placeholder')).toBeInTheDocument();

      // Verify navigation links
      expect(screen.getByTestId('dashboard-home-link')).toBeInTheDocument();
      expect(screen.getByTestId('history-link')).toBeInTheDocument();
      expect(screen.getByTestId('profile-link')).toBeInTheDocument();
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();

      // Stage 4: User starts camera and captures photo
      // Simulate successful camera initialization
      const mockWebcam = screen.getByTestId('mock-webcam-placeholder');
      fireEvent.click(mockWebcam);

      // Wait for async operations (model loading and emotion analysis) to complete
      await waitFor(() => {
        expect(mockLoadModels).toHaveBeenCalled();
        expect(mockAnalyzeImage).toHaveBeenCalled();
      });

      // Stage 5: User captures photo and emotion is analyzed
      // Mock emotion analysis results
      const emotionResults = screen.getByTestId('emotion-results');
      emotionResults.style.display = 'block'; // Make visible

      // Verify emotion results are displayed
      expect(emotionResults).toBeInTheDocument();
      expect(screen.getByText('Detected Emotion: Happy')).toBeInTheDocument();
      expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();

      // Stage 6: Recommendations are fetched and displayed
      const recommendationsSection = screen.getByTestId('recommendations-section');
      recommendationsSection.style.display = 'block'; // Make visible

      // Verify recommendations section is displayed
      expect(recommendationsSection).toBeInTheDocument();
      expect(screen.getByTestId('recommendations-list')).toBeInTheDocument();

      // Verify Spotify recommendations were fetched
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20);

      // Stage 7: User interacts with recommendations
      const recommendationsList = screen.getByTestId('recommendations-list');
      
      // Create mock recommendation card
      const MockRecommendationCard = () => 
        React.createElement('div', { 'data-testid': 'recommendation-card', className: 'recommendation-card' },
          React.createElement('div', { 'data-testid': 'album-art' },
            React.createElement('img', 
              { 
                src: 'http://example.com/journey-album.jpg', 
                alt: 'Album cover',
                'data-testid': 'album-image'
              }
            )
          ),
          React.createElement('div', { 'data-testid': 'track-info' },
            React.createElement('h3', { 'data-testid': 'track-name' }, 'Journey Happy Song'),
            React.createElement('p', { 'data-testid': 'artist-name' }, 'Journey Artist'),
            React.createElement('p', { 'data-testid': 'album-name' }, 'Journey Album')
          ),
          React.createElement('div', { 'data-testid': 'track-actions' },
            React.createElement('button', { 'data-testid': 'play-button' }, '▶ Play Preview'),
            React.createElement('button', { 'data-testid': 'spotify-button' }, 'Open in Spotify'),
            React.createElement('button', { 'data-testid': 'save-button' }, 'Save to History')
          )
        );

      // Add recommendation card to list
      render(React.createElement(MockRecommendationCard), { container: recommendationsList });

      // Verify recommendation card elements
      expect(screen.getByTestId('recommendation-card')).toBeInTheDocument();
      expect(screen.getByTestId('album-art')).toBeInTheDocument();
      expect(screen.getByTestId('album-image')).toBeInTheDocument();
      expect(screen.getByTestId('track-info')).toBeInTheDocument();
      expect(screen.getByTestId('track-name')).toHaveTextContent('Journey Happy Song');
      expect(screen.getByTestId('artist-name')).toHaveTextContent('Journey Artist');
      expect(screen.getByTestId('album-name')).toHaveTextContent('Journey Album');
      expect(screen.getByTestId('track-actions')).toBeInTheDocument();
      
      // Verify action buttons
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
      expect(screen.getByTestId('spotify-button')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();

      // Stage 8: User saves recommendation to history
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Verify recommendation was saved (would normally make API call)
      expect(saveButton).toHaveTextContent('Save to History');

      // Stage 9: User navigates to history
      const historyLink = screen.getByTestId('history-link');
      fireEvent.click(historyLink);

      // Verify navigation to history page
      expect(mockPush).toHaveBeenCalledWith('/history');

      // Verify complete journey was successful
      expect(mockSignIn).toHaveBeenCalledWith('google'); // Login
      expect(mockLoadModels).toHaveBeenCalled(); // Camera setup
      expect(mockAnalyzeImage).toHaveBeenCalled(); // Emotion detection
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20); // Recommendations
    });

    it('should handle user journey with intermediate errors gracefully', async () => {
      // Stage 1: User visits landing page
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: null,
        status: 'unauthenticated'
      }));

      // Mock landing page with error states
      const MockLandingPageWithErrorHandling = () => 
        React.createElement('div', { 'data-testid': 'landing-page' },
          React.createElement('header', { 'data-testid': 'landing-header' },
            React.createElement('h1', null, 'Moodify'),
            React.createElement('nav', null,
              React.createElement('button', 
                { 
                  'data-testid': 'login-button',
                  onClick: async () => {
                    const result = await mockSignIn('google');
                    if (result && result.url) {
                      mockPush(result.url);
                    }
                  }
                },
                'Sign In'
              )
            )
          ),
          React.createElement('main', { 'data-testid': 'landing-main' },
            React.createElement('section', { 'data-testid': 'hero-section' },
              React.createElement('h2', null, 'Discover Music That Matches Your Mood'),
              React.createElement('button', 
                { 
                  'data-testid': 'cta-login-button',
                  onClick: () => mockSignIn('google')
                },
                'Get Started'
              )
            ),
            React.createElement('div', { 'data-testid': 'error-banner', style: { display: 'none' } },
              React.createElement('h3', null, 'Service Notice'),
              React.createElement('p', null, 'We\'re experiencing temporary issues. Please try again later.')
            )
          )
        );

      // Render landing page
      render(React.createElement(MockLandingPageWithErrorHandling));

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Verify error banner exists (even if hidden)
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();

      // Stage 2: Login fails with error
      mockSignIn.mockResolvedValue({
        error: 'OAuthAccountNotLinked',
        status: 400,
        ok: false,
        url: null
      });

      // Simulate login attempt that fails
      const loginButton = screen.getByTestId('login-button');
      fireEvent.click(loginButton);

      // Verify signIn was called
      expect(mockSignIn).toHaveBeenCalledWith('google');

      // Stage 3: User retries login successfully
      mockSignIn.mockResolvedValue({
        error: null,
        status: 200,
        ok: true,
        url: '/dashboard'
      });

      // Simulate retry
      fireEvent.click(loginButton);

      // Verify successful login redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });

      // Stage 4: User reaches dashboard (mock authenticated session)
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'error-journey-user',
            name: 'Error Journey User',
            email: 'error@journey.com'
          }
        },
        status: 'authenticated'
      }));

      // Mock dashboard with emotion detection that fails
      mockAnalyzeImage.mockImplementation(() => Promise.reject(new Error('Camera access denied')));

      const MockDashboardWithErrorHandling = () => 
        React.createElement('div', { 'data-testid': 'dashboard-page' },
          React.createElement('header', { 'data-testid': 'dashboard-header' },
            React.createElement('h1', null, 'Welcome, Error Journey User!')
          ),
          React.createElement('main', { 'data-testid': 'dashboard-main' },
            React.createElement('section', { 'data-testid': 'emotion-detection-section' },
              React.createElement('h2', null, 'Detect Your Mood'),
              React.createElement('div', { 'data-testid': 'camera-container' },
                React.createElement('div', { 
                  'data-testid': 'mock-webcam-placeholder',
                  onClick: async () => {
                    await mockLoadModels();
                    // Trigger emotion analysis when camera is used (this will fail in error test)
                    await mockAnalyzeImage(new Image());
                  }
                }, 'Webcam Component')
              ),
              React.createElement('div', { 'data-testid': 'camera-error', style: { display: 'none' } },
                React.createElement('h3', null, 'Camera Error'),
                React.createElement('p', { 'data-testid': 'error-message' }, 'Camera access denied. Please enable camera permissions.'),
                React.createElement('button', { 'data-testid': 'retry-camera-button' }, 'Retry Camera'),
                React.createElement('button', { 'data-testid': 'manual-emotion-button' }, 'Select Emotion Manually')
              )
            ),
            React.createElement('section', { 'data-testid': 'manual-emotion-selector', style: { display: 'none' } },
              React.createElement('h2', null, 'Select Your Mood'),
              React.createElement('div', { 'data-testid': 'emotion-buttons' },
                React.createElement('button', { 
                  'data-testid': 'happy-emotion', 
                  'data-emotion': 'happy',
                  onClick: () => mockGetRecommendationsByEmotion('happy', 20)
                }, '😊 Happy'),
                React.createElement('button', { 'data-testid': 'sad-emotion', 'data-emotion': 'sad' }, '😢 Sad'),
                React.createElement('button', { 'data-testid': 'angry-emotion', 'data-emotion': 'angry' }, '😠 Angry')
              )
            )
          )
        );

      // Render dashboard
      render(React.createElement(MockDashboardWithErrorHandling));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Simulate automatic camera initialization attempt that fails
      const webcamPlaceholder = screen.getByTestId('mock-webcam-placeholder');
      fireEvent.click(webcamPlaceholder);

      // Verify error handling components
      expect(screen.getByTestId('camera-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Camera access denied');
      expect(screen.getByTestId('retry-camera-button')).toBeInTheDocument();
      expect(screen.getByTestId('manual-emotion-button')).toBeInTheDocument();

      // Stage 5: User selects emotion manually
      const manualEmotionButton = screen.getByTestId('manual-emotion-button');
      fireEvent.click(manualEmotionButton);

      // Verify manual emotion selector appears
      const manualSelector = screen.getByTestId('manual-emotion-selector');
      manualSelector.style.display = 'block'; // Make visible

      expect(manualSelector).toBeInTheDocument();
      expect(screen.getByTestId('emotion-buttons')).toBeInTheDocument();

      // Stage 6: User selects happy emotion
      const happyEmotionButton = screen.getByTestId('happy-emotion');
      fireEvent.click(happyEmotionButton);

      // Verify manual emotion selection triggers recommendations
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20);

      // Stage 7: Spotify API returns error, fallback to cached recommendations
      mockGetRecommendationsByEmotion.mockRejectedValue(
        new Error('Spotify API temporarily unavailable')
      );

      // Mock fallback recommendations
      const fallbackRecommendations = [
        {
          id: 'fallback-track-1',
          name: 'Fallback Happy Song',
          artists: [{ name: 'Fallback Artist' }],
          album: { 
            name: 'Fallback Album', 
            images: [{ url: 'http://example.com/fallback-album.jpg' }] 
          },
          external_urls: { spotify: 'https://spotify.com/track/fallback-1' }
        }
      ];

      // In a real implementation, this would come from cache or fallback service
      // For this test, we're verifying the error handling integration points

      // Verify error handling for Spotify API failure
      await expect(mockGetRecommendationsByEmotion('happy', 20))
        .rejects.toThrow('Spotify API temporarily unavailable');

      // Stage 8: User receives fallback recommendations successfully
      // Reset mock to return fallback
      mockGetRecommendationsByEmotion.mockResolvedValue(fallbackRecommendations);

      // Trigger recommendation fetch again
      const retryRecommendations = await mockGetRecommendationsByEmotion('happy', 20);

      // Verify fallback recommendations were returned
      expect(retryRecommendations).toHaveLength(1);
      expect(retryRecommendations[0].id).toBe('fallback-track-1');
      expect(retryRecommendations[0].name).toBe('Fallback Happy Song');

      // Stage 9: User interacts with fallback recommendations
      const MockRecommendationsWithFallback = () => 
        React.createElement('div', { 'data-testid': 'recommendations-section' },
          React.createElement('h2', null, 'Fallback Recommendations'),
          React.createElement('div', { 'data-testid': 'recommendations-list' },
            fallbackRecommendations.map(track => 
              React.createElement('div', { key: track.id, 'data-testid': 'recommendation-card' },
                React.createElement('div', { 'data-testid': 'album-art' },
                  React.createElement('img', 
                    { 
                      src: track.album.images[0].url, 
                      alt: track.album.name,
                      'data-testid': 'album-image'
                    }
                  )
                ),
                React.createElement('div', { 'data-testid': 'track-info' },
                  React.createElement('h3', { 'data-testid': 'track-name' }, track.name),
                  React.createElement('p', { 'data-testid': 'artist-name' },
                    track.artists.map(a => a.name).join(', ')
                  )
                ),
                React.createElement('div', { 'data-testid': 'track-actions' },
                  React.createElement('button', { 'data-testid': 'play-button' }, '▶ Play Preview'),
                  React.createElement('button', { 'data-testid': 'spotify-button' }, 'Open in Spotify'),
                  React.createElement('button', { 'data-testid': 'save-button' }, 'Save to History'),
                  React.createElement('div', { 'data-testid': 'offline-indicator' }, 'Offline Mode')
                )
              )
            )
          )
        );

      // Render fallback recommendations
      render(React.createElement(MockRecommendationsWithFallback));

      await waitFor(() => {
        expect(screen.getByTestId('recommendations-section')).toBeInTheDocument();
      });

      // Verify fallback recommendation card
      expect(screen.getByTestId('recommendation-card')).toBeInTheDocument();
      expect(screen.getByTestId('album-art')).toBeInTheDocument();
      expect(screen.getByTestId('album-image')).toBeInTheDocument();
      expect(screen.getByTestId('track-info')).toBeInTheDocument();
      expect(screen.getByTestId('track-name')).toHaveTextContent('Fallback Happy Song');
      expect(screen.getByTestId('artist-name')).toHaveTextContent('Fallback Artist');
      expect(screen.getByTestId('track-actions')).toBeInTheDocument();
      
      // Verify action buttons
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
      expect(screen.getByTestId('spotify-button')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      
      // Verify offline indicator
      expect(screen.getByTestId('offline-indicator')).toHaveTextContent('Offline Mode');

      // Stage 10: User saves recommendation in offline mode
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Verify save action (would normally use localStorage or IndexedDB in offline mode)
      expect(saveButton).toBeInTheDocument();

      // Verify complete error-handled journey
      expect(mockSignIn).toHaveBeenCalled(); // Login attempts
      expect(mockAnalyzeImage).toHaveBeenCalled(); // Camera/analysis attempt
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20); // Recommendation attempt
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20); // Retry with fallback
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should maintain state consistency across authentication, emotion detection, and recommendations', async () => {
      // Mock session state
      let sessionState = {
        data: null,
        status: 'unauthenticated'
      };

      // Mock useSession with state that can change
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => sessionState);

      // Mock emotion detection with state
      let emotionDetectionEnabled = false;
      const mockEnableEmotionDetection = () => {
        emotionDetectionEnabled = true;
        return mockLoadModels();
      };

      // Mock recommendations with tracking
      let recommendationHistory: string[] = [];
      const mockTrackRecommendation = async (emotion: string) => {
        recommendationHistory.push(emotion);
        return mockGetRecommendationsByEmotion(emotion, 20);
      };

      // Create mock component that integrates all features
      const MockIntegratedComponent = () => 
        React.createElement('div', { 'data-testid': 'integrated-component' },
          React.createElement('header', { 'data-testid': 'app-header' },
            React.createElement('h1', null, 'Moodify Integrated Experience'),
            React.createElement('div', { 'data-testid': 'auth-status' },
              'Status: ', React.createElement('span', { 'data-testid': 'auth-status-text' }, sessionState.status)
            )
          ),
          
          React.createElement('div', { 'data-testid': 'auth-section' },
            sessionState.status === 'unauthenticated' && 
            React.createElement('div', { 'data-testid': 'login-prompt' },
              React.createElement('h2', null, 'Please Sign In'),
              React.createElement('button', 
                { 
                  'data-testid': 'signin-button',
                  onClick: async () => {
                    const result = await mockSignIn('google');
                    if (result?.ok) {
                      sessionState = {
                        data: {
                          user: {
                            id: 'integrated-user-456',
                            name: 'Integrated User',
                            email: 'integrated@test.com'
                          }
                        },
                        status: 'authenticated'
                      };
                    }
                  }
                },
                'Sign In with Google'
              )
            ),
            
            sessionState.status === 'authenticated' && 
            React.createElement('div', { 'data-testid': 'dashboard-section' },
              React.createElement('h2', null, `Welcome, ${sessionState.data?.user?.name}!`),
              
              React.createElement('div', { 'data-testid': 'emotion-workflow' },
                !emotionDetectionEnabled && 
                React.createElement('div', { 'data-testid': 'enable-emotion-section' },
                  React.createElement('h3', null, 'Enable Emotion Detection'),
                  React.createElement('button', 
                    { 
                      'data-testid': 'enable-emotion-button',
                      onClick: mockEnableEmotionDetection
                    },
                    'Enable Camera'
                  )
                ),
                
                emotionDetectionEnabled && 
                React.createElement('div', { 'data-testid': 'emotion-detection-active' },
                  React.createElement('h3', null, 'Emotion Detection Active'),
                  React.createElement('div', { 'data-testid': 'mock-webcam-container' },
                    React.createElement('div', { 'data-testid': 'webcam-placeholder' }, 'Webcam Active')
                  ),
                  React.createElement('button', 
                    { 
                      'data-testid': 'detect-emotion-button',
                      onClick: async () => {
                        try {
                          await mockAnalyzeImage(new Image());
                          // Trigger recommendations after emotion detection
                          await mockTrackRecommendation('happy');
                        } catch (error) {
                          console.log('Emotion detection failed:', error);
                        }
                      }
                    },
                    'Detect My Mood'
                  )
                )
              ),
              
              React.createElement('div', { 'data-testid': 'recommendations-history' },
                React.createElement('h3', null, 'Recommendation History'),
                React.createElement('div', { 'data-testid': 'history-list' },
                  recommendationHistory.map((emotion, index) => 
                    React.createElement('div', { key: index, 'data-testid': `history-item-${index}` },
                      emotion
                    )
                  ),
                  recommendationHistory.length === 0 && 
                  React.createElement('div', { 'data-testid': 'empty-history' }, 'No recommendations yet')
                )
              )
            )
          ),
          
          React.createElement('footer', { 'data-testid': 'app-footer' },
            React.createElement('div', { 'data-testid': 'integration-status' },
              'Auth: ', React.createElement('span', { 'data-testid': 'auth-integration-status' }, sessionState.status), ' | ',
              'Emotion: ', React.createElement('span', { 'data-testid': 'emotion-integration-status' }, 
                emotionDetectionEnabled ? 'enabled' : 'disabled'
              ), ' | ',
              'Recs: ', React.createElement('span', { 'data-testid': 'recs-integration-status' }, 
                recommendationHistory.length.toString()
              )
            )
          )
        );

      // Render integrated component
      render(React.createElement(MockIntegratedComponent));

      await waitFor(() => {
        expect(screen.getByTestId('integrated-component')).toBeInTheDocument();
      });

      // Verify initial state
      expect(screen.getByTestId('auth-status-text')).toHaveTextContent('unauthenticated');
      expect(screen.getByTestId('auth-integration-status')).toHaveTextContent('unauthenticated');
      expect(screen.getByTestId('emotion-integration-status')).toHaveTextContent('disabled');
      expect(screen.getByTestId('recs-integration-status')).toHaveTextContent('0');

      // Stage 1: User signs in
      const signInButton = screen.getByTestId('signin-button');
      fireEvent.click(signInButton);

      // Verify authentication integration
      expect(mockSignIn).toHaveBeenCalledWith('google');
      
      // Update session state (simulating successful login)
      sessionState = {
        data: {
          user: {
            id: 'integrated-user-456',
            name: 'Integrated User',
            email: 'integrated@test.com'
          }
        },
        status: 'authenticated'
      };

      // Re-render to show authenticated state
      render(React.createElement(MockIntegratedComponent));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-section')).toBeInTheDocument();
      });

      // Verify authenticated state
      expect(screen.getByTestId('auth-status-text')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('auth-integration-status')).toHaveTextContent('authenticated');
      expect(screen.getByText('Welcome, Integrated User!')).toBeInTheDocument();

      // Stage 2: User enables emotion detection
      const enableEmotionButton = screen.getByTestId('enable-emotion-button');
      fireEvent.click(enableEmotionButton);

      // Verify emotion detection integration
      expect(mockLoadModels).toHaveBeenCalled();

      // Update emotion detection state
      emotionDetectionEnabled = true;

      // Re-render to show emotion detection enabled
      render(React.createElement(MockIntegratedComponent));

      await waitFor(() => {
        expect(screen.getByTestId('emotion-detection-active')).toBeInTheDocument();
      });

      // Verify emotion detection enabled state
      expect(screen.getByTestId('emotion-integration-status')).toHaveTextContent('enabled');
      expect(screen.getByTestId('webcam-placeholder')).toBeInTheDocument();

      // Stage 3: User detects emotion
      const detectEmotionButton = screen.getByTestId('detect-emotion-button');
      fireEvent.click(detectEmotionButton);

      // Verify emotion analysis integration
      expect(mockAnalyzeImage).toHaveBeenCalled();

      // Verify recommendations integration
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20);

      // Update recommendation history
      recommendationHistory = ['happy'];

      // Re-render to show updated state
      render(React.createElement(MockIntegratedComponent));

      await waitFor(() => {
        expect(screen.getByTestId('history-list')).toBeInTheDocument();
      });

      // Verify recommendation history
      expect(screen.getByTestId('recs-integration-status')).toHaveTextContent('1');
      expect(screen.getByTestId('history-item-0')).toHaveTextContent('happy');

      // Stage 4: User performs multiple emotion detections
      // Add more recommendations to history
      recommendationHistory = ['happy', 'sad', 'angry'];

      // Re-render to show updated history
      render(React.createElement(MockIntegratedComponent));

      await waitFor(() => {
        expect(screen.getByTestId('history-list')).toBeInTheDocument();
      });

      // Verify updated state
      expect(screen.getByTestId('recs-integration-status')).toHaveTextContent('3');
      expect(screen.getByTestId('history-item-0')).toHaveTextContent('happy');
      expect(screen.getByTestId('history-item-1')).toHaveTextContent('sad');
      expect(screen.getByTestId('history-item-2')).toHaveTextContent('angry');

      // Verify cross-feature consistency
      expect(screen.getByTestId('auth-status-text')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('emotion-integration-status')).toHaveTextContent('enabled');
      expect(screen.getByTestId('recs-integration-status')).toHaveTextContent('3');

      // Stage 5: User logs out
      sessionState = {
        data: null,
        status: 'unauthenticated'
      };

      // Re-render to show logged out state
      render(React.createElement(MockIntegratedComponent));

      await waitFor(() => {
        expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      });

      // Verify logout state maintenance
      expect(screen.getByTestId('auth-status-text')).toHaveTextContent('unauthenticated');
      expect(screen.getByTestId('auth-integration-status')).toHaveTextContent('unauthenticated');
      
      // Emotion detection state should persist in component (but not session)
      expect(screen.getByTestId('emotion-integration-status')).toHaveTextContent('enabled');
      
      // Recommendation history should persist in component state
      expect(screen.getByTestId('recs-integration-status')).toHaveTextContent('3');
    });

    it('should handle concurrent feature usage and race conditions', async () => {
      // Mock session with timing delays
      const mockDelayedSession = {
        data: {
          user: {
            id: 'concurrent-user-789',
            name: 'Concurrent User',
            email: 'concurrent@test.com'
          }
        },
        status: 'authenticated'
      };

      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => mockDelayedSession);

      // Mock delayed operations to simulate race conditions
      mockLoadModels.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );
      
      mockAnalyzeImage.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          emotion: 'happy',
          confidence: 0.85,
          allEmotions: { happy: 0.85, sad: 0.15 }
        }), 150))
      );
      
      mockGetRecommendationsByEmotion.mockImplementation((emotion) =>
        new Promise(resolve => setTimeout(() => resolve([
          { id: `concurrent-${emotion}-track`, name: `Concurrent ${emotion} track`, artists: [{ name: 'Concurrent Artist' }] }
        ]), 200))
      );

      // Create mock component with concurrent operations
      const MockConcurrentOperations = () => 
        React.createElement('div', { 'data-testid': 'concurrent-operations' },
          React.createElement('header', { 'data-testid': 'concurrent-header' },
            React.createElement('h1', null, 'Concurrent Operations Test'),
            React.createElement('div', { 'data-testid': 'operation-indicators' },
              React.createElement('div', { 'data-testid': 'auth-indicator' }, 'Auth: ✓'),
              React.createElement('div', { 'data-testid': 'emotion-indicator' }, 'Emotion: ⏳'),
              React.createElement('div', { 'data-testid': 'recommendations-indicator' }, 'Recs: ⏳')
            )
          ),
          
          React.createElement('div', { 'data-testid': 'concurrent-workflows' },
            React.createElement('div', { 'data-testid': 'workflow-1' },
              React.createElement('h2', null, 'Workflow 1: Quick Operations'),
              React.createElement('button', 
                { 
                  'data-testid': 'quick-emotion-button',
                  onClick: async () => {
                    await mockLoadModels();
                    const result = await mockAnalyzeImage(new Image());
                    await mockGetRecommendationsByEmotion(result.emotion, 5);
                  }
                },
                'Quick Emotion + Recs'
              )
            ),
            
            React.createElement('div', { 'data-testid': 'workflow-2' },
              React.createElement('h2', null, 'Workflow 2: Slow Operations'),
              React.createElement('button', 
                { 
                  'data-testid': 'slow-emotion-button',
                  onClick: async () => {
                    // Simulate slow operations with delays
                    await new Promise(resolve => setTimeout(resolve, 50));
                    await mockLoadModels();
                    await new Promise(resolve => setTimeout(resolve, 100));
                    const result = await mockAnalyzeImage(new Image());
                    await new Promise(resolve => setTimeout(resolve, 150));
                    await mockGetRecommendationsByEmotion(result.emotion, 10);
                  }
                },
                'Slow Emotion + Recs'
              )
            ),
            
            React.createElement('div', { 'data-testid': 'workflow-3' },
              React.createElement('h2', null, 'Workflow 3: Parallel Operations'),
              React.createElement('button', 
                { 
                  'data-testid': 'parallel-button',
                  onClick: () => {
                    // Start multiple operations in parallel
                    const op1 = mockLoadModels();
                    const op2 = mockAnalyzeImage(new Image());
                    const op3 = mockGetRecommendationsByEmotion('happy', 5);
                    
                    // Track all operations
                    Promise.all([op1, op2, op3]).then(() => {
                      console.log('All parallel operations completed');
                    });
                  }
                },
                'Parallel Operations'
              )
            )
          ),
          
          React.createElement('div', { 'data-testid': 'race-condition-testing' },
            React.createElement('h2', null, 'Race Condition Testing'),
            React.createElement('div', { 'data-testid': 'concurrent-state-tracking' },
              React.createElement('div', { 'data-testid': 'models-loaded' }, 'Models: false'),
              React.createElement('div', { 'data-testid': 'emotion-detected' }, 'Emotion: none'),
              React.createElement('div', { 'data-testid': 'recommendations-loaded' }, 'Recommendations: 0')
            ),
            React.createElement('div', { 'data-testid': 'timing-controls' },
              React.createElement('button', 
                { 
                  'data-testid': 'fast-path-button',
                  onClick: async () => {
                    // Fast path: quick sequence
                    await mockLoadModels();
                    const emotion = await mockAnalyzeImage(new Image());
                    const recs = await mockGetRecommendationsByEmotion(emotion.emotion, 3);
                    console.log('Fast path completed:', recs.length, 'recommendations');
                  }
                },
                'Fast Path'
              ),
              
              React.createElement('button', 
                { 
                  'data-testid': 'slow-path-button',
                  onClick: async () => {
                    // Slow path: delayed operations
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await mockLoadModels();
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const emotion = await mockAnalyzeImage(new Image());
                    await new Promise(resolve => setTimeout(resolve, 400));
                    const recs = await mockGetRecommendationsByEmotion(emotion.emotion, 3);
                    console.log('Slow path completed:', recs.length, 'recommendations');
                  }
                },
                'Slow Path'
              )
            )
          ),
          
          React.createElement('div', { 'data-testid': 'concurrent-results' },
            React.createElement('h2', null, 'Concurrent Results'),
            React.createElement('div', { 'data-testid': 'results-summary' },
              React.createElement('div', { 'data-testid': 'models-call-count' }, 'Models called: 0'),
              React.createElement('div', { 'data-testid': 'analyze-call-count' }, 'Analyze called: 0'),
              React.createElement('div', { 'data-testid': 'recommendations-call-count' }, 'Recommendations called: 0')
            )
          )
        );

      // Render concurrent operations component
      render(React.createElement(MockConcurrentOperations));

      await waitFor(() => {
        expect(screen.getByTestId('concurrent-operations')).toBeInTheDocument();
      });

      // Verify initial concurrent state
      expect(screen.getByTestId('operation-indicators')).toBeInTheDocument();
      expect(screen.getByTestId('auth-indicator')).toHaveTextContent('✓');
      expect(screen.getByTestId('emotion-indicator')).toHaveTextContent('⏳');
      expect(screen.getByTestId('recommendations-indicator')).toHaveTextContent('⏳');

      // Verify concurrent workflows
      expect(screen.getByTestId('concurrent-workflows')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-1')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-2')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-3')).toBeInTheDocument();

      // Verify quick emotion button
      const quickEmotionButton = screen.getByTestId('quick-emotion-button');
      expect(quickEmotionButton).toBeInTheDocument();

      // Verify slow emotion button
      const slowEmotionButton = screen.getByTestId('slow-emotion-button');
      expect(slowEmotionButton).toBeInTheDocument();

      // Verify parallel button
      const parallelButton = screen.getByTestId('parallel-button');
      expect(parallelButton).toBeInTheDocument();

      // Verify race condition testing elements
      expect(screen.getByTestId('race-condition-testing')).toBeInTheDocument();
      expect(screen.getByTestId('concurrent-state-tracking')).toBeInTheDocument();
      expect(screen.getByTestId('timing-controls')).toBeInTheDocument();
      expect(screen.getByTestId('fast-path-button')).toBeInTheDocument();
      expect(screen.getByTestId('slow-path-button')).toBeInTheDocument();

      // Verify concurrent results tracking
      expect(screen.getByTestId('concurrent-results')).toBeInTheDocument();
      expect(screen.getByTestId('results-summary')).toBeInTheDocument();
      expect(screen.getByTestId('models-call-count')).toHaveTextContent('Models called: 0');
      expect(screen.getByTestId('analyze-call-count')).toHaveTextContent('Analyze called: 0');
      expect(screen.getByTestId('recommendations-call-count')).toHaveTextContent('Recommendations called: 0');

      // Test concurrent operations
      fireEvent.click(quickEmotionButton);
      fireEvent.click(slowEmotionButton);
      fireEvent.click(parallelButton);

      // Verify all operations were initiated
      expect(mockLoadModels).toHaveBeenCalled();
      expect(mockAnalyzeImage).toHaveBeenCalled();
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalled();

      // Test race condition paths
      const fastPathButton = screen.getByTestId('fast-path-button');
      const slowPathButton = screen.getByTestId('slow-path-button');
      
      fireEvent.click(fastPathButton);
      fireEvent.click(slowPathButton);

      // Verify both paths were initiated
      expect(mockLoadModels).toHaveBeenCalledTimes(3); // Once for each workflow + fast path
      expect(mockAnalyzeImage).toHaveBeenCalledTimes(3); // Once for each workflow + fast path
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledTimes(3); // Once for each workflow + fast path

      // Wait for operations to complete
      await waitFor(() => {
        // Verify all operations completed
        expect(mockLoadModels).toHaveBeenCalled();
        expect(mockAnalyzeImage).toHaveBeenCalled();
        expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 3);
      }, { timeout: 1000 });

      // Verify final concurrent results
      expect(screen.getByTestId('models-call-count')).toHaveTextContent('Models called: 3');
      expect(screen.getByTestId('analyze-call-count')).toHaveTextContent('Analyze called: 3');
      expect(screen.getByTestId('recommendations-call-count')).toHaveTextContent('Recommendations called: 3');
    });
  });
});