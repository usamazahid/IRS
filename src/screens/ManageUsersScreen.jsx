// src/screens/ConfirmationScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import CustomButton from './components/CustomButton';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';

import { hasRequiredPermissions } from '../utils/permissionUtils';
import { useDispatch,useSelector } from 'react-redux';
const ManageUsersScreen = ( ) => {
  
  const  {   user,role, permissions } = useSelector((state) => state.auth);
  return (
    <SafeAreaView className="flex-1 bg-slate-200 bg-white">
    <View className="flex-row justify-start p-2">
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
        <TopBar/>
    
        <View className="flex-1 justify-center p-6 bg-white">
      
        {   hasRequiredPermissions(permissions,['search_users'])&&
      (
      <CustomButton
        onPress={() => NavigationService.navigate('SearchUsers')}
        title="Search User"
        color="green"
        textColor="white"
      />)}
  {   hasRequiredPermissions(permissions,['create_users'])&&
      (<CustomButton
        onPress={() => NavigationService.navigate('CreateUsers')}
        title="Create User"
        color="transparent"
        textColor="blue"
      />)}
    </View>
    </SafeAreaView>
  );
};

export default ManageUsersScreen;
