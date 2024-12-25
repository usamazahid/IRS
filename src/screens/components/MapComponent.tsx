import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface MapComponentProps {
  location: Region | null;
  setLocation: (location: Region) => void;
  editable?: boolean; // New editable prop
  style?: StyleProp<ViewStyle>;
}

const MapComponent: React.FC<MapComponentProps> = ({ location, setLocation, editable = true, style }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Track loading state 
  useEffect(() => {
    const getLocation = async () => {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      if (permission) {
        const result = await request(permission);
        if (result === RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLocation({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              setLoading(false); // Stop loading after location is fetched
            },
            (error) => {
              setErrorMsg('Unable to get location: ' + error.message);
              setLoading(false); // Stop loading on error
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        } else {
          setErrorMsg('Permission to access location was denied');
          setLoading(false); // Stop loading on permission error
        }
      } else {
        setErrorMsg('Platform not supported');
        setLoading(false); // Stop loading if platform is not supported
      }
    };

    if (!location) { // Fetch location only if location is null
      getLocation();
    }
  }, [location]); // Trigger the effect if location changes
  
  
  const [isDragging, setIsDragging] = useState(false);

const handleLocation = (region: Region) => {
  if (!isDragging && editable) {
    setLocation(region);
  }
};
  return (
    <View style={[styles.container, style]}>
      {loading ? (
        <View style={styles.errorContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : location ? (
        <MapView
          style={styles.map}
          region={location} // Use region prop for real-time updates
          showsUserLocation={editable}
          onRegionChange={() => setIsDragging(true)} // Triggered during map dragging
          onRegionChangeComplete={(region) => {
            setIsDragging(false); // Dragging stopped
            handleLocation(region); // Handle the final region change
          }}
        >
          <Marker coordinate={location} />
        </MapView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load map, location is invalid.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes full screen space
  },
  map: {
     height: 200,
     marginVertical: 20,
    flex: 1, // Ensure MapView takes all available space in the container
  },
  errorContainer: {
    flex: 1, // Make sure the error container takes full space
    alignItems: 'center', // Center the error and loading message
    justifyContent: 'center', // Vertically center the message
  },
  errorText: {
    color: 'red', // Style the error message
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'green',
  },
});

export default MapComponent;
