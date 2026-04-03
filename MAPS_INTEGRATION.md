# Adaptive Maps Integration

This project now supports both Google Maps and Ola Maps with automatic fallback functionality.

## How It Works

1. **Primary**: The system first tries to load Google Maps using the API key from your backend settings
2. **Fallback**: If Google Maps fails to load or no API key is available, it automatically falls back to Ola Maps
3. **Seamless**: The fallback is transparent to users - they get the same functionality regardless of which maps provider is active

## Configuration

### Backend Settings
In your admin settings, you can configure:
- **Google Maps API Key**: Primary maps provider
- **Ola Maps API Key**: Fallback maps provider (defaults to: `6892e43ddb979dd4fb138b36`)

### Environment Variables
You can also set these in your `.env` file:
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_OLA_MAPS_API_KEY=6892e43ddb979dd4fb138b36
```

## Usage

### Basic Map Component
```jsx
import AdaptiveMap from 'components/Maps/AdaptiveMap';

<AdaptiveMap
  center={{ lat: 29.1492, lng: 75.7217 }}
  zoom={13}
  onClick={handleMapClick}
>
  <Marker position={markerPosition} />
  <Circle
    center={markerPosition}
    radius={5000}
    options={{
      strokeColor: "red",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "red",
      fillOpacity: 0.2,
    }}
  />
</AdaptiveMap>
```

### Custom Hook
```jsx
import { useMapsApi } from 'hooks/useMapsApi';

function MyComponent() {
  const { isLoaded, loadError, apiType, apiKey } = useMapsApi();
  
  if (apiType === 'google') {
    // Google Maps specific logic
  } else if (apiType === 'ola') {
    // Ola Maps specific logic
  }
}
```

## Components Updated

The following components now use the adaptive maps system:
- `AddServiceArea.js` - Service area creation with maps
- `EditZone.js` - Zone editing with maps
- `City.js` - City management with maps
- `EditCity.js` - City editing with maps

## Features

### Google Maps (Primary)
- Full interactive maps
- Geocoding support
- Places autocomplete
- All standard Google Maps features

### Ola Maps (Fallback)
- Basic map display
- Coordinate display
- API key validation
- Extensible for future Ola Maps features

## Error Handling

The system gracefully handles:
- Missing API keys
- Network failures
- API quota exceeded
- Invalid API keys

## Future Enhancements

- Full Ola Maps integration with their SDK
- Additional maps providers (Mapbox, OpenStreetMap)
- Automatic provider switching based on performance
- Caching for better user experience

## Troubleshooting

### Maps Not Loading
1. Check if Google Maps API key is valid
2. Verify Ola Maps API key is set
3. Check browser console for errors
4. Ensure network connectivity

### Fallback Not Working
1. Verify Ola Maps API key in settings
2. Check if Google Maps is properly failing
3. Review browser console for error messages

## Support

For issues with:
- **Google Maps**: Check your Google Cloud Console and billing
- **Ola Maps**: Verify your Ola Maps API key and quota
- **Integration**: Review the console logs and network requests 