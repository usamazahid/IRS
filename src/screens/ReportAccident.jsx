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
import { submitAccidentReport, getAccidentDataById } from '../services/accidentService';
import { compressImage,fillImageDto } from '../utils/ImageUtils';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllLovs } from '../redux/slices/dropdownSlice'; // Import the action
import { hasRequiredPermissions } from '../utils/permissionUtils';
import NetInfo from '@react-native-community/netinfo';
import { saveReportOffline,removeOfflineReport } from '../services/OfflineService';
import MultipleCameraComponent from './components/MulitpleCameraComponent';
import SimpleDropDownMenu from './components/SimpleDropDownMenu';
// import axios from 'axios'; // Import axios for API requests

const ReportAccident = ({route}) => {
  console.log('=== ReportAccident screen rendered ===');
  console.log('Route params:', route.params);
  
  const { user, role, permissions } = useSelector((state) => state.auth);
  const { initialData = null, editable: editableFlag = true, isUpdateData: isUpdateDataFlag = false, isApiCallRequired = false, reportId = null } = route.params || {};
  const editable = Boolean(editableFlag);
  const isUpdateData = Boolean(isUpdateDataFlag);
  
  console.log('InitialData:', initialData);
  console.log('Editable:', editable);
  console.log('IsUpdateData:', isUpdateData);
  const ACCIDENT_TYPES_URL = `${API_BASE_URL}/irs/getAccidentTypes`;
  const PATIENT_VICTIM_URL = `${API_BASE_URL}/irs/getPatientVictim`;
  const VECHILE_INVOLVED_URL = `${API_BASE_URL}/irs/getVehicleInvolved`;
  // const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/accident_types.json';
  // Add state for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const dispatch = useDispatch();
  const [mapLocation,setMapLocation]=useState(null);
  const [reportKey,setReportKey]=useState(null);
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
  const loadReportData = async () => {
    if (initialData) {
      console.log('=== loadReportData called ===');
      console.log('isApiCallRequired:', isApiCallRequired);
      console.log('reportId:', reportId);
      
      // Check if API call is required
      if (isApiCallRequired && reportId) {
        try {
          console.log('Fetching full report data for reportId:', reportId);
          const response = await getAccidentDataById(reportId);
          console.log('API Response:', response);
          
          const fullReportData = response;
          console.log('Full report data to be set:', fullReportData);
          console.log('Latitude:', fullReportData.latitude, 'Longitude:', fullReportData.longitude);
          
          // Update map location first
          if (fullReportData.latitude && fullReportData.longitude) {
            console.log('Setting map location');
            setMapLocation({ 
              latitude: fullReportData.latitude, 
              longitude: fullReportData.longitude 
            });
          }
          
          // Update captured images
          console.log('Raw image data from API:', fullReportData.imageUris);
          console.log('Image DTOs from API:', fullReportData.imageDTOs);
          
          // Extract image URIs from imageDTOs - convert base64 to data URI
          let imageUris = [];
          if (fullReportData.imageDTOs && Array.isArray(fullReportData.imageDTOs)) {
            // Convert base64 imageData to data URIs for display
            imageUris = fullReportData.imageDTOs
              .filter(img => img.imageData)
              .map(img => `data:image/jpeg;base64,${img.imageData}`);
            console.log('Converted base64 to data URIs, count:', imageUris.length);
          } else if (fullReportData.imageUris && Array.isArray(fullReportData.imageUris)) {
            imageUris = fullReportData.imageUris;
            console.log('Using imageUris directly:', imageUris);
          }
          
          if (imageUris.length > 0) {
            console.log('Setting captured images with', imageUris.length, 'images');
            setCapturedImages(imageUris);
          }
          
          // Update report key
          if (fullReportData.createdAt) {
            console.log('Setting report key:', fullReportData.createdAt);
            setReportKey(fullReportData.createdAt);
          }
          
          // Convert audioData to data URI if present
          let audioUri = fullReportData.audioUri;
          if (fullReportData.audioData && !audioUri) {
            // Convert base64 audio to data URI
            audioUri = `data:audio/mp4;base64,${fullReportData.audioData}`;
            console.log('Converted audio base64 to data URI');
          }
          
          // Merge with initial data and set form data
          console.log('Setting form data with full report data');
          setFormData({ 
            ...fullReportData,
            imageUris: imageUris,
            audioUri: audioUri,
            evidence: fullReportData.evidence || {
              photosTaken: false,
              videosRecorded: false,
              sketchPrepared: false,
            },
            userId: user.id,
            viewOfflineReport: hasRequiredPermissions(permissions, ['view_offline_reports']),
            useCase: 'ReportAccident',
          });
          
          console.log('Form data updated successfully');
        } catch (error) {
          console.error('Error fetching report data:', error);
          Alert.alert('Error', 'Failed to load full report data');
        }
      } else {
        console.log('Using initialData directly (no API call)');
        // Use initialData directly
        setFormData(prev => ({ 
          ...prev, 
          ...initialData,
          evidence: initialData.evidence || {
            photosTaken: false,
            videosRecorded: false,
            sketchPrepared: false
          }
        }));
        
        if (initialData.latitude && initialData.longitude) {
          setMapLocation({ 
            latitude: initialData.latitude, 
            longitude: initialData.longitude 
          });
        }
        setCapturedImages(initialData.imageUris || []);
        setReportKey(initialData.createdAt);
      }
    } else {
      console.log('No initialData provided');
    }
  };
  
  loadReportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialData, isApiCallRequired, reportId]);

 const generatePayload= async()=>{
      const date = new Date().toISOString();
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
        createdAt: reportKey || date,
        updatedAt: date,
      };
      return reportPayload;
  }

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


   // Add a new function to handle updating offline reports
   const updateOfflineReport = async () => {
     try {
       setIsUpdating(true);
       // Ensure latitude, longitude, and images are updated
       const updatedPayload = await generatePayload();
       console.log('Generated report payload:', updatedPayload);
       await saveReportOffline(updatedPayload, true); // Assuming saveReportOffline can handle updates with a flag
       Alert.alert('Success', 'Report updated offline successfully.');
      
     } catch (error) {
       console.error('Error updating offline report:', error);
       Alert.alert('Error', 'Failed to update the offline report.');
     }
      setIsUpdating(false);
   };
  const handleSubmit = async () => {
      try {
      setIsSubmitting(true);
        const reportPayload = await generatePayload();
        console.log('Generated report payload:', reportPayload);
         const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected  && !netInfo.isInternetReachable) {
          if (reportKey) {
            // Update existing offline report
            await saveReportOffline(reportPayload,true);
          } else {
            Alert.alert('No Internet', 'Saving report offline for later submission.');
            await saveReportOffline(reportPayload);
          }
          NavigationService.navigate('Confirmation');
          return;
        } else {
          try {
            console.log('Submitting report:', reportPayload);
            const response = await submitAccidentReport(reportPayload);
            if (response.id) {
              if(reportKey){
                await removeOfflineReport(reportPayload);
              }
              NavigationService.navigate('Confirmation');
            } else {
              Alert.alert('Error', `Submission failed: ${response.error}`);
            }
          } catch (error) {
            console.error('Submission error:', error);
            Alert.alert('Error', 'Failed to submit the report. Saving offline...');
            if (reportKey) {
              await saveReportOffline(reportPayload,true);
            } else {
              await saveReportOffline(reportPayload);
            }
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

  // const fetchNearestLandmark = async (latitude, longitude) => {
  //   try {
  //     const API_KEY = 'AIzaSyADg1wRdGV8WdyGKg1V3IXgv3Ax0kRAIGI'; // Replace with your actual Google API key
  //     const response = await axios.get(
  //       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
  //     );

  //     if (response.data && response.data.results && response.data.results.length > 0) {
  //       const address = response.data.results[0].formatted_address;
  //       inputHandling('nearestLandMark', address); // Update the nearestLandMark field
  //     } else {
  //       Alert.alert('Error', 'Unable to fetch the nearest landmark.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching nearest landmark:', error);
  //     Alert.alert('Error', 'Failed to fetch the nearest landmark.');
  //   }
  // };

  // useEffect(() => {
  //   if (mapLocation?.latitude && mapLocation?.longitude) {
  //     fetchNearestLandmark(mapLocation.latitude, mapLocation.longitude);
  //   }
  // }, [mapLocation]); // Trigger when mapLocation changes
  
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
        editable={editable}
        setLocation={(region) => {
          setMapLocation(region);
          inputHandling('latitude', region.latitude);
          inputHandling('longitude', region.longitude);
          // fetchNearestLandmark(region.latitude, region.longitude); // Fetch landmark on location change
        }}
      />

      {/* <View style={{ marginVertical: 10 }}>
        <CustomButton
          title="Confirm Location"
          onPress={() => {
            Alert.alert(
              'Location Confirmed',
              `Latitude: ${mapLocation?.latitude}, Longitude: ${mapLocation?.longitude}`
            );
          }}
          color="blue"
          textColor="white"
        />
      </View> */}

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
            inputHandling('gender', value.id)}}
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
              initialUris={formData.imageUris}
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
        
        {isUpdateData && (
          <CustomButton
            onPress={() => updateOfflineReport()}
            title="Update Report"
            disabled={!isUpdateData || isUpdating}
            loading={isUpdating}
          />
        )}
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
