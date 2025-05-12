import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import {getFilteredClusteringDataWithBBox } from '../../services/accidentService';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

interface ClusterPoint {
  latitude: number;
  longitude: number;
  id?: string;
  severity?: number;
}

interface ClusterData {
  center: {
    latitude: number;
    longitude: number;
  };
  points: ClusterPoint[];
  pointsLength: number;
  isBlackSpot: boolean;
}

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

interface AccidentClusteringProps {
  limit?: number;
  vehicleType?: string;
  accidentType?: string;
  range?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
}

const AccidentClustering: React.FC<AccidentClusteringProps> = ({
  limit = 100,
  vehicleType,
  accidentType,
  range,
  startDate,
  endDate,
  severity,
}) => {
  const [clusterData, setClusterData] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<MapView>(null);

  const fetchClusteringData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFilteredClusteringDataWithBBox(
        limit,
        vehicleType,
        accidentType,
        range,
        startDate,
        endDate,
        severity
      );
      setClusterData(data);
      setError('');
    } catch (err) {
      setError('Failed to load clustering data');
      console.error('Clustering error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, vehicleType, accidentType, range, startDate, endDate, severity]);

  useEffect(() => {
    fetchClusteringData();
  }, [fetchClusteringData]);

  const getSeverityColor = (severity?: number) => {
    // Severity ranges match the filter panel ranges:
    // Unknown: Gray
    // Low: 1-3 (Green)
    // Medium: 4-6 (Orange)
    // High: 7-10 (Red)
    if (!severity) return '#808080'; // Gray for unknown severity
    if (severity <= 3) return '#00ff00'; // Green for low severity
    if (severity <= 6) return '#ffa500'; // Orange for medium severity
    return '#ff0000'; // Red for high severity (7-10)
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then(camera => {
        if (camera.zoom && camera.zoom < 20) {
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
        if (camera.zoom && camera.zoom > 3) {
          const newCamera = {
            ...camera,
            zoom: camera.zoom - 1
          };
          mapRef.current?.animateCamera(newCamera, { duration: 300 });
        }
      });
    }
  };

  const requestLocationPermission = useCallback(async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    if (permission) {
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        return true;
      }
    }
    return false;
  }, []);

  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
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

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchClusteringData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={DEFAULT_REGION}
            mapType="hybrid"
            minZoomLevel={3}
            maxZoomLevel={20}
            loadingEnabled={true}
          >
            {clusterData.map((cluster, clusterIndex) => (
              <React.Fragment key={`cluster-${clusterIndex}`}>
                <Marker
                  coordinate={cluster.center}
                  title={`Cluster ${clusterIndex + 1}`}
                  description={`${cluster.pointsLength} accidents`}
                  pinColor={cluster.isBlackSpot ? "#FF0000" : "#0000FF"}
                >
                  <View style={styles.clusterMarker}>
                    <Text style={styles.clusterText}>{cluster.pointsLength}</Text>
                  </View>
                </Marker>
                {cluster.points.map((point, pointIndex) => {
                  const uniqueKey = `point-${clusterIndex}-${point.latitude}-${point.longitude}-${point.id || pointIndex}`;
                  return (
                    <Marker
                      key={uniqueKey}
                      coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                      title={`Accident ${point.id || `Cluster ${clusterIndex + 1} - Point ${pointIndex + 1}`}`}
                      description={point.severity ? `Severity: ${point.severity}` : 'Unknown severity'}
                      pinColor={getSeverityColor(point.severity)}
                      opacity={0.6}
                    />
                  );
                })}
                <Circle
                  center={cluster.center}
                  radius={500}
                  strokeColor={cluster.isBlackSpot ? "rgba(255,0,0,0.5)" : "rgba(0,0,255,0.5)"}
                  fillColor={cluster.isBlackSpot ? "rgba(255,0,0,0.2)" : "rgba(0,0,255,0.2)"}
                />
              </React.Fragment>
            ))}
          </MapView>

          <View style={styles.zoomControlContainer}>
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Text style={styles.buttonText}>📍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.zoomButtonText}>–</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF0000' }]} />
              <Text style={styles.legendText}>Black Spot</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#0000FF' }]} />
              <Text style={styles.legendText}>Normal Cluster</Text>
            </View>
            {/* <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#00FF00' }]} />
              <Text style={styles.legendText}>Low Severity</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFA500' }]} />
              <Text style={styles.legendText}>Medium Severity</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF0000' }]} />
              <Text style={styles.legendText}>High Severity</Text>
            </View> */}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get('window').height * 0.7,
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
  zoomControlContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
  },
  zoomButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    marginVertical: 5,
    borderRadius: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    fontSize: 24,
  },
  clusterMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  clusterText: {
    fontWeight: 'bold',
    color: '#0000FF',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: '#000000',
  },
});

export default AccidentClustering;