import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation, Search, Plus, Minus, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MarkerData {
  id: number;
  position: [number, number];
  title: string;
  description: string;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function App() {
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      id: 1,
      position: [40.7128, -74.0060],
      title: "New York City",
      description: "The Big Apple - A bustling metropolis"
    },
    {
      id: 2,
      position: [34.0522, -118.2437],
      title: "Los Angeles",
      description: "City of Angels - Entertainment capital"
    },
    {
      id: 3,
      position: [41.8781, -87.6298],
      title: "Chicago",
      description: "The Windy City - Architecture and deep dish"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);

    // First check existing markers
    const foundMarker = markers.find(marker => 
      marker.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (foundMarker) {
      setMapCenter(foundMarker.position);
      setMapZoom(10);
      setSelectedMarkerId(foundMarker.id);
      setIsSearching(false);
      return;
    }

    // If not found in markers, use geocoding API
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setMapCenter([lat, lng]);
        setMapZoom(12);
        
        // Add a marker for the searched location with animation
        const newMarker: MarkerData = {
          id: Date.now(),
          position: [lat, lng],
          title: data[0].display_name.split(',')[0] || searchQuery,
          description: `Found location: ${data[0].display_name}`
        };
        setMarkers([...markers, newMarker]);
        setSelectedMarkerId(newMarker.id);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check your internet connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setIsAddingMarker(true);
    
    // Add a small delay for smooth animation
    setTimeout(() => {
      const newMarker: MarkerData = {
        id: Date.now(),
        position: [lat, lng],
        title: `Location ${markers.length + 1}`,
        description: `Custom marker at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
      setMarkers([...markers, newMarker]);
      setSelectedMarkerId(newMarker.id);
      setIsAddingMarker(false);
    }, 200);
  };

  const handleGoToLocation = (marker: MarkerData) => {
    setMapCenter(marker.position);
    setMapZoom(12);
    setSelectedMarkerId(marker.id);
    
    // Clear selection after animation
    setTimeout(() => {
      setSelectedMarkerId(null);
    }, 2000);
  };

  const handleDeleteMarker = (id: number) => {
    setMarkers(markers.filter(marker => marker.id !== id));
    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  };

  const handleCenterMap = () => {
    setMapCenter([39.8283, -98.5795]);
    setMapZoom(4);
    setSelectedMarkerId(null);
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200 p-4 transition-all duration-300">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Interactive Map
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-blue-400"
                disabled={isSearching}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <button
              onClick={handleCenterMap}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Navigation className="w-5 h-5" />
              <span>Center Map</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Locations</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {markers.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              💡 Click anywhere on the map to add new markers
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {markers.map((marker) => (
                <div 
                  key={marker.id} 
                  className={`p-4 border rounded-xl transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                    selectedMarkerId === marker.id 
                      ? 'border-blue-400 bg-blue-50 shadow-lg scale-105' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{marker.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{marker.description}</p>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMarker(marker.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleGoToLocation(marker)}
                    className="mt-3 w-full text-sm text-blue-600 hover:text-blue-800 transition-all duration-200 py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium"
                  >
                    📍 Go to location
                  </button>
                </div>
              ))}
              
              {isAddingMarker && (
                <div className="p-4 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 animate-pulse">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Adding new marker...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full rounded-tl-2xl shadow-inner"
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapEvents onMapClick={handleMapClick} />
            
            {markers.map((marker) => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">{marker.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{marker.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Coordinates: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Instructions */}
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs transition-all duration-300 hover:shadow-2xl">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Quick Guide
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Click anywhere on the map to add markers</li>
              <li>• Use the search bar to find locations</li>
              <li>• Click on markers to see details</li>
              <li>• Use sidebar to navigate to locations</li>
            </ul>
          </div>
          
          {/* Loading overlay for search */}
          {isSearching && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-tl-2xl">
              <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-700 font-medium">Searching for location...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;