import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  Platform
} from 'react-native';
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getFilteredHeatMapDataWithBBox } from '../../services/accidentService';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import Geolocation from '@react-native-community/geolocation';

interface AccidentData {
  id: number;
  latitude: number;
  longitude: number;
  severity?: number;
}

interface AccidentHeatmapProps {
  limit?: number;
  vehicleType?: string;
  accidentType?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
}

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const HEATMAP_CONFIG = {
  radius: 35,
  opacity: 0.8,
  gradient: {
    colors: ['#00ff0000', '#00ff0088', '#ff0000ff'],
    startPoints: [0.1, 0.25, 1],
    colorMapSize: 512
  },
};

const AccidentHeatmap: React.FC<AccidentHeatmapProps> = ({
  limit = 100,
  vehicleType,
  accidentType,
  startDate,
  endDate,
  severity,
}) => {
  const [accidentData, setAccidentData] = useState<AccidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<MapView>(null);
 const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);


  const fetchHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFilteredHeatMapDataWithBBox(
        limit,
        vehicleType,
        accidentType,
        startDate,
        endDate,
        severity
      );
      setAccidentData(data);
      console.log('refreshed');
      setError('');
    } catch (err) {
      setError('Failed to load heatmap data');
      console.error('Heatmap error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit,vehicleType, accidentType, startDate, endDate, severity]);

    // Request location permission
  const requestLocationPermission = useCallback(async () => {
   const permission = Platform.select({
           ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
           android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
         });
   
         if (permission) {
           const result = await request(permission);
           if(result==RESULTS.GRANTED){
            return true;
           }
         }
         return false;
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        mapRef.current?.animateCamera({
          center: { latitude, longitude },
          zoom: 14,
        });
      },
      error => {
        console.error('Location error:', error);
        setError('Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [requestLocationPermission]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);


  // Use useMemo for performance: compute heatmap points only when accidentData changes.
  const heatmapPoints = useMemo(() => {
    if (accidentData.length === 0) return [];
    return accidentData.map(accident => ({
      latitude: Number(accident.latitude),
      longitude: Number(accident.longitude),
      weight: accident.severity ? Number(accident.severity) : 1,
    }));
  }, [accidentData]);

  // Add memoized heatmap here
  const memoizedHeatmap = useMemo(
    () => (
      <Heatmap
        points={heatmapPoints}
        {...HEATMAP_CONFIG}
      />
    ),
    [heatmapPoints]
  );


    const handleZoomIn = () => {
      if (mapRef.current) {
        mapRef.current.getCamera().then(camera => {
          if (camera.zoom && camera.zoom < 20) {  // Max zoom level
            const newCamera = {
              ...camera,
              zoom: camera.zoom + 1
            };
            mapRef.current?.animateCamera(newCamera, { duration: 300 });
          }
        });
      }
    };

    const handleZoomOut = () => {
      if (mapRef.current) {
        mapRef.current.getCamera().then(camera => {
          if (camera.zoom && camera.zoom > 3) {  // Min zoom level
            const newCamera = {
              ...camera,
              zoom: camera.zoom - 1
            };
            mapRef.current?.animateCamera(newCamera, { duration: 300 });
          }
        });
      }
    };

    
    // Helper function for marker colors based on severity
    const getSeverityColor = (severity: number) => {
      if (severity <= 3) return '#00ff00'; // Green for low severity
      if (severity <= 6) return '#ffa500'; // Orange for medium severity
      return '#ff0000'; // Red for high severity
    };


  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchHeatmapData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={DEFAULT_REGION}
            mapType="hybrid"
            minZoomLevel={3}
            maxZoomLevel={20}
            loadingEnabled={true}
            loadingIndicatorColor="#666"
            loadingBackgroundColor="#fff"
          >
            {heatmapPoints.length > 0 && memoizedHeatmap}

            {/* Optional: render markers for each accident to enhance visibility */}
            {accidentData.map(accident => (
              <Marker
                key={accident.id}
                coordinate={{
                  latitude: Number(accident.latitude),
                  longitude: Number(accident.longitude),
                }}
                title={`Accident ${accident.id}`}
                description={`Severity: ${accident.severity || 'N/A'}`}
                pinColor={accident.severity ? getSeverityColor(accident.severity) : '#ff0000'}
                opacity={0.8}

              />
            ))}

            
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                title="Your Location"
                pinColor="#2A5CFF"
              />
            )}

          </MapView>
          {/* Custom Zoom Controls */}
            
          <View style={styles.zoomControlContainer}>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.buttonText}>📍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.zoomButtonText}>–</Text>
            </TouchableOpacity>
        </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get('window').height * 0.7,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  zoomControlContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
  },
  zoomButton: {
    backgroundColor: '#007AFF', // Blue background for better visibility
    padding: 15, // Increased padding
    marginVertical: 5,
    borderRadius: 50, // Circular buttons
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    fontSize: 24, // Larger font size
    fontWeight: 'bold',
    color: '#fff', // White text for contrast
  },
    retryButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'red',
  },
  retryButtonText: {
    color: 'red',
    fontSize: 16,
  },
  locationButton: {
     backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  // ... keep other existing styles and add:
  buttonText: {
    fontSize: 24,
  },
});

export default AccidentHeatmap;
