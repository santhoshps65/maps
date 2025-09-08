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
    <div className="relative flex-1 max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(results.length > 0)}
            placeholder="Search for a location..."
            className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-lg text-gray-800 placeholder-gray-500 shadow-sm"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 animate-spin" />
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl z-[9999] max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleResultClick(result)}
              className="w-full px-6 py-5 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 border-b border-gray-200 last:border-b-0 flex items-start space-x-4 group first:rounded-t-lg last:rounded-b-lg"
            >
              <MapPin className="w-6 h-6 text-blue-600 group-hover:text-blue-700 mt-0.5 flex-shrink-0" />
              <span className="text-lg text-gray-800 group-hover:text-gray-900 leading-relaxed font-medium">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {showResults && results.length === 0 && !isLoading && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl z-[9999] px-8 py-10 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-lg text-gray-600 font-medium">No locations found for "{query}"</p>
          <p className="text-base text-gray-500 mt-3">Try searching for a city, address, or landmark</p>
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};