// src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import logo from '../assets/img/logo.png';
import CustomButton from './components/CustomButton';
import NavigationService, { navigationRef } from '../context/NavigationService';


const LoginScreen = () => {
  const { login } = useAuth();
  const handleLogin = () => {
    login();
    NavigationService.navigate('Home');
  };
  return (
    <View className="flex-1 bg-[#F0F0F0]">
      <SafeAreaView className="flex" >
        <View className="flex-row justify-center">
          <Image source={logo} style={styles.logo}></Image>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 bg-white px-8 pt-8 rounded-t-3xl space-y-10">

        <Text className="flex text-center text-gray-800 text-2xl">
          LOGIN
        </Text>

        <View className="relative w-full max-w-sm">

          <Text className="absolute top-[-10px] left-3 bg-white text-sm font-semibold text-gray-400 z-10">
            MOBILE NUMBER
          </Text>

          <TextInput className="p-4  text-gray-700  border-gray-800 border rounded-2xl"
            keyboardType='phone-pad'
          />
          <Text className="text-gray-400 left-5">e.g. 03001234567</Text>
        </View>

        <CustomButton onPress={handleLogin} title='LOG IN'/>

        <Text className='text-black text-center text-xl' onPress={() => NavigationService.navigate('Signup')} >
          DO NOT HAVE AN ACCOUNT ? 
          <Text className='font-bold'> REGISTER HERE</Text></Text>
      </ScrollView>



    </View>


  );
};

const styles = StyleSheet.create({
  logo: {
    width: '100%',
    height: 200,
    resizeMode: 'contain'
  },


})
export default LoginScreen;
