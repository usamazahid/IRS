// components/MapComponent.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
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
            },
            (error) => {
              setErrorMsg('Unable to get location: ' + error.message);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        } else {
          setErrorMsg('Permission to access location was denied');
        }
      } else {
        setErrorMsg('Platform not supported');
      }
    };
  
    if (editable && !location) { // Only fetch location once if editable
      getLocation();
    }
  }, [editable]); // No dependency on `location`
  
  return (
    <View style={style}>
      {location ? (
        <MapView
          style={StyleSheet.flatten([styles.map, style])}
          region={location} // Use region prop instead of initialRegion for real-time updates
          showsUserLocation={editable}
          onRegionChangeComplete={(region) => {
            if (editable) setLocation(region); // Update location only if editable
          }}
        >
          <Marker coordinate={location} />
        </MapView>
      ) : (
        <View style={styles.errorContainer}>
          {errorMsg && <Text>{errorMsg}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 200,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapComponent;
