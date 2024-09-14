import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { ArrowLeftIcon } from 'react-native-heroicons/solid'
import { useNavigation } from '@react-navigation/native';
import TextBox from './components/TextBox';
import NavigationService, { navigationRef } from '../context/NavigationService';
import CustomButton from './components/CustomButton';

const HomeScreen = () => {
    const { login } = useAuth();
    const navigation = useNavigation();
    return (

        <View className="flex-1 bg-slate-200">
            <SafeAreaView className="flex">
                <View className="flex-row justify-start">
                    <TouchableOpacity className="p-2 ml-2"
                        onPress={() => NavigationService.goBack()}>
                        <ArrowLeftIcon size="20" color="black" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <ScrollView className='px-8 '>
                <Text className="flex text-center text-gray-800 text-2xl">
                    DASHBOARD
                </Text>         

                <CustomButton 
                onPress={()=>NavigationService.navigate('CallAmbulance')} 
                title='CALL AMBULANCE'
                variant='outlined'/>

                <CustomButton 
                onPress={()=>NavigationService.navigate('ReportAccident')} 
                title='REPORT ACCIDENT'/>

                <CustomButton 
                onPress={()=>NavigationService.navigate('Profile')} 
                title='PROFILE'
                variant='outlined'/>

                <CustomButton 
                onPress={()=>NavigationService.navigate('History')} 
                title='HISTORY'/>

            </ScrollView>
        </View>

    );
};

export default HomeScreen;
