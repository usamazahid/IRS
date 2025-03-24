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
import SimpleDropDownMenu from './components/SimpleDropDownMenu';
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
import GenericDropDownMenu from './components/GenericDropDownMenu';
import EvidenceToggle from './components/EvidenceToggle';
import DynamicFormSection from './components/DynamicFormSection';
import FollowUpActions from './components/FollowUpActions';
import NetInfo from '@react-native-community/netinfo';
import { saveReportOffline } from '../services/OfflineService';
import MultipleCameraComponent from './components/MulitpleCameraComponent';
const InvestigationForm = () => {
  const { user, role, permissions } = useSelector((state) => state.auth);
  const ACCIDENT_TYPES_URL = `${API_BASE_URL}/irs/getAccidentTypes`;
  const PATIENT_VICTIM_URL = `${API_BASE_URL}/irs/getPatientVictim`;
  const VECHILE_INVOLVED_URL = `${API_BASE_URL}/irs/getVehicleInvolved`;
  // const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/accident_types.json';

  const dispatch = useDispatch();
  const [mapLocation,setMapLocation]=useState(null);
  // Access dropdown data, error, and loading state from Redux
  const {
    accidentTypes,
    vehicleInvolved,
    patientVictim,
    apparentCauses,
    weatherConditions,
    visibilityLevels,
    roadSurfaceConditions,
    roadTypes,
    roadSignages,
    faultAssessments,
    caseReferredTo
  } = useSelector((state) => state.dropdown);

  // Add state for submission status
const [isSubmitting, setIsSubmitting] = useState(false);
const [capturedImages, setCapturedImages] = useState([]);

  // Callback to receive images from CameraComponent
  const handleImageCapture = (uris) => {
    setCapturedImages(uris);
  };
  useEffect(() => {
    // If no data in Redux, fetch from the API
    if (accidentTypes.length === 0 || weatherConditions.length === 0) { 
      console.log('data caling')
        dispatch(fetchAllLovs())
                  .unwrap().then(() => {});
    }
  }, [  accidentTypes,weatherConditions,dispatch]);

      // Handler for dynamic arrays
    const handleArrayUpdate = (field, index, key, value) => {
      const updatedArray = [...formData[field]];
      updatedArray[index][key] = value;
      setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    // Add new entry to array
    const addArrayEntry = (field, template) => {
      setFormData(prev => ({ 
        ...prev, 
        [field]: [...prev[field], template] 
      }));
    };

    const [formData, setFormData] = useState({
    // Basic Info
    gender: 'male',
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
    imageDTOs:[]
  });

  const genderData = [
    {id:1,  label: 'Male', value: 'male' },
    {id:2,  label: 'Female', value: 'female' },
    {id:3,  label: 'Other', value: 'other' }
  ];

    // Add this handler in your parent component
  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const fillImageDto = async (capturedData) => {
    let imageDTOs = [];
    console.log(capturedData);
    if (capturedData.length > 0) {
      const results = await Promise.allSettled(
        capturedData.map(uri => compressImage(uri))
      );
      imageDTOs = results.map(result => {
        if (result.status === 'fulfilled') {
          return {
            imageDate: new Date().toISOString(), // Add current date-time
            imageData: result.value             // Compressed image data from compressImage
          };
        } else {
          // Optionally, return an error field for failed compressions
          return {
            imageDate: new Date().toISOString(),
            imageData: null,
            error: result.reason
          };
        }
      });
    }
    return imageDTOs;
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
          ACCIDENT INVESTIGATION
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

          <SimpleDropDownMenu className="bg-slate-200"
            dataUrl={PATIENT_VICTIM_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Patient Victim" // Pass the callback function
            data={patientVictim}
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
            onItemSelect={(value) => inputHandling('vehicleInvolvedId', value.id)}
          />


        <GenericDropDownMenu className="bg-slate-200"
          data={genderData}
          valueField="id"
          labelField="label"
          placeholder="Select Gender" // Pass the callback function
          onItemSelect={(value) => {
            console.log(value);
            inputHandling('gender', value.value)}}
        />
       
         {/* Environmental Factors */}
          <Text className="text-xl font-bold my-2 text-gray-800">Environmental Conditions</Text> 
          
          <GenericDropDownMenu className="bg-slate-200"
              dataUrl={ACCIDENT_TYPES_URL}
              valueField="id"
              labelField="label"
              imageField="image"
              placeholder="Select Accident Type" // Pass the callback function
              data={accidentTypes}
              onItemSelect={(value) => inputHandling('accidentTypeId', value.id)}
            />

             <GenericDropDownMenu className="bg-slate-200"
              data={apparentCauses}
              valueField="id"
              labelField="cause"
              imageField="image"
              placeholder="Select Apparent Cause"
              onItemSelect={(item) => setFormData(prev => ({ ...prev, cause: item.cause }))}
            />
            
            <GenericDropDownMenu className="bg-slate-200"
              data={weatherConditions}
              valueField="id"
              labelField="condition"
              imageField="image"
              placeholder="Select Weather"
              onItemSelect={(item) => setFormData(prev => ({ ...prev, weatherCondition: item.condition }))}
            />

            <GenericDropDownMenu className="bg-slate-200"
              data={visibilityLevels}
              placeholder="Select Visibility"
              valueField="id"
              labelField="level"
              imageField="image"
              onItemSelect={(item) => setFormData(prev => ({ ...prev, visibility: item.level }))}
            />
            <GenericDropDownMenu className="bg-slate-200"
              data={roadSurfaceConditions}
              valueField="id"
              labelField="condition"
              imageField="image"
              placeholder="Select Road Surface Conditions"
              onItemSelect={(item) => setFormData(prev => ({ ...prev, roadSurfaceCondition: item.condition }))}
            />
            <GenericDropDownMenu className="bg-slate-200"
              data={roadTypes}
              valueField="id"
              labelField="type"
              imageField="image"
              placeholder="Select Road Type"
              onItemSelect={(item) => setFormData(prev => ({ ...prev, roadType: item.type }))}
            />
             <GenericDropDownMenu className="bg-slate-200"
              data={roadSignages}
              valueField="id"
              labelField="status"
              imageField="image"
              placeholder="Select Road Markings / Signage"
              onItemSelect={(item) => setFormData(prev => ({ ...prev, roadMarkings: item.status }))}
            />
        {/* // VEHICLE FITNESS & DOCUMENT VERIFICATION */}
           <Text className="text-xl font-bold my-2 text-gray-800">VEHICLE FITNESS & DOCUMENT VERIFICATION</Text>
        <DynamicFormSection
          title="Add Vehicle Fitness Details"
          items={formData.vehicleFitnessDetails}
          fields={[
            {
              label: 'Vehicle Number',
              key: 'vehicleNo',
              type: 'text'
            },
            {
              label: 'Select Fitness Certificate Valid',
              key: 'fitnessCertificateValid',
              type: 'dropdown',
              data: [
                { id: 1, label: 'Yes', value: true },
                { id: 2, label: 'No', value: false }
              ],
              labelField: 'label',
              valueField: 'value'
            },
            {
              label: 'Expiry Date',
              key: 'expiryDate',
              type: 'date'
            },
            {
              label: 'Select Road Tax Status',
              key: 'roadTaxStatus',
              type: 'dropdown',
              data: [
                { id: 1, label: 'Paid' },
                { id: 2, label: 'Unpaid' },
                { id: 3, label: 'Pending' }
              ],
              labelField: 'label',
              valueField: 'label'
            },
            {
              label: 'Select Insurance Status',
              key: 'insuranceStatus',
              type: 'dropdown',
              data: [
                { id: 1, label: 'Active' },
                { id: 2, label: 'Expired' },
                { id: 3, label: 'Pending Renewal' }
              ],
              labelField: 'label'
              ,valueField: 'label'
            }
          ]}
          onAdd={() => addArrayEntry('vehicleFitnessDetails', {
            vehicleNo: '',
            fitnessCertificateValid: true,
            expiryDate: '',
            roadTaxStatus: '',
            insuranceStatus: ''
          })}
          onUpdate={(index, key, value) => handleArrayUpdate('vehicleFitnessDetails', index, key, value)}
          onRemove={(index) => handleArrayRemove('vehicleFitnessDetails', index)}
        />

        {/* Vehicles Involved */}

           <Text className="text-xl font-bold my-2 text-gray-800">VEHICLE INVOLVED</Text>
          <DynamicFormSection
            title="Add Vehicles Involved"
            items={formData.vehicles}
            fields={[
              { label: 'Registration No', key: 'registrationNo' },
              { label: 'Select Vehicle Type', key: 'type', type: 'dropdown', data: vehicleInvolved,labelField:'label',valueField: 'label' },
              { label: 'Select Condition', key: 'condition', type: 'dropdown', 
                data: [{id:1,label:'Minor'}, {id:2,label:'Major'}, {id:3,label:'Total Loss'}],labelField:'label',valueField: 'label' },
                {
                  label: 'Select Vehicle Fitness Certificate Status',
                  key: 'fitnessCertificateStatus',
                  type: 'dropdown',
                  data: [
                    { id: 1, label: 'Valid' },
                    { id: 2, label: 'Expired' },
                    { id: 3, label: 'Not Available' }
                  ],
                  labelField: 'label'
                  ,valueField: 'label'
                }
            ]}
            onAdd={() => addArrayEntry('vehicles', { registration: '', type: '', condition: '' })}
            onUpdate={(index, key, value) => handleArrayUpdate('vehicles', index, key, value)}
            onRemove={(index) => handleArrayRemove('vehicles', index)}

          />

          {/* Driver Details */}
          
           <Text className="text-xl font-bold my-2 text-gray-800">Drivers Details</Text>
          <DynamicFormSection
            title="Add Drivers Involved"
            items={formData.drivers}
            fields={[
              { label: 'Name', key: 'name' },
              { label: 'CNIC', key: 'cnicNo' },
              { label: 'License No', key: 'licenseNo' },
              { label: 'Contact', key: 'contactNo' }
            ]}
            onAdd={() => addArrayEntry('drivers', { name: '', cnicNo: '', licenseNo: '', contactNo: '' })}
            onUpdate={(index, key, value) => handleArrayUpdate('drivers', index, key, value)}
            onRemove={(index) => handleArrayRemove('drivers', index)}
          />

          {/* Casualties Section */}
          
           <Text className="text-xl font-bold my-2 text-gray-800">Casualties/Passengers/Injured</Text>
          <DynamicFormSection
            title="Add Casualties/Passengers"
            items={formData.casualties}
            fields={[
              { label: 'Select Type', key: 'type', type: 'dropdown', data: [{id:1,label:'Casualities'}, {id:2,label:'Passengers'}, {id:3,label:'Injured'}],labelField:'label',valueField: 'label' },
              { label: 'Name', key: 'name' },
              { label: 'Hospital', key: 'hospitalName' },
              { label: 'Select Injury Severity', key: 'injurySeverity', 
                type: 'dropdown', data: [{id:1,label:'Fatal'}, {id:2,label:'Major'}, {id:3,label:'Minor'}],labelField:'label',valueField: 'label' }
            ]}
            onAdd={() => addArrayEntry('casualties', { type: '', name: '', hospitalName: '', injurySeverity: '' })}
            onUpdate={(index, key, value) => handleArrayUpdate('casualties', index, key, value)}
            onRemove={(index) => handleArrayRemove('casualties', index)}
          />
  
          {/* witnesses Section */}
          <Text className="text-xl font-bold my-2 text-gray-800">Witness Details (if Available)</Text>
          <DynamicFormSection
            title="Add Witness"
            items={formData.witnesses}
            fields={[
              { label: 'Name', key: 'name' },
              { label: 'Contact Number', key: 'contactNo' },
              { label: 'Address', key: 'address' },
              ]}
            onAdd={() => addArrayEntry('witnesses', { name: '', contactNo: '', address: '' })}
            onUpdate={(index, key, value) => handleArrayUpdate('witnesses', index, key, value)}
            onRemove={(index) => handleArrayRemove('witnesses', index)}
          />

       
        {/*  INITIAL OBSERVATIONS BY INVESTIGATING OFFICER */}
        
          <Text className="text-xl font-bold my-2 text-gray-800">INITIAL OBSERVATIONS BY INVESTIGATING OFFICER</Text>
          <GenericDropDownMenu className="bg-slate-200"
              data={faultAssessments}
              valueField="id"
              labelField="fault"
              imageField="image"
              placeholder="Select Preliminary Fault Assessment"
              onItemSelect={(item) => setFormData(prev => ({ ...prev, preliminaryFault: item.fault }))}
            /> 

              <TextBox label="Observations/Notes"
              onChangeText={(text) => inputHandling('officerNotes', text)}
              />

          <Text className="text-xl font-bold my-2 text-gray-800">FOLLOW-UP ACTIONS</Text>
          <FollowUpActions onChange={(data) => {
        setFormData(prev => ({
          ...prev,
          followUp: data
        }));
      }} dropDownData={caseReferredTo}/>

       {/* Evidence Section */}
          <Text className="text-xl font-bold my-2 text-gray-800">Evidence Collection</Text>
          <View className="flex-row justify-between mb-4">
            <EvidenceToggle
              label="Photos"
              value={formData.evidence.photosTaken}
              onValueChange={(v) => setFormData(prev => ({
                ...prev,
                evidence: { ...prev.evidence, photosTaken: v }
              }))}
            />
            <EvidenceToggle
              label="Sketch"
              value={formData.evidence.sketchPrepared}
              onValueChange={(v) => setFormData(prev => ({
                ...prev,
                evidence: { ...prev.evidence, sketchPrepared: v }
              }))}
            />
            <EvidenceToggle
              label="Video"
              value={formData.evidence.videosRecorded}
              onValueChange={(v) => setFormData(prev => ({
                ...prev,
                evidence: { ...prev.evidence, videosRecorded: v }
              }))}
            />
          </View>

     {/* <CameraComponent onCapture={(uri) => inputHandling('imageUri', uri)} editable={true}  /> */}
      {/* <CameraComponent initialUri={savedUri} editable={false} /> */}
      <MultipleCameraComponent 
        onCapture={handleImageCapture} 
        editable={true} 
        initialUris={[]} 
      />
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
export default InvestigationForm;
