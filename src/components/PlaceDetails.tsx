import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Clock, Star, Globe, Navigation, Camera, Users } from 'lucide-react';

interface PlaceDetailsProps {
  place: {
    lat: number;
    lng: number;
    name: string;
    display_name?: string;
  } | null;
  onClose: () => void;
}

interface PlaceInfo {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    time: string;
  }>;
  photos?: string[];
  opening_hours?: string[];
  place_type?: string;
  amenities?: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place, onClose }) => {
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');

  useEffect(() => {
    if (place) {
      fetchPlaceDetails(place);
    }
  }, [place]);

  const fetchPlaceDetails = async (placeData: { lat: number; lng: number; name: string; display_name?: string }) => {
    setLoading(true);
    try {
      // First, get detailed place information from Nominatim
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${placeData.lat}&lon=${placeData.lng}&addressdetails=1&extratags=1&namedetails=1&accept-language=en`
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        
        // Extract place information
        const info: PlaceInfo = {
          name: placeData.name || nominatimData.display_name?.split(',')[0] || 'Unknown Place',
          address: nominatimData.display_name || 'Address not available',
          phone: nominatimData.extratags?.phone || nominatimData.extratags?.['contact:phone'],
          website: nominatimData.extratags?.website || nominatimData.extratags?.['contact:website'],
          place_type: nominatimData.type || nominatimData.category,
          coordinates: {
            lat: placeData.lat,
            lng: placeData.lng
          },
          // Mock data for demonstration (in real app, you'd use Google Places API or similar)
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          reviews: generateMockReviews(),
          photos: generateMockPhotos(),
          opening_hours: generateMockHours(),
          amenities: generateMockAmenities(nominatimData.type)
        };
        
        setPlaceInfo(info);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      // Fallback with basic information
      setPlaceInfo({
        name: placeData.name || 'Unknown Place',
        address: placeData.display_name || 'Address not available',
        coordinates: {
          lat: placeData.lat,
          lng: placeData.lng
        },
        rating: 4.0,
        reviews: [],
        photos: [],
        opening_hours: ['Hours not available'],
        amenities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockReviews = () => [
    {
      author: "Rajesh Kumar",
      rating: 5,
      text: "Excellent food and service! The traditional South Indian breakfast here is authentic and delicious.",
      time: "2 weeks ago"
    },
    {
      author: "Priya Sharma",
      rating: 4,
      text: "Good place for quick breakfast. The dosas are crispy and the sambar is flavorful.",
      time: "1 month ago"
    },
    {
      author: "Amit Patel",
      rating: 4,
      text: "Clean and hygienic. Staff is friendly and the prices are reasonable.",
      time: "3 weeks ago"
    }
  ];

  const generateMockPhotos = () => [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    "https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400"
  ];

  const generateMockHours = () => [
    "Monday: 6:00 AM - 10:00 PM",
    "Tuesday: 6:00 AM - 10:00 PM", 
    "Wednesday: 6:00 AM - 10:00 PM",
    "Thursday: 6:00 AM - 10:00 PM",
    "Friday: 6:00 AM - 10:00 PM",
    "Saturday: 6:00 AM - 10:00 PM",
    "Sunday: 6:00 AM - 10:00 PM"
  ];

  const generateMockAmenities = (placeType?: string) => {
    const baseAmenities = ["WiFi", "Air Conditioning", "Parking"];
    if (placeType?.includes('restaurant') || placeType?.includes('food')) {
      return [...baseAmenities, "Takeaway", "Dine-in", "Family Friendly", "Vegetarian Options"];
    }
    return baseAmenities;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!place) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">{placeInfo?.name}</h2>
              <div className="flex items-center space-x-4">
                {placeInfo?.rating && (
                  <div className="flex items-center space-x-1">
                    {renderStars(placeInfo.rating)}
                    <span className="ml-2 text-white/90">{placeInfo.rating.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-white/80 capitalize">{placeInfo?.place_type}</span>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['overview', 'reviews', 'photos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Address</h3>
                      <p className="text-gray-600 text-sm">{placeInfo?.address}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  {placeInfo?.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Phone</h3>
                        <a href={`tel:${placeInfo.phone}`} className="text-blue-600 text-sm hover:underline">
                          {placeInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {placeInfo?.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Website</h3>
                        <a href={placeInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Hours */}
                  {placeInfo?.opening_hours && (
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Hours</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          {placeInfo.opening_hours.map((hour, index) => (
                            <div key={index}>{hour}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {placeInfo?.amenities && placeInfo.amenities.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {placeInfo.amenities.map((amenity, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {placeInfo?.reviews && placeInfo.reviews.length > 0 ? (
                    placeInfo.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{review.author}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-xs text-gray-500">{review.time}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{review.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No reviews available</p>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="grid grid-cols-2 gap-4">
                  {placeInfo?.photos && placeInfo.photos.length > 0 ? (
                    placeInfo.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`${placeInfo.name} photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-gray-500 text-center py-8">
                      <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No photos available</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              📍 {placeInfo?.coordinates.lat.toFixed(6)}, {placeInfo?.coordinates.lng.toFixed(6)}
            </div>
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${placeInfo?.coordinates.lat},${placeInfo?.coordinates.lng}`;
                window.open(url, '_blank');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};