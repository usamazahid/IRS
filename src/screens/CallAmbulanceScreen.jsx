import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import GenericDropdown from './components/DropDownMenu';
import CustomButton from './components/CustomButton';
import { ScrollView } from 'react-native-gesture-handler';

const CallAmbulanceScreen = () => {
  const DATA_URL = 'https://raw.githubusercontent.com/usamazahid/IRS/main/ambulance_list.json'; // Replace with your JSON URL

  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const handleCall = () => {
    if (selectedItem && selectedItem.phone) {
      Linking.openURL(`tel:${selectedItem.phone}`);
    }
  };

  return (
    <View className="flex-1 bg-slate-200">
      <SafeAreaView className="flex">
        <View className="flex-row justify-start">
          <TouchableOpacity className="p-2 ml-2" onPress={() => NavigationService.goBack()}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView className='px-8'>
          <Text className="flex text-center text-gray-800 text-2xl">
            SELECT SERVICE
          </Text>
          <GenericDropdown
            dataUrl={DATA_URL}
            valueField="value"
            labelField="label"
            imageField="image"
            placeholder="Select Service"
            onItemSelect={handleItemSelect} // Pass the callback function
          />
          {selectedItem && (
            <View className="mt-4 items-center w-ful">
              {selectedItem.image && (
                <Image source={{ uri: selectedItem.image.uri }} className="w-16 h-16 rounded-full" />
              )}
              <Text className="text-xl font-bold mt-2 text-black">{selectedItem.label}</Text>
              <Text className="text-base mt-1 text-black text-center">{selectedItem.description}</Text>
              <Text className="text-base text-blue-600 mt-1">{selectedItem.phone}</Text>
              <CustomButton title="CALL AMBULANCE" onPress={handleCall} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default CallAmbulanceScreen;
