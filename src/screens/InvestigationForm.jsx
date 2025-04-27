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
import { compressImage,fillImageDto } from '../utils/ImageUtils';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllLovs } from '../redux/slices/dropdownSlice'; // Import the action
import GenericDropDownMenu from './components/GenericDropDownMenu';
import EvidenceToggle from './components/EvidenceToggle';
import DynamicFormSection from './components/DynamicFormSection';
import FollowUpActions from './components/FollowUpActions';
import NetInfo from '@react-native-community/netinfo';
import { saveReportOffline,removeOfflineReport } from '../services/OfflineService';
import MultipleCameraComponent from './components/MulitpleCameraComponent';
import { hasRequiredPermissions } from '../utils/permissionUtils';
const InvestigationForm = ({ route }) => {
  const { user,permissions } = useSelector(state => state.auth);
  const dispatch = useDispatch();

 // navigation params for view-mode
  const { initialData = null, editable: editableFlag = true,isUpdateData: isUpdateDataFlag = false } = route.params || {};
  const editable = Boolean(editableFlag);
  const isUpdateData = Boolean(isUpdateDataFlag);

  // LOV URLs
  const ACCIDENT_TYPES_URL = `${API_BASE_URL}/irs/getAccidentTypes`;
  const PATIENT_VICTIM_URL = `${API_BASE_URL}/irs/getPatientVictim`;
  const VECHILE_INVOLVED_URL = `${API_BASE_URL}/irs/getVehicleInvolved`;
  // const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/accident_types.json';

  
  // Access dropdown data, error, and loading state from Redux
  // dropdown state from Redux
  const dropdown = useSelector(state => state.dropdown);
  const {
    accidentTypes, vehicleInvolved, patientVictim,
    apparentCauses, weatherConditions, visibilityLevels,
    roadSurfaceConditions, roadTypes, roadSignages,
    faultAssessments, caseReferredTo, genderTypes,
    vehicleConditions,fitnessCertificateStatuses,casualtiesStatuses,
    injurySeverities,roadTaxStatuses,insuranceStatuses
  } = dropdown;

    const [formData, setFormData] = useState({
    //for offline reports
    accidentTypeLabel: '',
    accidentTypeDescription: '',
    viewOfflineReport: hasRequiredPermissions(permissions, ['view_offline_reports']),
    useCase:'InvestigationForm',
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
      setReportKey(initialData.createdAt);
    }
  }, [initialData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [mapLocation, setMapLocation] = useState(null);
  const [reportKey,setReportKey]=useState(null);
  const genderData = [
    {id:1,  label: 'Male', value: 'male' },
    {id:2,  label: 'Female', value: 'female' },
    {id:3,  label: 'Other', value: 'other' }
  ];
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
    // Add this handler in your parent component
  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  // Callback to receive images from MultipleCameraComponent
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


   // Main submit handler
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

  // fetch LOVs
  useEffect(() => {
    if (!accidentTypes.length || !weatherConditions.length) {
      dispatch(fetchAllLovs()).unwrap().catch(console.error);
    }
  }, [accidentTypes, weatherConditions, dispatch]);
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
        editable={editable}
        setLocation={(region) => {
          setMapLocation(region);
          inputHandling('latitude', region.latitude);
          inputHandling('longitude', region.longitude);
        }}
      />



        <TextBox label="Nearest LandMark" editable={editable} onChangeText={(text) => inputHandling('nearestLandMark', text)} value={formData.nearestLandMark}/>


  
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
       
         {/* Environmental Factors */}
          <Text className="text-xl font-bold my-2 text-gray-800">Environmental Conditions</Text> 
          
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
            <GenericDropDownMenu className="bg-slate-200"
              data={weatherConditions}
              valueField="id"
              labelField="condition"
              imageField="image"
              placeholder="Select Weather"
              value={formData.weatherCondition}
              disabled={!editable}
              onItemSelect={(item) => setFormData(prev => ({ ...prev, weatherCondition: item.id }))}
            />

            <GenericDropDownMenu className="bg-slate-200"
              data={visibilityLevels}
              placeholder="Select Visibility"
              valueField="id"
              labelField="level"
              imageField="image"
              value={formData.visibility}
              disabled={!editable}
              onItemSelect={(item) => setFormData(prev => ({ ...prev, visibility: item.id }))}
            />
            <GenericDropDownMenu className="bg-slate-200"
              data={roadSurfaceConditions}
              valueField="id"
              labelField="condition"
              imageField="image"
              placeholder="Select Road Surface Conditions"
              value={formData.roadSurfaceCondition}
              disabled={!editable}
              onItemSelect={(item) => setFormData(prev => ({ ...prev, roadSurfaceCondition: item.id }))}
            />
            <GenericDropDownMenu className="bg-slate-200"
              data={roadTypes}
              valueField="id"
              labelField="type"
              imageField="image"
              placeholder="Select Road Type"
              value={formData.roadType}
              disabled={!editable}
              onItemSelect={(item) => setFormData(prev => ({ ...prev, roadType: item.id }))}
            />
             <GenericDropDownMenu className="bg-slate-200"
              data={roadSignages}
              valueField="id"
              labelField="status"
              imageField="image"
              placeholder="Select Road Markings / Signage"
              value={formData.roadMarkings}
              disabled={!editable}
              onItemSelect={(item) => setFormData(prev => ({ ...prev, roadMarkings: item.id }))}
            />
        {/* // VEHICLE FITNESS & DOCUMENT VERIFICATION */}
           <Text className="text-xl font-bold my-2 text-gray-800">VEHICLE FITNESS & DOCUMENT VERIFICATION</Text>
        <DynamicFormSection
          title="Add Vehicle Fitness Details"
          items={formData.vehicleFitnessDetails}
          disabled={!editable}
          editable={editable}
          fields={[
            {
              label: 'Vehicle Number',
              key: 'vehicleNo',
              type: 'text'
            },
            // {
            //   label: 'Select Fitness Certificate Valid',
            //   key: 'fitnessCertificateValid',
            //   type: 'dropdown',
            //   data: [
            //     { id: 1, label: 'Yes', value: true },
            //     { id: 2, label: 'No', value: false }
            //   ],
            //   labelField: 'label',
            //   valueField: 'value'
            // },
            {
              label: 'Is Fitness Certificate Valid?',
              key: 'fitnessCertificateValid',
              type: 'toggle',
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
              data:roadTaxStatuses,
              labelField: 'label',
              valueField: 'id'
            },
            {
              label: 'Select Insurance Status',
              key: 'insuranceStatus',
              type: 'dropdown',
              data: insuranceStatuses,
              labelField: 'label'
              ,valueField: 'id'
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
            disabled={!editable}
            editable={editable}
            fields={[
              { label: 'Registration No', key: 'registrationNo' },
              { label: 'Select Vehicle Type', key: 'type', type: 'dropdown', data: vehicleInvolved,labelField:'label',valueField: 'id' },
              { label: 'Select Condition', key: 'condition', type: 'dropdown', 
                data: vehicleConditions,labelField:'label',valueField: 'id' },
                {
                  label: 'Select Vehicle Fitness Certificate Status',
                  key: 'fitnessCertificateStatus',
                  type: 'dropdown',
                  data: fitnessCertificateStatuses,
                  labelField: 'label'
                  ,valueField: 'id'
                }
            ]}
            onAdd={() => addArrayEntry('vehicles', { registrationNo: '', type: '', condition: '' })}
            onUpdate={(index, key, value) => handleArrayUpdate('vehicles', index, key, value)}
            onRemove={(index) => handleArrayRemove('vehicles', index)}

          />

          {/* Driver Details */}
          
           <Text className="text-xl font-bold my-2 text-gray-800">Drivers Details</Text>
          <DynamicFormSection
            title="Add Drivers Involved"
            items={formData.drivers}
            disabled={!editable}
            editable={editable}
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
            disabled={!editable}
            editable={editable}
            fields={[
              { label: 'Select Type', key: 'type', type: 'dropdown', data: casualtiesStatuses,labelField:'label',valueField: 'id' },
              { label: 'Name', key: 'name' },
              { label: 'Hospital', key: 'hospitalName' },
              { label: 'Select Injury Severity', key: 'injurySeverity', injurySeverities,labelField:'label',valueField: 'label' }
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
            disabled={!editable}
            editable={editable}
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
              value={formData.preliminaryFault}
              disabled={!editable}
              onItemSelect={(item) => setFormData(prev => ({ ...prev, preliminaryFault: item.id }))}
            /> 

              <TextBox label="Observations/Notes"
              onChangeText={(text) => inputHandling('officerNotes', text)}
              value={formData.officerNotes}
              editable={editable}
              />

          <Text className="text-xl font-bold my-2 text-gray-800">FOLLOW-UP ACTIONS</Text>

          <FollowUpActions
            onChange={data => setFormData(prev => ({ ...prev, followUp: data }))}
            dropDownData={caseReferredTo}
            disabled={!editable}
            editable={editable}
            initialValues={formData.followUp}
          />

          {/* <DynamicFormSection
            title="Add Follow Up Actions"
            items={formData.followUp}
            disabled={!editable}
            editable={editable}
            maxItems={1}
            fields={[
              {
                label: 'Is firRegistered?',
                key: 'firRegistered',
                type: 'toggle',
                valueField: 'value'
              },
              { label: 'firNumber', key: 'firNumber' },
              {
                label: 'Is challanIssued?',
                key: 'challanIssued',
                type: 'toggle',
                valueField: 'value'
              },
              { label: 'challanNumber', key: 'challanNumber' },
              { label: 'Select CaseReferredTo', key: 'caseReferredTo', type: 'dropdown', 
                data: caseReferredTo,labelField:'label',valueField: 'id' },
            ]}
            onAdd={() => addArrayEntry('followUp', { firRegistered: false, firNumber: '', challanIssued: false,challanNumber:'', caseReferredTo:''})}
            onUpdate={(index, key, value) => handleArrayUpdate('followUp', index, key, value)}
            onRemove={(index) => handleArrayRemove('followUp', index)}

          /> */}

       {/* Evidence Section */}
          <Text className="text-xl font-bold my-2 text-gray-800">Evidence Collection</Text>
          <View className="flex-row justify-between mb-4">
            <EvidenceToggle
              label="Photos"
              value={formData.evidence.photosTaken}
              disabled={!editable}
              onValueChange={(v) => setFormData(prev => ({
                ...prev,
                evidence: { ...prev.evidence, photosTaken: v }
              }))}
            />
            <EvidenceToggle
              label="Sketch"
              value={formData.evidence.sketchPrepared}
              disabled={!editable}
              onValueChange={(v) => setFormData(prev => ({
                ...prev,
                evidence: { ...prev.evidence, sketchPrepared: v }
              }))}
            />
            <EvidenceToggle
              label="Video"
              value={formData.evidence.videosRecorded}
              disabled={!editable}
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
        editable={editable}
        initialUris={formData.imageUris}
      />
        {/* Recorder with a 1-minute time limit */}
      <AudioRecorder expiryTime={60000} onRecordingComplete={(path)=>inputHandling('audioUri', path)} disabled={!editable} />

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
export default InvestigationForm;
