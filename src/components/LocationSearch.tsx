import React, { useState } from 'react';
import { Search, MapPin, Loader2, MapPinned } from 'lucide-react';

// Add type declaration for window
declare global {
  interface Window {
    searchTimeout?: NodeJS.Timeout;
  }
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, mapBounds }) => {
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
      // Build search URL with bounds if available
      let searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=10&addressdetails=1&extratags=1&namedetails=1&accept-language=en`;
      
      // Add viewbox parameter to limit results to current map view
      if (mapBounds) {
        searchUrl += `&viewbox=${mapBounds.west},${mapBounds.north},${mapBounds.east},${mapBounds.south}&bounded=1`;
      }
      
      const response = await fetch(
        searchUrl
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

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get the actual address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              const locationName = data.display_name || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
              onLocationSelect(latitude, longitude, locationName);
              setQuery(locationName);
            } else {
              // Fallback if reverse geocoding fails
              const fallbackName = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
              onLocationSelect(latitude, longitude, fallbackName);
              setQuery(fallbackName);
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Fallback if reverse geocoding fails
            const fallbackName = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            onLocationSelect(latitude, longitude, fallbackName);
            setQuery(fallbackName);
          }
          
          setShowResults(false);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsLoading(false);
          let errorMessage = 'Unable to get your current location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(results.length > 0)}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-16 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-sm text-gray-800 placeholder-gray-500 shadow-sm"
          />
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
            title="Use current location"
          >
            <MapPinned className="w-5 h-5" />
          </button>
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
              className="w-full px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 border-b border-gray-200 last:border-b-0 flex items-start space-x-3 group first:rounded-t-lg last:rounded-b-lg"
            >
              <MapPin className="w-4 h-4 text-blue-600 group-hover:text-blue-700 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-800 group-hover:text-gray-900 leading-relaxed font-medium">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {showResults && results.length === 0 && !isLoading && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl z-[9999] px-4 py-6 text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">No locations found for "{query}"</p>
          <p className="text-xs text-gray-500 mt-2">Try searching for a city, address, or landmark</p>
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