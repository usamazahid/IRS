// src/screens/LoginScreen.tsx
import React from 'react';
import { useState,useEffect  } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import logo from '../assets/img/logo_new.png';
import CustomButton from './components/CustomButton';
import NavigationService, { navigationRef } from '../context/NavigationService';
import { useDispatch,useSelector } from 'react-redux';
import {loginAsync,resetError } from '../redux/slices/authSlice'
import LoadingSpinner from './components/LoadingSpinner';
import {useSnackBar} from '../context/SnackBarContext';
import store from '../redux/store'; 

import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const dispatch = useDispatch();
   const navigation = useNavigation();
  const  {   user,isAuthenticated, permissions,loading ,error } = useSelector((state) => state.auth);
 const { showSnackBar } = useSnackBar();

 
 useEffect(() => {
    // Redirect to Home if already logged in
    // console.log(isAuthenticated," isAuthenticated");
    if (isAuthenticated) {
      navigation.navigate('Home');
    }
  }, [isAuthenticated,navigation]);
  
  // useEffect(() => {
  // console.log('Persisted state:', store.getState());
  // }, []);
  const handleLogin = () => {
  dispatch(loginAsync(mobile))
            .unwrap().then(() => {
              showSnackBar('Successful Login');
    NavigationService.navigate('Home');
  }).catch((err) => {
                showSnackBar(err || 'Login failed. Please try again.','error');
            });
};
  

  if (loading) {
    // Show a loading indicator while authentication is in progress
    return <LoadingSpinner/>;
  }

  // const { login } = useAuth();
  // const handleLogin = () => {
  //   login();
  //   NavigationService.navigate('Home');
  // };
  return (
    <View className="flex-1 bg-[#F0F0F0]">
      <SafeAreaView className="flex bg-white" >
        <View className="flex-row justify-center">
          <Image source={logo} style={styles.logo}/>
        </View>
      </SafeAreaView>
      <Text className="text-xl font-bold text-[#4A90E2] px-4 py-2 rounded-md text-center">
    ACCIDENT REPORTING PORTAL
  </Text>
      <ScrollView className="flex-1 bg-white px-8 pt-8 rounded-t-3xl space-y-10">
      
        <Text className="flex text-center text-gray-800 text-2xl">
          LOGIN
        </Text>

        <View className="relative w-full max-w-sm ">

          <Text className="absolute top-[-10px] left-3 bg-white text-sm font-semibold text-gray-400 z-10">
            MOBILE NUMBER
          </Text>

          <TextInput className="p-4  text-gray-700  border-gray-800 border rounded-2xl"
            keyboardType='phone-pad' value={mobile} onChangeText={setMobile}
          />
          <Text className="text-gray-400 left-5">e.g. 03001234567</Text>
        </View>

        <CustomButton onPress={handleLogin} title='LOG IN'/>
        {/* {error && <Text className="text-red-500 text-center">{error}</Text>} */}
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
