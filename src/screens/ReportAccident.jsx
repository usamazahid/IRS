import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import TextBox from './components/TextBox';
import NavigationService from '../context/NavigationService';
import CustomButton from './components/CustomButton';
import { StyleSheet, Alert } from 'react-native';
import GenericDropdown from './components/DropDownMenu';
import AudioRecorder from './components/AudioRecorder';
import AudioPlayer from './components/AudioPlayer';
import {API_BASE_URL} from '@env';
import TopBar from './components/TopBarComponent';
import MapComponent from './components/MapComponent';
import CameraComponent from './components/CameraComponent';
import { readAudioFileAsBase64 } from '../utils/AudioUtils';
import { uploadAudioToBackend } from '../services/audioService';


const ReportAccident = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const ACCIDENT_TYPES_URL = `${API_BASE_URL}/irs/lov/accident_types`;
  const PATIENT_VICTIM_URL = `${API_BASE_URL}/irs/lov/patient_victim`;
  const VECHILE_INVOLVED_URL = `${API_BASE_URL}/irs/lov/vechile_involved`;
  // const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/accident_types.json';
  const [imageUri, setImageUri] = useState(null);


  const [audioPath, setAudioPath] = useState(null);

  const handleRecordingComplete = (path) => {
    setAudioPath(path);
  };

   // Function to convert audio file to base64 or binary and send to backend
  const submitAudioToBackend = async () => {
    if (!audioPath) {
      Alert.alert('Error', 'No audio file recorded.');
      return;
    }

    const audioData = await readAudioFileAsBase64(audioPath);
    if (audioData) {
      await uploadAudioToBackend(audioData, 'recording.mp3');
    }
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
       <TopBar/>
      <ScrollView className="px-8 ">
        <Text className="flex text-center text-gray-800 text-2xl">
          REPORT ACCIDENT
        </Text>

          <MapComponent location={location} setLocation={setLocation} style={styles.map} />


        <TextBox label="Nearest LandMark" />

          <Text className={'mt-2 left-3 bg-white text-sm font-semibold text-gray-400 z-10'}>
            {'ACCIDENT TYPE'}
          </Text>

        <GenericDropdown className="bg-slate-200"
            dataUrl={ACCIDENT_TYPES_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Accident Type" // Pass the callback function
          />

           <Text className={'mt-2 left-3 bg-white text-sm font-semibold text-gray-400 z-10'}>
            {'VECHILE INVOLVED'}
          </Text>
        <GenericDropdown className="bg-slate-200"
            dataUrl={VECHILE_INVOLVED_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Vechile Involved" // Pass the callback function
          />
        <Text className={'mt-2 left-3 bg-white text-sm font-semibold text-gray-400 z-10'}>
            {'PATIENT VICTIM'}
          </Text>
        <GenericDropdown className="bg-slate-200"
            dataUrl={PATIENT_VICTIM_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Patient Victim" // Pass the callback function
          />


        <TextBox label="Cause of Accident"/>



        <TextBox label="Total Number of Affecties" keyboardType="number"/>

        <TextBox label="Age of Affecties" keyboardType="number"/>

        <TextBox label="Gender Of Affecties"/>



        <TextBox label="Other Details"/>


      <CameraComponent onCapture={(uri) => setImageUri(uri)} editable={true}  /> 
      {/* <CameraComponent initialUri={savedUri} editable={false} /> */}

        {/* Recorder with a 1-minute time limit */}
      <AudioRecorder expiryTime={60000} onRecordingComplete={handleRecordingComplete} />

      {/* Show the player if there is recorded audio */}
      {audioPath && <AudioPlayer audioPath={audioPath} />}

        <CustomButton onPress={() => NavigationService.navigate('Confirmation')} title="SUBMIT" />
      </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: { height: 150, marginVertical: 20 },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});
export default ReportAccident;
