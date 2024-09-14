import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { ArrowLeftIcon } from 'react-native-heroicons/solid'
import { useNavigation } from '@react-navigation/native';
import TextBox from './components/TextBox';
import NavigationService, { navigationRef } from '../context/NavigationService';
import CustomButton from './components/CustomButton';
import { StyleSheet, Alert, Platform, PermissionsAndroid, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import GenericDropdown from './components/DropDownMenu';
import { launchCamera } from 'react-native-image-picker';
import { CameraIcon } from 'react-native-heroicons/outline';

const ReportAccident = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/accident_types.json'; // Replace with your JSON URL
  const [imageUri, setImageUri] = useState(null);
  
  useEffect(() => {
    const getLocation = async () => {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({
              latitude,
              longitude,
              latitudeDelta: 24.930107447355187,
              longitudeDelta: 67.11535853040111,

            });
          },
          (error) => {
            setErrorMsg('Unable to get location');
            console.log(error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      } else {
        Alert.alert('Permission denied', 'You need to grant location permissions to use this feature.');
        setErrorMsg('Permission to access location was denied');
      }
    };

    getLocation();
  }, []);

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // No permission needed for iOS
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

const openCamera = async () => {
    // Check for camera permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Camera Permission Denied', 'Cannot access the camera without permission.');
      return;
    }

    const options = {
      mediaType: 'photo',
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  return (

    <View className="flex-1 bg-white">
      <SafeAreaView className="flex">
        <View className="flex-row justify-start">
          <TouchableOpacity className="p-2 ml-2"
            onPress={() => NavigationService.goBack()}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView className='px-8 '>
        <Text className="flex text-center text-gray-800 text-2xl">
          REPORT ACCIDENT
        </Text>

        {location ? (
          <View className='h-24'>
            <MapView
              style={styles.map}
              initialRegion={location}
              showsUserLocation
            >
              <Marker coordinate={location} />
            </MapView>
          </View>
        ) : (
          <View style={styles.container}>
            {errorMsg && <Text>{errorMsg}</Text>}
          </View>
        )}

        <TextBox label='Nearest LandMark' />

        <GenericDropdown className='bg-slate-200'
            dataUrl={DATA_URL}
            valueField="value"
            labelField="label"
            imageField="image"
            placeholder="Select Accident Type" // Pass the callback function
          />

        <TextBox label='Cause of Accident'/>

        <TextBox label="Total Number of Affecties" keyboardType='number'/>

        <TextBox label="Age of Affecties" keyboardType='number'/>

        <TextBox label='Gender Of Affecties'/>

        <TextBox label='Gender Of Affecties'/>

        <TextBox label='Other Details'/>

        {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
      )}
        <CustomButton
         onPress={openCamera} 
        title='Take Photo' 
        IconComponent={CameraIcon}
        variant='outlined'
        /> 
        <CustomButton onPress={() => NavigationService.navigate('Home')} title='SUBMIT' />
      </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: 100
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});
export default ReportAccident;
