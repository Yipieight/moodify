export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Moodify</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Discover music that matches your mood through facial emotion recognition technology. 
              Let Moodify analyze your emotions and recommend the perfect soundtrack for your feelings.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-600">Emotion Detection</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">Music Recommendations</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">History Tracking</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">Analytics Dashboard</span>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Technology
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-600">Next.js 15</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">Face-API.js</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">Spotify API</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">Tailwind CSS</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2025 Moodify. Built as part of Web Programming course project.
            </p>
            <p className="text-sm text-gray-600 mt-2 md:mt-0">
              Universidad Rafael Landivar - Ingeniería en Informática
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}