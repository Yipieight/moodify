import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
)

// Color palette for emotions
export const emotionColors = {
  happy: {
    primary: '#fbbf24', // amber-400
    light: '#fde68a', // amber-200
    dark: '#d97706'   // amber-600
  },
  sad: {
    primary: '#3b82f6', // blue-500
    light: '#93c5fd', // blue-300
    dark: '#1d4ed8'   // blue-700
  },
  angry: {
    primary: '#ef4444', // red-500
    light: '#fca5a5', // red-300
    dark: '#dc2626'   // red-600
  },
  surprised: {
    primary: '#f59e0b', // amber-500
    light: '#fcd34d', // amber-300
    dark: '#d97706'   // amber-600
  },
  neutral: {
    primary: '#6b7280', // gray-500
    light: '#d1d5db', // gray-300
    dark: '#374151'   // gray-700
  },
  fear: {
    primary: '#8b5cf6', // violet-500
    light: '#c4b5fd', // violet-300
    dark: '#7c3aed'   // violet-600
  },
  disgust: {
    primary: '#10b981', // emerald-500
    light: '#6ee7b7', // emerald-300
    dark: '#059669'   // emerald-600
  }
}

// Common chart options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif'
        },
        color: '#6b7280'
      }
    },
    y: {
      grid: {
        color: '#f3f4f6',
        borderDash: [2, 2]
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif'
        },
        color: '#6b7280'
      }
    }
  }
}

// Line chart specific options
export const lineChartOptions = {
  ...defaultChartOptions,
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2
    }
  }
}

// Bar chart specific options
export const barChartOptions = {
  ...defaultChartOptions,
  elements: {
    bar: {
      borderRadius: 4,
      borderSkipped: false
    }
  }
}

// Doughnut chart specific options
export const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
      callbacks: {
        label: function(context: any) {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  },
  cutout: '60%'
}

// Polar area chart options
export const polarAreaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12
    }
  },
  scales: {
    r: {
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        display: false
      }
    }
  }
}

// Utility functions for generating chart data
export const generateEmotionChartData = (emotionData: Record<string, number>) => {
  const emotions = Object.keys(emotionData)
  const values = Object.values(emotionData)
  
  return {
    labels: emotions.map(emotion => emotion.charAt(0).toUpperCase() + emotion.slice(1)),
    datasets: [{
      data: values,
      backgroundColor: emotions.map(emotion => 
        emotionColors[emotion as keyof typeof emotionColors]?.primary || emotionColors.neutral.primary
      ),
      borderColor: emotions.map(emotion => 
        emotionColors[emotion as keyof typeof emotionColors]?.dark || emotionColors.neutral.dark
      ),
      borderWidth: 2
    }]
  }
}

export const generateTimeSeriesData = (timeData: Array<{date: string, value: number}>, label: string, color: string) => {
  return {
    labels: timeData.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [{
      label,
      data: timeData.map(item => item.value),
      borderColor: color,
      backgroundColor: color + '20', // Add transparency
      fill: true,
      tension: 0.4
    }]
  }
}

export const generateMultiLineData = (
  timeData: Array<{date: string, [key: string]: any}>, 
  series: Array<{key: string, label: string, color: string}>
) => {
  return {
    labels: timeData.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: series.map(s => ({
      label: s.label,
      data: timeData.map(item => item[s.key] || 0),
      borderColor: s.color,
      backgroundColor: s.color + '20',
      fill: false,
      tension: 0.4
    }))
  }
}