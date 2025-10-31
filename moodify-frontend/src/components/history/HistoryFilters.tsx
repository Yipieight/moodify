"use client"

import { useState } from 'react'
import { HistoryFilters as HistoryFiltersType } from '@/lib/historyService'
import { EmotionType } from '@/types'

interface HistoryFiltersProps {
  filters: HistoryFiltersType
  onFiltersChange: (filters: Partial<HistoryFiltersType>) => void
}

export function HistoryFilters({ filters, onFiltersChange }: HistoryFiltersProps) {
  // State for individual filter parameters
  const [type, setType] = useState(filters.type || ('all' as const));
  const [emotion, setEmotion] = useState('');
  const [limit, setLimit] = useState(filters.limit || 20);
  const [startDate, setStartDate] = useState(filters.startDate ? filters.startDate.toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(filters.endDate ? filters.endDate.toISOString().split('T')[0] : '');
  
  // State for time range selection
  const [timeRange, setTimeRange] = useState<string>(() => {
    // Determine initial time range based on existing filters
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Map to common ranges
      if (daysDiff <= 1) return '1';      // Last 24 hours
      if (daysDiff <= 7) return '7';      // Last 7 days
      if (daysDiff <= 30) return '30';    // Last 30 days
      if (daysDiff <= 90) return '90';    // Last 3 months
      if (daysDiff <= 365) return '365';  // Last year
    }
    return '';
  });

  const emotionOptions: Array<{ value: EmotionType; label: string }> = [
    { value: 'happy', label: 'Happy' },
    { value: 'sad', label: 'Sad' },
    { value: 'angry', label: 'Angry' },
    { value: 'surprised', label: 'Surprised' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'fear', label: 'Fear' },
    { value: 'disgust', label: 'Disgust' }
  ]

  const timeRangeOptions = [
    { value: '', label: 'All time' },
    { value: '1', label: 'Last 24 hours' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const handleApplyFilters = () => {
    const updatedFilters: Partial<HistoryFiltersType> = {
      type: type === 'all' ? undefined : type as 'emotion' | 'recommendation',
      emotion: emotion ? emotion as EmotionType : undefined,
      limit: limit,
      page: 1 // Reset to first page when applying filters
    };

    // Handle date range
    if (timeRange === '1') {
      // Last 24 hours
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      updatedFilters.startDate = twentyFourHoursAgo;
      updatedFilters.endDate = now;
      updatedFilters.timeRange = '24hours';
    } else if (timeRange && timeRange !== 'custom') {
      // Other preset ranges (7, 30, 90, 365 days)
      const calculated = calculateDatesForRange(timeRange);
      updatedFilters.startDate = new Date(`${calculated.startDate}T00:00:00`);
      const end = new Date(`${calculated.endDate}T00:00:00`);
      end.setHours(23, 59, 59, 999);
      updatedFilters.endDate = end;
    } else if (startDate && endDate) {
      // Custom date range or no timeRange but dates are set
      updatedFilters.startDate = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      end.setHours(23, 59, 59, 999);
      updatedFilters.endDate = end;
    } else {
      // No date filter
      updatedFilters.startDate = undefined;
      updatedFilters.endDate = undefined;
      updatedFilters.timeRange = undefined;
    }

    onFiltersChange(updatedFilters)
  }

  // Helper function to get YYYY-MM-DD from a Date object
  const toYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const d_ = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d_}`;
  };

  // Helper function to calculate dates based on time range
  const calculateDatesForRange = (range: string): { startDate: string; endDate: string } => {
    const now = new Date();

    if (range === '1') {
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      return {
        startDate: twentyFourHoursAgo.toISOString(),
        endDate: now.toISOString()
      };
    }

    // Use current date at start of day for end date for day-based ranges
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);

    switch (range) {
      case '7':
        start.setDate(start.getDate() - 7);
        break;
      case '30':
        start.setDate(start.getDate() - 30);
        break;
      case '90':
        start.setMonth(start.getMonth() - 3);
        break;
      case '365':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        return { startDate: '', endDate: '' };
    }

    // Return date-only format for date range filters
    return {
      startDate: toYYYYMMDD(start),
      endDate: toYYYYMMDD(end)
    };
  };

  const handleResetFilters = () => {
    setType('all');
    setEmotion('');
    setStartDate('');
    setEndDate('');
    setLimit(20);
    setTimeRange('');

    onFiltersChange({
      type: undefined,
      emotion: undefined,
      startDate: undefined,
      endDate: undefined,
      timeRange: undefined,
      limit: 20,
      page: 1
    })
  }

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);

    if (range === 'custom') {
      // User will set custom dates, so we just set the range and exit.
      return;
    }

    if (!range) {
      setStartDate('');
      setEndDate('');
      return;
    }

    const dates = calculateDatesForRange(range);

    if (range === '1') {
      setStartDate(toYYYYMMDD(new Date(dates.startDate)));
      setEndDate(toYYYYMMDD(new Date(dates.endDate)));
    } else {
      setStartDate(dates.startDate);
      setEndDate(dates.endDate);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Filter Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Content Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'emotion' | 'recommendation' | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            <option value="all" className="text-gray-900">All Types</option>
            <option value="emotion" className="text-gray-900">Emotions Only</option>
            <option value="recommendation" className="text-gray-900">Recommendations Only</option>
          </select>
        </div>

        {/* Emotion Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Specific Emotion
          </label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            <option value="" className="text-gray-900">All Emotions</option>
            {emotionOptions.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Items per page */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Items per page
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            <option value={10} className="text-gray-900">10</option>
            <option value={20} className="text-gray-900">20</option>
            <option value={50} className="text-gray-900">50</option>
            <option value={100} className="text-gray-900">100</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setTimeRange('custom'); // Mark as custom when user changes manually
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setTimeRange('custom'); // Mark as custom when user changes manually
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Reset
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}