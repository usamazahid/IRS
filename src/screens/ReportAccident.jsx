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
import { compressImage,fillImageDto } from '../utils/ImageUtils';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllLovs } from '../redux/slices/dropdownSlice'; // Import the action
import { hasRequiredPermissions } from '../utils/permissionUtils';
import NetInfo from '@react-native-community/netinfo';
import { saveReportOffline } from '../services/OfflineService';
import MultipleCameraComponent from './components/MulitpleCameraComponent';
import SimpleDropDownMenu from './components/SimpleDropDownMenu';
const ReportAccident = ({route}) => {
  const { user, role, permissions } = useSelector((state) => state.auth);
  const { initialData = null, editable: editableFlag = true } = route.params || {};
  const editable = Boolean(editableFlag);
  const ACCIDENT_TYPES_URL = `${API_BASE_URL}/irs/getAccidentTypes`;
  const PATIENT_VICTIM_URL = `${API_BASE_URL}/irs/getPatientVictim`;
  const VECHILE_INVOLVED_URL = `${API_BASE_URL}/irs/getVehicleInvolved`;
  // const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/accident_types.json';
  // Add state for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const dispatch = useDispatch();
  const [mapLocation,setMapLocation]=useState(null);
  // Access dropdown data, error, and loading state from Redux
  const {accidentTypes,
  patientVictim,
  vehicleInvolved,apparentCauses,genderTypes} = useSelector((state) => state.dropdown);

 const [formData, setFormData] = useState({
     //for offline reports
     accidentTypeLabel: '',
     accidentTypeDescription: '',
     viewOfflineReport: hasRequiredPermissions(permissions, ['view_offline_reports']),
     useCase:'ReportAccident',
     // Basic Info
     gender: null,
     latitude: null,
     longitude: null,
     accidentTypeId: '',
     cause: '',
     description: '',
     numAffecties: '',
     userId: user.id,
     patientVictimId: '',
     nearestLandMark: '',
     // Vehicle and Drivers
     drivers: [],
     vehicles: [],
     // Casualties
     casualties: [],
     // Accident Details
     weatherCondition: '',
     visibility: '',
     roadSurfaceCondition: '',
     roadType: '',
     roadMarkings: '',
     // Evidence
     imageUri: null,
     audioUri: null,
     videoUri: null,
     imageData: null,
     audioData: null,
     evidence: {
       photosTaken: false,
       videosRecorded: false,
       sketchPrepared: false
     },
     // Officer Info
     officerName: '',
     officerDesignation: '',
     officerContactNo: '',
     preliminaryFault: '',
     officerNotes: '',
     
     // Follow Up
     followUp: {
       firRegistered: false,
       firNumber: '',
       challanIssued: false,
       challanNumber: '',
       caseReferredTo: ''
     },
     
     // Witnesses
     witnesses: [],
     vehicleFitnessDetails:[],
     imageDTOs:[],
     imageUris:[]
   });

// initialize from initialData if view-mode
useEffect(() => {
  if (initialData) {
    setFormData(prev => ({ ...prev, ...initialData }));
    if (initialData.latitude && initialData.longitude) {
      setMapLocation({ latitude: initialData.latitude, longitude: initialData.longitude });
    }
    setCapturedImages(initialData.imageUris || []);
  }
}, [initialData]);

  const genderData = [
    {id:1,  label: 'Male', value: 'male' },
    {id:2,  label: 'Female', value: 'female' },
    {id:3,  label: 'Other', value: 'other' }
  ];
// Callback to receive images from CameraComponent
const handleImageCapture = (uris) => {
  setCapturedImages(uris);
  setFormData(prev => ({
    ...prev,
    imageUris: uris
  }));
};
  const inputHandling = (fieldName, data) => {
    console.log(data);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };
   // Main submit handler
   const handleSubmit = async () => {
    // Validation logic here
    try {
    setIsSubmitting(true);

      const audioData = formData.audioUri
        ? await readAudioFileAsBase64(formData.audioUri)
        : null;
      const imageData=formData.imageUri ? (await compressImage(formData.imageUri)):null;
      formData.imageData=imageData;
      formData.audioData=audioData;
      formData.imageDTOs =await fillImageDto(capturedImages);
      const reportPayload = {
        ...formData,
        latitude: formData.latitude || 0.1,
        longitude: formData.longitude || 0.1,
        status: 'PENDING',
        createdAt: new Date().toISOString()
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
          console.log('Submitting report:', reportPayload);
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

  useEffect(() => { 
    if (!accidentTypes || accidentTypes.length === 0) {
        dispatch(fetchAllLovs())
                  .unwrap().then(() => {});
    }
  }, [  accidentTypes,dispatch]);
  
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



          <TextBox label="Nearest LandMark" editable={editable} onChangeText={(text) => inputHandling('nearestLandMark', text)} value={formData.nearestLandMark}/>

          <SimpleDropDownMenu className="bg-slate-200"
            dataUrl={PATIENT_VICTIM_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Patient Victim" // Pass the callback function
            data={patientVictim}
            value={formData.patientVictimId}
            disabled={!editable}
            onItemSelect={(value) => { 
              inputHandling('patientVictimId', value.id)}}
          />

          <SimpleDropDownMenu className="bg-slate-200"
            dataUrl={VECHILE_INVOLVED_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Vechile Involved" // Pass the callback function
            data={vehicleInvolved}
            value={formData.vehicleInvolvedId}
            disabled={!editable}
            onItemSelect={(value) => inputHandling('vehicleInvolvedId', value.id)}
          />


        <GenericDropDownMenu className="bg-slate-200"
          data={genderTypes}
          valueField="id"
          labelField="label"
          placeholder="Select Gender" // Pass the callback function
          value={formData.gender}
            disabled={!editable}
          onItemSelect={(value) => {
            inputHandling('gender', value.label)}}
        />
       
          <GenericDropDownMenu className="bg-slate-200"
              dataUrl={ACCIDENT_TYPES_URL}
              valueField="id"
              labelField="label"
              imageField="image"
              placeholder="Select Accident Type" // Pass the callback function
              value={formData.accidentTypeId}
              disabled={!editable}
              data={accidentTypes}
              onItemSelect={(value) => {inputHandling('accidentTypeId', value.id);inputHandling('accidentTypeLabel', value.label);inputHandling('accidentTypeDescription', value.description)}}
            />

          <GenericDropDownMenu className="bg-slate-200"
              data={apparentCauses}
              valueField="id"
              labelField="cause"
              imageField="image"
              placeholder="Select Apparent Cause"
              value={formData.cause}
              disabled={!editable}
              onItemSelect={(item) => setFormData(prev => ({ ...prev, cause: item.id }))}
            />

        <TextBox
          label="Total Number of Affected"
          keyboardType="numeric"
          onChangeText={(text) => inputHandling('numAffecties', text)}
          editable={editable}
          value={String(formData.numAffecties)}
        />
        <TextBox
          label="Age of Affected"
          keyboardType="numeric"
          onChangeText={(text) => inputHandling('age', text)}
          editable={editable}
          value={String(formData.age || '')}
        />
        {/* <TextBox
          label="Gender of Affected"
          onChangeText={(text) => inputHandling('gender', text)}
        /> */}

        <TextBox label="Other Details"
        onChangeText={(text) => inputHandling('description', text)}
        editable={editable}
        value={formData.description}
        />


      {/* <CameraComponent onCapture={(uri) => inputHandling('imageUri', uri)} editable={true}  />  */}
      {/* <CameraComponent initialUri={savedUri} editable={false} /> */}
      <MultipleCameraComponent 
        onCapture={handleImageCapture} 
        editable={editable}
        initialUris={[]}
        maxPhotos = {2}
      />
        {/* Recorder with a 1-minute time limit */}
      <AudioRecorder expiryTime={60000} onRecordingComplete={(path)=>inputHandling('audioUri', path)} disabled={!editable}/>

      {formData.audioUri ? (
        <>
          <Text style={styles.text}>Click Button To Play Recorded Audio.</Text>
          <AudioPlayer audioPath={formData.audioUri}/>
        </>) : null}
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
  text:{
    fontSize: 16,
    color: 'grey',
    marginBottom: 10,
  }
});
export default ReportAccident;
