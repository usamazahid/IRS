import React, { useState,useEffect } from 'react';
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
import GenericDropDownMenu from './components/GenericDropDownMenu';
import AudioRecorder from './components/AudioRecorder';
import AudioPlayer from './components/AudioPlayer';
import {API_BASE_URL} from '@env';
import TopBar from './components/TopBarComponent';
import MapComponent from './components/MapComponent';
import CameraComponent from './components/CameraComponent';
import { readAudioFileAsBase64 } from '../utils/AudioUtils';
import { submitAccidentReport } from '../services/accidentService';
import { compressImage } from '../utils/ImageUtils';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllLovs } from '../redux/slices/dropdownSlice'; // Import the action

import NetInfo from '@react-native-community/netinfo';
import { saveReportOffline } from '../services/OfflineService';
const ReportAccident = () => {
  const { user, role, permissions } = useSelector((state) => state.auth);
  const ACCIDENT_TYPES_URL = `${API_BASE_URL}/irs/getAccidentTypes`;
  const PATIENT_VICTIM_URL = `${API_BASE_URL}/irs/getPatientVictim`;
  const VECHILE_INVOLVED_URL = `${API_BASE_URL}/irs/getVehicleInvolved`;
  // const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/accident_types.json';
  // Add state for submission status
const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const [mapLocation,setMapLocation]=useState(null);
  // Access dropdown data, error, and loading state from Redux
  const {accidentTypes,
  patientVictim,
  vehicleInvolved,apparentCauses,genderTypes} = useSelector((state) => state.dropdown);

  useEffect(() => {
    // If no data in Redux, fetch from the API
    if (!accidentTypes || accidentTypes.length === 0) { 
      console.log('data caling')
        dispatch(fetchAllLovs())
                  .unwrap().then(() => {});
    }
  }, [  accidentTypes,dispatch]);

  const [formData, setFormData] = useState({
    accidentTypeLabel: '',
    accidentTypeDescription: '',
    gender: null,
    latitude: null,
    longitude: null,
    accidentTypeId: '',
    cause: '',
    description: '',
    numAffecties: '',
    userId: user.id, // Replace with logged-in user ID
    patientVictimId: '',
    createdAt: '',
    vehicleInvolvedId: '',
    imageUri: null,
    location: null,
    audioUri: null,
    age: '',
    status: 'PENDING',
    nearestLandMark:'',
    imageData:null,
    audioData:null
  });

  const genderData = [
    {id:1,  label: 'Male', value: 'male' },
    {id:2,  label: 'Female', value: 'female' },
    {id:3,  label: 'Other', value: 'other' }
  ];

  const inputHandling = (fieldName, data) => {
    console.log(data);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };
  const handleSubmit = async () => {
     try {
        setIsSubmitting(true);
          const audioData = formData.audioUri
            ? await readAudioFileAsBase64(formData.audioUri)
            : null;
          const imageData=formData.imageUri ? (await compressImage(formData.imageUri)):null;
          formData.imageData=imageData;
          formData.audioData=audioData;
          const reportPayload = {
            ...formData,
            latitude: formData.latitude || 0.1,
            longitude: formData.longitude || 0.1,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };
           const netInfo = await NetInfo.fetch();
          if (!netInfo.isConnected  && !netInfo.isInternetReachable) {
            // 🛑 No internet, save the report offline immediately
            Alert.alert('No Internet', 'Saving report offline for later submission.');
            await saveReportOffline(reportPayload);
            NavigationService.navigate('Confirmation');
            return;
          } else {
            try {
              const response = await submitAccidentReport(reportPayload);
              if (response.id) {
                NavigationService.navigate('Confirmation');
              } else {
                Alert.alert('Error', `Submission failed: ${response.error}`);
              }
            } catch (error) {
              console.error('Submission error:', error);
              Alert.alert('Error', 'Failed to submit the report. Saving offline...');
              await saveReportOffline(reportPayload);
               NavigationService.navigate('Confirmation');
            }
          }
        } catch (error) {
          Alert.alert('Error', 'Submission failed');
          console.error(error);
        }finally {
        setIsSubmitting(false);
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

        <MapComponent 
        location={mapLocation} 
        setLocation={(region) => {
          setMapLocation(region);
          inputHandling('latitude', region.latitude);
          inputHandling('longitude', region.longitude);
        }}
      />



        <TextBox label="Nearest LandMark" onChangeText={(text) => inputHandling('nearestLandMark', text)}/>

          <Text className={'mt-2 left-3 bg-white text-sm font-semibold text-gray-400 z-10'}>
            {'ACCIDENT TYPE'}
          </Text>

        <GenericDropDownMenu className="bg-slate-200"
            dataUrl={ACCIDENT_TYPES_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Accident Type" // Pass the callback function
            data={accidentTypes}
            onItemSelect={(value) => {inputHandling('accidentTypeId', value.id);inputHandling('accidentTypeLabel', value.label);inputHandling('accidentTypeDescription', value.description)}}
          />

           <Text className={'mt-2 left-3 bg-white text-sm font-semibold text-gray-400 z-10'}>
            {'VECHILE INVOLVED'}
          </Text>
        <GenericDropDownMenu className="bg-slate-200"
            dataUrl={VECHILE_INVOLVED_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Vechile Involved" // Pass the callback function
            data={vehicleInvolved}
            onItemSelect={(value) => inputHandling('vehicleInvolvedId', value.id)}
          />
        <Text className={'mt-2 left-3 bg-white text-sm font-semibold text-gray-400 z-10'}>
            {'PATIENT VICTIM'}
        </Text>
        <GenericDropDownMenu className="bg-slate-200"
            dataUrl={PATIENT_VICTIM_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Patient Victim" // Pass the callback function
            data={patientVictim}
            onItemSelect={(value) => { 
              inputHandling('patientVictimId', value.id)}}
          />
        <GenericDropDownMenu className="bg-slate-200"
          // dataUrl={PATIENT_VICTIM_URL}
          data={genderTypes}
          valueField="id"
          labelField="label"
          placeholder="Select Gender" // Pass the callback function
          onItemSelect={(value) => {
            inputHandling('gender', value.id)}}
        />

        <GenericDropDownMenu className="bg-slate-200"
          data={apparentCauses}
          valueField="id"
          labelField="cause"
          imageField="image"
          placeholder="Select Apparent Cause"
          onItemSelect={(item) => setFormData(prev => ({ ...prev, cause: item.id }))}
        />
        <TextBox
          label="Total Number of Affected"
          keyboardType="numeric"
          onChangeText={(text) => inputHandling('numAffecties', text)}
        />
        <TextBox
          label="Age of Affected"
          keyboardType="numeric"
          onChangeText={(text) => inputHandling('age', text)}
        />
        {/* <TextBox
          label="Gender of Affected"
          onChangeText={(text) => inputHandling('gender', text)}
        /> */}

        <TextBox label="Other Details"
        onChangeText={(text) => inputHandling('description', text)}
        />


      <CameraComponent onCapture={(uri) => inputHandling('imageUri', uri)} editable={true}  /> 
      {/* <CameraComponent initialUri={savedUri} editable={false} /> */}

        {/* Recorder with a 1-minute time limit */}
      <AudioRecorder expiryTime={60000} onRecordingComplete={(path)=>inputHandling('audioUri', path)} />

      {/* Show the player if there is recorded audio */}
      {formData.audioUri && <AudioPlayer audioPath={formData.audioUri} />}

         <CustomButton onPress={handleSubmit} title="SUBMIT"  disabled={isSubmitting}
        loading={isSubmitting}/>
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
