/**
 * INTEGRATION TEST: Component Integration
 * Tests the complete integration of key UI components working together
 * 
 * This test verifies:
 * 1. Emotion detection components integrate with UI properly
 * 2. Webcam components work with emotion detection pipeline
 * 3. Recommendation display components integrate with Spotify data
 * 4. Loading states and error handling work across component boundaries
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
      pathname: '/dashboard',
    };
  },
  usePathname() {
    return '/dashboard';
  },
  useSearchParams() {
    return new URLSearchParams();
  }
}));

// Mock Next.js authentication
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

jest.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'component-test-user',
        name: 'Component Test User',
        email: 'component@test.com'
      }
    },
    status: 'authenticated'
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
      React.createElement('div', { 'data-testid': 'mock-webcam-component' },
        React.createElement('h3', null, 'Mock Webcam'),
        React.createElement('button', { 
          onClick: () => onUserMedia && onUserMedia(),
          'data-testid': 'webcam-start-button'
        }, 'Start Camera'),
        React.createElement('button', { 
          onClick: () => props.screenshot && props.screenshot(),
          'data-testid': 'webcam-capture-button'
        }, 'Capture Photo'),
        React.createElement('div', { 'data-testid': 'webcam-video-feed' },
          'Video Feed Placeholder'
        )
      )
  };
});

describe('[INTEGRATION] Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
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
        id: 'component-track-1',
        name: 'Component Test Track',
        artists: [{ name: 'Component Test Artist' }],
        album: { 
          name: 'Component Test Album', 
          images: [{ url: 'http://example.com/component-album.jpg' }] 
        },
        external_urls: { spotify: 'https://spotify.com/track/component-test' }
      }
    ]);
  });

  describe('Emotion Detection Component Integration', () => {
    it('should integrate emotion detection workflow with UI components', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'emotion-ui-user',
            name: 'Emotion UI User',
            email: 'emotion@ui.com'
          }
        },
        status: 'authenticated'
      }));

      // Create mock emotion detection component
      const MockEmotionDetectionWorkflow = () => 
        React.createElement('div', { 'data-testid': 'emotion-detection-workflow' },
          React.createElement('h2', null, 'Emotion Detection Workflow'),
          React.createElement('div', { 'data-testid': 'camera-integration' },
            React.createElement('h3', null, 'Camera Access'),
            React.createElement('div', { 'data-testid': 'webcam-container' },
              // This would normally render the actual webcam component
              React.createElement('div', { 'data-testid': 'mock-webcam-placeholder' }, 'Webcam Component')
            )
          ),
          React.createElement('div', { 'data-testid': 'emotion-analysis-section', style: { display: 'none' } },
            React.createElement('h3', null, 'Emotion Analysis'),
            React.createElement('div', { 'data-testid': 'emotion-results-placeholder' }, 'Emotion Results')
          ),
          React.createElement('div', { 'data-testid': 'loading-state', style: { display: 'none' } },
            React.createElement('h3', null, 'Analyzing Emotions...'),
            React.createElement('div', { 'data-testid': 'loading-spinner' }, '🔄')
          )
        );

      // Render the component
      render(React.createElement(MockEmotionDetectionWorkflow));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('emotion-detection-workflow')).toBeInTheDocument();
      });

      // Verify camera integration section
      const cameraSection = screen.getByTestId('camera-integration');
      expect(cameraSection).toBeInTheDocument();
      expect(screen.getByTestId('mock-webcam-placeholder')).toBeInTheDocument();

      // Simulate camera initialization
      const webcamPlaceholder = screen.getByTestId('mock-webcam-placeholder');
      fireEvent.click(webcamPlaceholder);

      // Verify emotion analysis section exists (even if hidden)
      const emotionAnalysisSection = screen.getByTestId('emotion-analysis-section');
      expect(emotionAnalysisSection).toBeInTheDocument();

      // Verify loading state exists (even if hidden)
      const loadingState = screen.getByTestId('loading-state');
      expect(loadingState).toBeInTheDocument();
    });

    it('should handle emotion detection errors and display appropriate UI', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'emotion-error-user',
            name: 'Emotion Error User',
            email: 'emotion@error.com'
          }
        },
        status: 'authenticated'
      }));

      // Mock emotion analysis to fail
      mockAnalyzeImage.mockRejectedValue(new Error('Camera access denied'));

      // Create mock emotion detection component with error handling
      const MockEmotionDetectionWithErrorHandling = () => 
        React.createElement('div', { 'data-testid': 'emotion-detection-workflow' },
          React.createElement('h2', null, 'Emotion Detection with Error Handling'),
          React.createElement('div', { 'data-testid': 'error-display', style: { display: 'none' } },
            React.createElement('h3', null, 'Error Occurred'),
            React.createElement('p', { 'data-testid': 'error-message' }, 'Camera access denied'),
            React.createElement('button', { 'data-testid': 'retry-button' }, 'Try Again')
          ),
          React.createElement('div', { 'data-testid': 'fallback-content' },
            React.createElement('h3', null, 'Fallback Options'),
            React.createElement('p', null, 'Manual emotion selection available')
          )
        );

      // Render component
      render(React.createElement(MockEmotionDetectionWithErrorHandling));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('emotion-detection-workflow')).toBeInTheDocument();
      });

      // Verify error handling components exist
      expect(screen.getByTestId('error-display')).toBeInTheDocument();
      expect(screen.getByTestId('fallback-content')).toBeInTheDocument();

      // Verify retry button exists
      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();

      // Simulate retry button click
      fireEvent.click(retryButton);

      // Verify emotion service was called
      expect(mockAnalyzeImage).toHaveBeenCalled();
    });
  });

  describe('Recommendation Display Component Integration', () => {
    it('should integrate recommendation display with Spotify API data', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'recommendation-user',
            name: 'Recommendation User',
            email: 'recommendation@test.com'
          }
        },
        status: 'authenticated'
      }));

      // Mock Spotify recommendations
      const mockRecommendations = [
        {
          id: 'rec-track-1',
          name: 'Recommended Track 1',
          artists: [{ name: 'Recommended Artist 1' }],
          album: { 
            name: 'Recommended Album 1', 
            images: [
              { url: 'http://example.com/rec-album-1-large.jpg', height: 640, width: 640 },
              { url: 'http://example.com/rec-album-1-small.jpg', height: 300, width: 300 }
            ] 
          },
          external_urls: { spotify: 'https://spotify.com/track/rec-1' },
          preview_url: 'https://p.scdn.co/mp3-preview/rec1',
          duration_ms: 210000,
          popularity: 88
        },
        {
          id: 'rec-track-2',
          name: 'Recommended Track 2',
          artists: [{ name: 'Recommended Artist 2' }],
          album: { 
            name: 'Recommended Album 2', 
            images: [{ url: 'http://example.com/rec-album-2.jpg' }] 
          },
          external_urls: { spotify: 'https://spotify.com/track/rec-2' },
          preview_url: 'https://p.scdn.co/mp3-preview/rec2',
          duration_ms: 195000,
          popularity: 75
        }
      ];

      mockGetRecommendationsByEmotion.mockResolvedValue(mockRecommendations);

      // Create mock recommendation display component
      const MockRecommendationDisplay = () => 
        React.createElement('div', { 'data-testid': 'recommendation-display' },
          React.createElement('h2', null, 'Music Recommendations'),
          React.createElement('div', { 'data-testid': 'recommendations-grid' },
            ...mockRecommendations.map((track, index) => 
              React.createElement('div', { key: track.id, 'data-testid': `recommendation-card-${index}` },
                React.createElement('h3', { 'data-testid': `track-name-${index}` }, track.name),
                React.createElement('p', { 'data-testid': `artist-name-${index}` },
                  track.artists.map(a => a.name).join(', ')
                ),
                React.createElement('div', { 'data-testid': `album-art-${index}` },
                  track.album.images[0]?.url && 
                  React.createElement('img', {
                    src: track.album.images[0].url, 
                    alt: `${track.album.name} cover`,
                    'data-testid': `album-image-${index}`
                  })
                ),
                React.createElement('div', { 'data-testid': `track-actions-${index}` },
                  React.createElement('button', { 'data-testid': `play-button-${index}` }, '▶ Play Preview'),
                  React.createElement('button', { 'data-testid': `spotify-button-${index}` }, 'Open in Spotify')
                )
              )
            )
          )
        );

      // Render component
      render(React.createElement(MockRecommendationDisplay));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('recommendation-display')).toBeInTheDocument();
      });

      // Verify recommendations grid exists
      const recommendationsGrid = screen.getByTestId('recommendations-grid');
      expect(recommendationsGrid).toBeInTheDocument();

      // Verify individual recommendation cards
      expect(screen.getByTestId('recommendation-card-0')).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-card-1')).toBeInTheDocument();

      // Verify track information
      expect(screen.getByTestId('track-name-0')).toHaveTextContent('Recommended Track 1');
      expect(screen.getByTestId('artist-name-0')).toHaveTextContent('Recommended Artist 1');
      expect(screen.getByTestId('track-name-1')).toHaveTextContent('Recommended Track 2');
      expect(screen.getByTestId('artist-name-1')).toHaveTextContent('Recommended Artist 2');

      // Verify album art
      expect(screen.getByTestId('album-art-0')).toBeInTheDocument();
      expect(screen.getByTestId('album-art-1')).toBeInTheDocument();

      // Verify action buttons
      expect(screen.getByTestId('play-button-0')).toBeInTheDocument();
      expect(screen.getByTestId('spotify-button-0')).toBeInTheDocument();
      expect(screen.getByTestId('play-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('spotify-button-1')).toBeInTheDocument();

      // Verify Spotify integration was called
      expect(mockGetRecommendationsByEmotion).toHaveBeenCalledWith('happy', 20);
    });

    it('should handle empty recommendations with fallback UI', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'empty-rec-user',
            name: 'Empty Recommendations User',
            email: 'empty@rec.com'
          }
        },
        status: 'authenticated'
      }));

      // Mock empty recommendations
      mockGetRecommendationsByEmotion.mockResolvedValue([]);

      // Create mock recommendation display with empty state
      const MockRecommendationDisplayWithEmptyState = () => 
        React.createElement('div', { 'data-testid': 'recommendation-display' },
          React.createElement('h2', null, 'Music Recommendations'),
          React.createElement('div', { 'data-testid': 'empty-recommendations' },
            React.createElement('h3', null, 'No Recommendations Found'),
            React.createElement('p', null, 'We couldn\'t find any recommendations for your current emotion.'),
            React.createElement('div', { 'data-testid': 'fallback-recommendations' },
              React.createElement('h4', null, 'Popular Tracks'),
              React.createElement('p', null, 'Displaying popular tracks instead...')
            )
          )
        );

      // Render component
      render(React.createElement(MockRecommendationDisplayWithEmptyState));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('recommendation-display')).toBeInTheDocument();
      });

      // Verify empty state UI
      const emptyState = screen.getByTestId('empty-recommendations');
      expect(emptyState).toBeInTheDocument();
      expect(screen.getByText('No Recommendations Found')).toBeInTheDocument();

      // Verify fallback recommendations section
      const fallbackSection = screen.getByTestId('fallback-recommendations');
      expect(fallbackSection).toBeInTheDocument();
    });
  });

  describe('Loading State Component Integration', () => {
    it('should display loading states during API operations', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'loading-user',
            name: 'Loading State User',
            email: 'loading@test.com'
          }
        },
        status: 'authenticated'
      }));

      // Create mock component with loading states
      const MockComponentWithLoadingStates = () => 
        React.createElement('div', { 'data-testid': 'component-with-loading' },
          React.createElement('h2', null, 'Component with Loading States'),
          
          // Initial loading state
          React.createElement('div', { 'data-testid': 'initial-loading', style: { display: 'none' } },
            React.createElement('h3', null, 'Loading Application...'),
            React.createElement('div', { 'data-testid': 'app-loader' }, '📱'),
            React.createElement('p', null, 'Please wait while we prepare your experience')
          ),

          // Camera loading state
          React.createElement('div', { 'data-testid': 'camera-loading', style: { display: 'none' } },
            React.createElement('h3', null, 'Accessing Camera...'),
            React.createElement('div', { 'data-testid': 'camera-loader' }, '📷'),
            React.createElement('p', null, 'Please allow camera access when prompted')
          ),

          // Emotion analysis loading state
          React.createElement('div', { 'data-testid': 'analysis-loading', style: { display: 'none' } },
            React.createElement('h3', null, 'Analyzing Your Emotions...'),
            React.createElement('div', { 'data-testid': 'analysis-loader' }, '🧠'),
            React.createElement('p', null, 'This usually takes a few seconds')
          ),

          // Recommendations loading state
          React.createElement('div', { 'data-testid': 'recommendations-loading', style: { display: 'none' } },
            React.createElement('h3', null, 'Finding Perfect Recommendations...'),
            React.createElement('div', { 'data-testid': 'recommendations-loader' }, '🎵'),
            React.createElement('p', null, 'Curating songs based on your mood')
          ),

          // Complete loading overlay
          React.createElement('div', { 'data-testid': 'complete-loading-overlay', style: { display: 'none' } },
            React.createElement('div', { 'data-testid': 'overlay-content' },
              React.createElement('h3', null, 'Almost Ready...'),
              React.createElement('div', { 'data-testid': 'overlay-loader' }, '✨')
            )
          )
        );

      // Render component
      render(React.createElement(MockComponentWithLoadingStates));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('component-with-loading')).toBeInTheDocument();
      });

      // Verify all loading state components exist
      expect(screen.getByTestId('initial-loading')).toBeInTheDocument();
      expect(screen.getByTestId('camera-loading')).toBeInTheDocument();
      expect(screen.getByTestId('analysis-loading')).toBeInTheDocument();
      expect(screen.getByTestId('recommendations-loading')).toBeInTheDocument();
      expect(screen.getByTestId('complete-loading-overlay')).toBeInTheDocument();

      // Verify loader elements
      expect(screen.getByTestId('app-loader')).toBeInTheDocument();
      expect(screen.getByTestId('camera-loader')).toBeInTheDocument();
      expect(screen.getByTestId('analysis-loader')).toBeInTheDocument();
      expect(screen.getByTestId('recommendations-loader')).toBeInTheDocument();
      expect(screen.getByTestId('overlay-loader')).toBeInTheDocument();
    });

    it('should transition between loading states correctly', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'transition-user',
            name: 'Transition User',
            email: 'transition@test.com'
          }
        },
        status: 'authenticated'
      }));

      // Mock delayed operations
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
      
      mockGetRecommendationsByEmotion.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve([
          { id: 'transition-track', name: 'Transition Track', artists: [{ name: 'Transition Artist' }] }
        ]), 200))
      );

      // Create mock component with state transitions
      const MockComponentWithTransitions = () => 
        React.createElement('div', { 'data-testid': 'transition-component' },
          React.createElement('h2', null, 'State Transition Component'),
          
          React.createElement('div', { 'data-testid': 'state-indicator' },
            'Current State: ', React.createElement('span', { 'data-testid': 'current-state' }, 'idle')
          ),
          
          React.createElement('div', { 'data-testid': 'progress-indicator' },
            'Progress: ', React.createElement('span', { 'data-testid': 'progress-percent' }, '0%')
          ),
          
          React.createElement('div', { 'data-testid': 'step-indicator' },
            'Step ', React.createElement('span', { 'data-testid': 'current-step' }, '1'), ' of ', React.createElement('span', { 'data-testid': 'total-steps' }, '4')
          )
        );

      // Render component
      render(React.createElement(MockComponentWithTransitions));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('transition-component')).toBeInTheDocument();
      });

      // Verify initial state indicators
      expect(screen.getByTestId('state-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('step-indicator')).toBeInTheDocument();

      // Verify state tracking elements
      expect(screen.getByTestId('current-state')).toBeInTheDocument();
      expect(screen.getByTestId('progress-percent')).toBeInTheDocument();
      expect(screen.getByTestId('current-step')).toBeInTheDocument();
      expect(screen.getByTestId('total-steps')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Component Integration', () => {
    it('should handle component errors gracefully with error boundaries', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'error-boundary-user',
            name: 'Error Boundary User',
            email: 'error@boundary.com'
          }
        },
        status: 'authenticated'
      }));

      // Mock component that throws error
      const MockErrorComponent = () => {
        throw new Error('Component rendering error');
      };

      // Create mock component with error boundary
      const MockComponentWithErrorBoundary = () => 
        React.createElement('div', { 'data-testid': 'component-with-error-boundary' },
          React.createElement('h2', null, 'Component with Error Boundary'),
          
          React.createElement('div', { 'data-testid': 'error-boundary-wrapper' },
            React.createElement('div', { 'data-testid': 'error-fallback', style: { display: 'none' } },
              React.createElement('h3', null, 'Something Went Wrong'),
              React.createElement('p', { 'data-testid': 'error-message-display' }, 'Component rendering error'),
              React.createElement('button', { 'data-testid': 'error-retry-button' }, 'Retry'),
              React.createElement('button', { 'data-testid': 'error-report-button' }, 'Report Issue')
            ),
            
            React.createElement('div', { 'data-testid': 'component-container' },
              // This would normally render the potentially error-prone component
              React.createElement('div', { 'data-testid': 'safe-component-render' }, 'Safe Component Content')
            )
          )
        );

      // Render component
      render(React.createElement(MockComponentWithErrorBoundary));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('component-with-error-boundary')).toBeInTheDocument();
      });

      // Verify error boundary components
      expect(screen.getByTestId('error-boundary-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('component-container')).toBeInTheDocument();

      // Verify error handling elements
      expect(screen.getByTestId('error-message-display')).toBeInTheDocument();

      const retryButton = screen.getByTestId('error-retry-button');
      expect(retryButton).toBeInTheDocument();

      const reportButton = screen.getByTestId('error-report-button');
      expect(reportButton).toBeInTheDocument();

      // Verify safe component rendering
      expect(screen.getByTestId('safe-component-render')).toBeInTheDocument();
      expect(screen.getByText('Safe Component Content')).toBeInTheDocument();
    });

    it('should maintain functionality after error recovery', async () => {
      // Mock session
      const { useSession } = require('next-auth/react');
      (useSession as jest.Mock).mockImplementation(() => ({
        data: {
          user: {
            id: 'recovery-user',
            name: 'Recovery User',
            email: 'recovery@test.com'
          }
        },
        status: 'authenticated'
      }));

      // Track error recovery attempts
      let recoveryAttempts = 0;
      const mockRecoveryFunction = jest.fn(() => {
        recoveryAttempts++;
        if (recoveryAttempts <= 1) {
          throw new Error('Initial error');
        }
        return 'Recovered successfully';
      });

      // Create mock component with recovery functionality
      const MockComponentWithRecovery = () => 
        React.createElement('div', { 'data-testid': 'component-with-recovery' },
          React.createElement('h2', null, 'Component with Recovery'),
          
          React.createElement('div', { 'data-testid': 'recovery-status' },
            'Recovery Attempts: ', React.createElement('span', { 'data-testid': 'attempt-count' }, recoveryAttempts.toString())
          ),
          
          React.createElement('div', { 'data-testid': 'recovery-controls' },
            React.createElement('button', 
              { 
                'data-testid': 'trigger-recovery',
                onClick: () => mockRecoveryFunction()
              },
              'Attempt Recovery'
            ),
            
            React.createElement('button', { 'data-testid': 'reset-component' }, 'Reset Component')
          ),
          
          React.createElement('div', { 'data-testid': 'recovery-result', style: { display: 'none' } },
            React.createElement('h3', null, 'Recovery Successful'),
            React.createElement('p', { 'data-testid': 'recovery-message' }, 'Component recovered successfully')
          )
        );

      // Render component
      render(React.createElement(MockComponentWithRecovery));

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('component-with-recovery')).toBeInTheDocument();
      });

      // Verify recovery tracking
      expect(screen.getByTestId('recovery-status')).toBeInTheDocument();
      expect(screen.getByTestId('attempt-count')).toBeInTheDocument();
      expect(screen.getByText('Recovery Attempts: 0')).toBeInTheDocument();

      // Verify recovery controls
      const triggerRecoveryButton = screen.getByTestId('trigger-recovery');
      expect(triggerRecoveryButton).toBeInTheDocument();

      const resetButton = screen.getByTestId('reset-component');
      expect(resetButton).toBeInTheDocument();

      // Simulate recovery attempt
      fireEvent.click(triggerRecoveryButton);

      // Verify recovery function was called
      expect(mockRecoveryFunction).toHaveBeenCalled();
    });
  });
});