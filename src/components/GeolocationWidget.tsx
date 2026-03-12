import { useState } from 'react';
import { MapPin, Loader, AlertCircle, X } from 'lucide-react';
import { getUserLocation, getNearbyLocations, GeoLocation } from '../lib/geolocation';

interface GeolocationWidgetProps {
  onLocationSelect: (location: GeoLocation) => void;
  isLoading?: boolean;
}

export default function GeolocationWidget({
  onLocationSelect,
  isLoading = false,
}: GeolocationWidgetProps) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nearby, setNearby] = useState<GeoLocation[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleDetectLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const userLocation = await getUserLocation();
      setLocation(userLocation);
      onLocationSelect(userLocation);

      // Get nearby locations
      const nearbyLocations = getNearbyLocations(
        userLocation.latitude,
        userLocation.longitude,
        50
      );
      setNearby(nearbyLocations);
    } catch (err) {
      setError('Failed to detect location. Please try again.');
      console.error('Geolocation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sticky Location Header */}
      <div className="sticky top-16 bg-blue-50 border-b border-blue-200 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => setShowModal(true)}>
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-600">Delivering to</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {location ? `${location.city} ${location.pincode}` : 'Select Location'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition"
            >
              Update location
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Delivery Location</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {location && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">{location.city}, {location.state}</p>
                  <p className="text-xs text-gray-600 mt-1">{location.address}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">Pincode: {location.pincode}</p>
                </div>
              )}

              <button
                onClick={handleDetectLocation}
                disabled={loading || isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition text-sm"
              >
                {loading || isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Detect My Location
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {nearby.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Nearby Delivery Areas</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {nearby.map((loc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setLocation(loc);
                          onLocationSelect(loc);
                          setShowModal(false);
                        }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                      >
                        <p className="font-medium text-gray-900 text-sm">{loc.city}, {loc.state}</p>
                        <p className="text-xs text-gray-600">{loc.address}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">{loc.pincode}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
