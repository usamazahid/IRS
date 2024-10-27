import React, { useState, useEffect } from 'react';
import { View, Alert, Image, StyleSheet, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { CameraIcon } from 'react-native-heroicons/outline';
import CustomButton from './CustomButton';

interface CameraComponentProps {
  onCapture: (uri: string) => void;
  initialUri?: string;  // Optional initial URI for view-only mode
  editable: boolean;    // Determines if the component is editable
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, initialUri, editable }) => {
  const [imageUri, setImageUri] = useState<string | null>(initialUri || null);

  useEffect(() => {
    if (initialUri) {
      setImageUri(initialUri);
    }
  }, [initialUri]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to take photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Camera Permission Denied', 'Cannot access the camera without permission.');
      return;
    }

    launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setImageUri(uri);
          onCapture(uri);  // Pass URI to parent component
        } else {
          Alert.alert('Error', 'Image URI is not available.');
        }
      }
    });
  };

  const clearImage = () => {
    setImageUri(null);
    onCapture('');  // Pass empty URI to indicate no image
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {editable && (
            <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
              <CustomButton title="Clear Photo" onPress={clearImage} variant="outlined" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        editable && (
          <CustomButton
            onPress={openCamera}
            title="Take Photo"
            IconComponent={CameraIcon}
            variant="outlined"
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  clearButton: {
    marginTop: 10,
  },
});

export default CameraComponent;
