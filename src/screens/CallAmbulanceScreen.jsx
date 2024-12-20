import React, { useState ,useEffect} from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import GenericDropdown from './components/DropDownMenu';
import CustomButton from './components/CustomButton';
import { ScrollView } from 'react-native-gesture-handler';
import { API_BASE_URL } from '@env';
import TopBar from './components/TopBarComponent';
import { useSelector, useDispatch } from 'react-redux';
import { origanizationData } from '../redux/slices/dropdownSlice'; // Import the action

import LoadingSpinner from './components/LoadingSpinner';
const CallAmbulanceScreen = () => {
  // const AMBULANCE_LIST_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/ambulance_list.json'; // Replace with your JSON URL
  const AMBULANCE_LIST_URL = `${API_BASE_URL}/irs/getOrganizations`;
  const [selectedItem, setSelectedItem] = useState(null);
  const dispatch = useDispatch();

  // Access dropdown data, error, and loading state from Redux
  const {frequentlyUsedServices,ambulanceServiceData,loading} = useSelector((state) => state.dropdown);

  useEffect(() => {
    // If no data in Redux, fetch from the API
    if (!ambulanceServiceData || !frequentlyUsedServices) { 
        dispatch(origanizationData('getOrganizations'))
                  .unwrap().then(() => {});
    }
  }, [  ambulanceServiceData,frequentlyUsedServices,dispatch]);

  if (loading) {
    // Show a loading indicator while authentication is in progress
    return <LoadingSpinner/>;
  }



  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <View className="flex-1 bg-slate-200">
      <SafeAreaView className="flex">
        <View className="flex-row justify-start">
          <TouchableOpacity className="p-2 ml-2" onPress={() => NavigationService.navigate('Home')}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
        </SafeAreaView>
        <TopBar />
         <ScrollView className="px-8 ">
          <Text className="flex text-center text-gray-800 text-2xl">SELECT SERVICE</Text>

           {/* Frequently Used Services Section */}
          {frequentlyUsedServices && (
            <View className="flex-row flex-wrap justify-between">
              {frequentlyUsedServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  className="bg-white w-[48%] h-40 p-4 mb-4 rounded-lg shadow-md"
                  onPress={() => handleCall(service.phone)}
                >
                  <Image
                    source={{
                      uri: service.image
                        ? service.image.uri
                        : 'https://via.placeholder.com/150',
                    }}
                    className="w-24 h-24 rounded-full self-center"
                    resizeMode="cover"
                  />
                  <Text
                    className="text-center text-sm font-bold text-black mt-2"
                    numberOfLines={2}
                  >
                    {service.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          
          {/* Dropdown for other services */}
          <GenericDropdown
            dataUrl={AMBULANCE_LIST_URL}
            valueField="id"
            labelField="label"
            imageField="image"
            placeholder="Select Service"
            onItemSelect={handleItemSelect}
            dropDownData={ambulanceServiceData}
          />
          {selectedItem && (
            <View className="mt-4 items-center w-full">
              {selectedItem.image && (
                <Image
                  source={{ uri: selectedItem.image.uri }}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <Text className="text-xl font-bold mt-2 text-black">{selectedItem.label}</Text>
              <Text className="text-base mt-1 text-black text-center">
                {selectedItem.description}
              </Text>
              <Text className="text-base text-blue-600 mt-1">{selectedItem.phone}</Text>
              <CustomButton title="CALL SERVICE" onPress={() => handleCall(selectedItem.phone)} />
            </View>
          )}

        </ScrollView>
    </View>
  );
};

export default CallAmbulanceScreen;
