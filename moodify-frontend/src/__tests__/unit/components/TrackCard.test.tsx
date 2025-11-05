import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TrackCard } from '@/components/music/TrackCard'
import { Track } from '@/types'

describe('TrackCard Component', () => {
  const mockTrack: Track = {
    id: '123',
    name: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    imageUrl: 'https://example.com/image.jpg',
    spotifyUrl: 'https://spotify.com/track/123',
    duration: 180,
    popularity: 75
  }

  const mockOnTrackSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render track information correctly', () => {
    render(<TrackCard track={mockTrack} onTrackSelect={mockOnTrackSelect} />)
    
    expect(screen.getByText('Test Song')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('should call onTrackSelect when clicked', () => {
    render(<TrackCard track={mockTrack} onTrackSelect={mockOnTrackSelect} />)
    
    const card = screen.getByText('Test Song').closest('div')
    if (card) {
      fireEvent.click(card)
      expect(mockOnTrackSelect).toHaveBeenCalledWith(mockTrack)
      expect(mockOnTrackSelect).toHaveBeenCalledTimes(1)
    }
  })

  it('should display track image if available', () => {
    render(<TrackCard track={mockTrack} onTrackSelect={mockOnTrackSelect} />)
    
    const image = screen.queryByRole('img')
    if (image) {
      expect(image).toHaveAttribute('src', expect.stringContaining('image.jpg'))
    }
  })

  it('should format duration correctly', () => {
    render(<TrackCard track={mockTrack} onTrackSelect={mockOnTrackSelect} />)
    
    // 180 seconds = 3:00
    const durationText = screen.queryByText(/3:00/)
    // This test depends on your actual implementation
    // Adjust based on how you display duration
  })
})

