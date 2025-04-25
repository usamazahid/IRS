import React, { useState, useEffect } from 'react';
import { 
  View, 
  Alert, 
  Image, 
  StyleSheet, 
  Platform, 
  PermissionsAndroid, 
  TouchableOpacity, 
  ScrollView,
  Text
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { CameraIcon } from 'react-native-heroicons/outline';
import CustomButton from './CustomButton';

interface CameraComponentProps {
  onCapture: (uris: string[]) => void; // Returns an array of image URIs
  initialUris?: string[];              // Optional: initial images if any
  editable: boolean;
  maxPhotos:number;                   // If false, user cannot add/remove images
}

const MultipleCameraComponent: React.FC<CameraComponentProps> = ({ onCapture, initialUris = [], editable, maxPhotos = 5 }) => {
  const [images, setImages] = useState<string[]>(initialUris);

  useEffect(() => {
    if (initialUris && initialUris.length > 0) {
      setImages(initialUris);
    }
  }, [initialUris]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    if (images.length >= maxPhotos) {
      Alert.alert(`Maximum ${maxPhotos} photos allowed`);
      return;
    }
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
          const newImages = [...images, uri];
          setImages(newImages);
          onCapture(newImages);
        } else {
          Alert.alert('Error', 'Image URI is not available.');
        }
      }
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onCapture(newImages);
  };

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              {editable && (
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      {
        <CustomButton
          onPress={openCamera}
          title="Take Photo"
          IconComponent={CameraIcon}
          variant="outlined"
          disabled={!editable}
        />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  removeText: {
    color: 'white',
    fontSize: 12,
  },
  disabledButton: { opacity: 0.5 }, // visually indicate disabled
});

export default MultipleCameraComponent;