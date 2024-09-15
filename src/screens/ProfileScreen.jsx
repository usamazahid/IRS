import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import GenericDropdown from './components/DropDownMenu';
import CustomButton from './components/CustomButton';
import { ScrollView } from 'react-native-gesture-handler';

import TopBar from './components/TopBarComponent';
const ProfileScreen = () => {
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
         <TopBar/>
        <ScrollView className='px-8'>
          <Text className="flex text-center text-gray-800 text-2xl">
            MANAGE PROFILE
          </Text>
        
            <View className="mt-4 items-center w-full">
             
              <Text><Text className="font-bold text-black ">Mobile Number: </Text ><Text className=" text-black "> 03162084839</Text></Text>
              <Text><Text className="font-bold text-black">Email Address: </Text> <Text className=" text-black ">ABC@GMAIL.COM</Text></Text>
              <CustomButton title="UPDATE"/>
              <Text className=" text-blue-600 mt-10 text-center">Verify Yourself within 30 days of Registration.</Text>
              <CustomButton title="verify" variant='outlined' />
            </View>
        
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ProfileScreen;
