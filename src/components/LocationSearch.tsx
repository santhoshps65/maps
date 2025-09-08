import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

// Add type declaration for window
declare global {
  interface Window {
    searchTimeout?: NodeJS.Timeout;
  }
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=10&addressdetails=1&extratags=1&namedetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search results for:', searchQuery, data); // Debug log
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Debounce search
    window.searchTimeout = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  const handleResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationSelect(lat, lng, result.display_name);
    setQuery(result.display_name);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(results.length > 0)}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-700 placeholder-gray-500"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/98 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0 flex items-start space-x-3 group"
            >
              <MapPin className="w-4 h-4 text-blue-600 group-hover:text-blue-700 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {showResults && results.length === 0 && !isLoading && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/98 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl z-50 px-4 py-6 text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No locations found for "{query}"</p>
          <p className="text-xs text-gray-400 mt-1">Try searching for a city, address, or landmark</p>
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};