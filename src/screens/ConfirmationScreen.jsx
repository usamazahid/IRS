// src/screens/ConfirmationScreen.jsx
import React,{} from 'react';
import { View, Text, TouchableOpacity,StyleSheet ,Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import CustomButton from './components/CustomButton';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';

import hope from '../assets/img/hope.png';
const ConfirmationScreen = ( ) => {
  return (
    <SafeAreaView className="flex-1 bg-slate-200 bg-white">
    <View className="flex-row justify-start p-2">
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
        <TopBar/>
        
      <Image source={hope} style={styles.logo}/>
        <View className="flex-1 justify-center p-6 bg-white">
       <Text className="text-2xl font-bold mb-4 text-center text-black">
    Your report has been submitted successfully!
  </Text>

  <Text className="text-center mb-4 text-gray-600">
    If you need further assistance, please ensure to seek urgent help.
  </Text>
      <CustomButton
        onPress={() => NavigationService.navigate('CallAmbulance')}
        title="Call Ambulance"
        color="green"
        textColor="white"
      />

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


const styles = StyleSheet.create({
  logo: {
    width: '100%',
    height: 200,
    resizeMode: 'contain'
  },


})

export default ConfirmationScreen;
