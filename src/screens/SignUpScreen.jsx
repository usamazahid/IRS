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
import TopBar from './components/TopBarComponent';

const SignUpScreen = () => {
    const { login } = useAuth();
    const navigation = useNavigation();
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
            <ScrollView className='px-8 '>
                <Text className="flex text-center text-gray-800 text-2xl">
                    SIGN UP
                </Text>

                <TextBox label='NAME'/>

                <TextBox label='MOBILE NUMBER' keyboardType='phone-pad' hintText='e.g. 03001234567' />

                <TextBox label="EMAIL (OPTIONAL)" keyboardType='email-address' />

                <TextBox label='PASSWORD' isPassword />
                
                <CustomButton onPress={()=>NavigationService.navigate('Home')} title='SIGN IN'/>
            </ScrollView>
        </View>

    );
};

export default SignUpScreen;
