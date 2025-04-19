// src/screens/ConfirmationScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import CustomButton from './components/CustomButton';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';
const OfflineReportsScreen = ( ) => {
  return (
    <SafeAreaView className="flex-1 bg-slate-200 bg-white">
    <View className="flex-row justify-start p-2">
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
        <TopBar/>
    
        <View className="flex-1 justify-center p-6 bg-white">
        <Text className="text-center text-gray-800 text-2xl mb-4">
          Offline Reports
        </Text>

      <CustomButton
        onPress={() => NavigationService.navigate('Home')}
        title="Back"
        color="transparent"
        textColor="blue"
      />
    </View>
    </SafeAreaView>
  );
};

export default OfflineReportsScreen;
