/**
 * Music and track fixtures for testing music recommendation features
 */

export const mockTracks = {
  happyTrack1: {
    id: 'spotify:track:happy1',
    name: 'Happy Dance Song',
    artist: 'Joy Collective',
    album: 'Positive Vibes',
    imageUrl: 'https://i.scdn.co/image/happy1',
    previewUrl: 'https://p.scdn.co/mp3-preview/happy1',
    spotifyUrl: 'https://open.spotify.com/track/happy1',
    audioFeatures: {
      valence: 0.85,
      energy: 0.78,
      danceability: 0.82,
      tempo: 128,
    },
  },
  happyTrack2: {
    id: 'spotify:track:happy2',
    name: 'Sunshine Pop',
    artist: 'The Uplifters',
    album: 'Feel Good Hits',
    imageUrl: 'https://i.scdn.co/image/happy2',
    previewUrl: 'https://p.scdn.co/mp3-preview/happy2',
    spotifyUrl: 'https://open.spotify.com/track/happy2',
    audioFeatures: {
      valence: 0.92,
      energy: 0.85,
      danceability: 0.88,
      tempo: 120,
    },
  },
  sadTrack1: {
    id: 'spotify:track:sad1',
    name: 'Melancholy Blues',
    artist: 'Sorrow Singer',
    album: 'Rainy Days',
    imageUrl: 'https://i.scdn.co/image/sad1',
    previewUrl: 'https://p.scdn.co/mp3-preview/sad1',
    spotifyUrl: 'https://open.spotify.com/track/sad1',
    audioFeatures: {
      valence: 0.15,
      energy: 0.25,
      danceability: 0.30,
      tempo: 68,
    },
  },
  sadTrack2: {
    id: 'spotify:track:sad2',
    name: 'Lonely Acoustic',
    artist: 'Indie Folk Band',
    album: 'Quiet Moments',
    imageUrl: 'https://i.scdn.co/image/sad2',
    previewUrl: null, // Some tracks may not have preview
    spotifyUrl: 'https://open.spotify.com/track/sad2',
    audioFeatures: {
      valence: 0.20,
      energy: 0.32,
      danceability: 0.28,
      tempo: 72,
    },
  },
  angryTrack1: {
    id: 'spotify:track:angry1',
    name: 'Rage Against',
    artist: 'Metal Mayhem',
    album: 'Fury',
    imageUrl: 'https://i.scdn.co/image/angry1',
    previewUrl: 'https://p.scdn.co/mp3-preview/angry1',
    spotifyUrl: 'https://open.spotify.com/track/angry1',
    audioFeatures: {
      valence: 0.35,
      energy: 0.95,
      danceability: 0.55,
      tempo: 160,
    },
  },
  surprisedTrack1: {
    id: 'spotify:track:surprised1',
    name: 'Unexpected Twist',
    artist: 'Electronic Experimenters',
    album: 'Avant-Garde',
    imageUrl: 'https://i.scdn.co/image/surprised1',
    previewUrl: 'https://p.scdn.co/mp3-preview/surprised1',
    spotifyUrl: 'https://open.spotify.com/track/surprised1',
    audioFeatures: {
      valence: 0.65,
      energy: 0.75,
      danceability: 0.68,
      tempo: 135,
    },
  },
  neutralTrack1: {
    id: 'spotify:track:neutral1',
    name: 'Chill Vibes',
    artist: 'Ambient Collective',
    album: 'Calm Waters',
    imageUrl: 'https://i.scdn.co/image/neutral1',
    previewUrl: 'https://p.scdn.co/mp3-preview/neutral1',
    spotifyUrl: 'https://open.spotify.com/track/neutral1',
    audioFeatures: {
      valence: 0.50,
      energy: 0.45,
      danceability: 0.52,
      tempo: 95,
    },
  },
  fearTrack1: {
    id: 'spotify:track:fear1',
    name: 'Dark Ambient',
    artist: 'Soundtrack Composer',
    album: 'Tension',
    imageUrl: 'https://i.scdn.co/image/fear1',
    previewUrl: 'https://p.scdn.co/mp3-preview/fear1',
    spotifyUrl: 'https://open.spotify.com/track/fear1',
    audioFeatures: {
      valence: 0.25,
      energy: 0.35,
      danceability: 0.30,
      tempo: 80,
    },
  },
  disgustTrack1: {
    id: 'spotify:track:disgust1',
    name: 'Gritty Grunge',
    artist: 'Alternative Band',
    album: 'Distortion',
    imageUrl: 'https://i.scdn.co/image/disgust1',
    previewUrl: 'https://p.scdn.co/mp3-preview/disgust1',
    spotifyUrl: 'https://open.spotify.com/track/disgust1',
    audioFeatures: {
      valence: 0.32,
      energy: 0.62,
      danceability: 0.45,
      tempo: 110,
    },
  },
}

export const mockRecommendations = {
  happy: {
    emotion: 'happy',
    tracks: [mockTracks.happyTrack1, mockTracks.happyTrack2],
  },
  sad: {
    emotion: 'sad',
    tracks: [mockTracks.sadTrack1, mockTracks.sadTrack2],
  },
  angry: {
    emotion: 'angry',
    tracks: [mockTracks.angryTrack1],
  },
  surprised: {
    emotion: 'surprised',
    tracks: [mockTracks.surprisedTrack1],
  },
  neutral: {
    emotion: 'neutral',
    tracks: [mockTracks.neutralTrack1],
  },
  fear: {
    emotion: 'fear',
    tracks: [mockTracks.fearTrack1],
  },
  disgust: {
    emotion: 'disgust',
    tracks: [mockTracks.disgustTrack1],
  },
  empty: {
    emotion: 'happy',
    tracks: [],
  },
}

export const spotifyApiResponses = {
  searchSuccess: {
    tracks: {
      items: [
        {
          id: 'happy1',
          name: 'Happy Dance Song',
          artists: [{ name: 'Joy Collective' }],
          album: {
            name: 'Positive Vibes',
            images: [{ url: 'https://i.scdn.co/image/happy1' }],
          },
          preview_url: 'https://p.scdn.co/mp3-preview/happy1',
          external_urls: {
            spotify: 'https://open.spotify.com/track/happy1',
          },
        },
        {
          id: 'happy2',
          name: 'Sunshine Pop',
          artists: [{ name: 'The Uplifters' }],
          album: {
            name: 'Feel Good Hits',
            images: [{ url: 'https://i.scdn.co/image/happy2' }],
          },
          preview_url: 'https://p.scdn.co/mp3-preview/happy2',
          external_urls: {
            spotify: 'https://open.spotify.com/track/happy2',
          },
        },
      ],
    },
  },
  searchEmpty: {
    tracks: {
      items: [],
    },
  },
  audioFeaturesSuccess: {
    audio_features: [
      {
        valence: 0.85,
        energy: 0.78,
        danceability: 0.82,
        tempo: 128,
      },
      {
        valence: 0.92,
        energy: 0.85,
        danceability: 0.88,
        tempo: 120,
      },
    ],
  },
  recommendationsSuccess: {
    tracks: [
      {
        id: 'happy1',
        name: 'Happy Dance Song',
        artists: [{ name: 'Joy Collective' }],
        album: {
          name: 'Positive Vibes',
          images: [{ url: 'https://i.scdn.co/image/happy1' }],
        },
        preview_url: 'https://p.scdn.co/mp3-preview/happy1',
        external_urls: {
          spotify: 'https://open.spotify.com/track/happy1',
        },
      },
    ],
  },
  currentPlayingSuccess: {
    is_playing: true,
    item: {
      id: 'current1',
      name: 'Currently Playing Song',
      artists: [{ name: 'Current Artist' }],
      album: {
        name: 'Current Album',
        images: [{ url: 'https://i.scdn.co/image/current1' }],
      },
      preview_url: 'https://p.scdn.co/mp3-preview/current1',
      external_urls: {
        spotify: 'https://open.spotify.com/track/current1',
      },
    },
  },
  currentPlayingNone: {
    is_playing: false,
    item: null,
  },
  error401: {
    error: {
      status: 401,
      message: 'The access token expired',
    },
  },
  error429: {
    error: {
      status: 429,
      message: 'API rate limit exceeded',
    },
  },
  error503: {
    error: {
      status: 503,
      message: 'Service temporarily unavailable',
    },
  },
}

export const playlistData = {
  valid: {
    name: 'Moodify - Happy Vibes',
    description: 'Generated from your happy mood',
    public: false,
    tracks: [mockTracks.happyTrack1.id, mockTracks.happyTrack2.id],
  },
  created: {
    id: 'playlist123',
    name: 'Moodify - Happy Vibes',
    external_urls: {
      spotify: 'https://open.spotify.com/playlist/playlist123',
    },
    tracks: {
      total: 2,
    },
  },
}

export const searchQuery = {
  valid: 'happy upbeat songs',
  withFilters: {
    q: 'indie',
    type: 'track',
    limit: 20,
  },
  empty: '',
  invalid: null,
}

export const audioFeatureRanges = {
  happy: {
    target_valence: 0.8,
    target_energy: 0.7,
    target_danceability: 0.75,
    min_valence: 0.6,
    min_energy: 0.5,
  },
  sad: {
    target_valence: 0.2,
    target_energy: 0.3,
    target_danceability: 0.3,
    max_valence: 0.4,
    max_energy: 0.5,
  },
  angry: {
    target_valence: 0.4,
    target_energy: 0.9,
    target_danceability: 0.6,
    min_energy: 0.7,
  },
}
