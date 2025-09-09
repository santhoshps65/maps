import L from 'leaflet';

// Custom marker icons with attractive designs
export const createCustomMarker = (color: string = '#3B82F6', icon: string = '📍') => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transform: rotate(-45deg);
        position: relative;
      ">
        <span style="transform: rotate(45deg); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
          ${icon}
        </span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Location-specific markers
export const locationMarkers = {
  current: createCustomMarker('#10B981', '🎯'),
  search: createCustomMarker('#3B82F6', '🔍'),
  restaurant: createCustomMarker('#EF4444', '🍽️'),
  hotel: createCustomMarker('#8B5CF6', '🏨'),
  hospital: createCustomMarker('#F59E0B', '🏥'),
  school: createCustomMarker('#06B6D4', '🎓'),
  park: createCustomMarker('#22C55E', '🌳'),
  shopping: createCustomMarker('#EC4899', '🛍️'),
  gas: createCustomMarker('#F97316', '⛽'),
  bank: createCustomMarker('#6366F1', '🏦'),
  default: createCustomMarker('#3B82F6', '📍')
};

// Pulsing marker for current location
export const createPulsingMarker = () => {
  return L.divIcon({
    html: `
      <div style="position: relative;">
        <div style="
          background: #10B981;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          position: relative;
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.3);
          animation: pulse 2s infinite;
          z-index: 1;
        "></div>
        <style>
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.5);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 0;
            }
          }
        </style>
      </div>
    `,
    className: 'pulsing-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Custom cluster icon
export const createClusterIcon = (count: number) => {
  const size = count < 10 ? 40 : count < 100 ? 50 : 60;
  const color = count < 10 ? '#3B82F6' : count < 100 ? '#F59E0B' : '#EF4444';
  
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 40 ? '16px' : '14px'};
        position: relative;
      ">
        ${count}
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #10B981;
          border-radius: 50%;
          border: 2px solid white;
        "></div>
      </div>
    `,
    className: 'cluster-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};