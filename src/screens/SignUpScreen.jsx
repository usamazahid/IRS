import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import TextBox from './components/TextBox';
import NavigationService from '../context/NavigationService';
import CustomButton from './components/CustomButton';
import TopBar from './components/TopBarComponent';
import { useDispatch, useSelector } from 'react-redux';
import { signupAsync } from '../redux/slices/authSlice';
import { useSnackBar } from '../context/SnackBarContext';

const SignUpScreen = () => {
    const { showSnackBar } = useSnackBar();
    const dispatch = useDispatch();
    const { error, loading } = useSelector(state => state.auth);
    const [form, setForm] = useState({
        name: '',
        mobileNumber: '',
        email: '',
        password: ''
    });

    const handleChange = (field, value) => setForm({ ...form, [field]: value });

    const handleSignUp = () => {
        // Validate required fields
        if (!form.name.trim() || !form.mobileNumber.trim() || !form.password.trim()) {
            showSnackBar('Name, mobile number, and password are required');
            return;
        }

        // Dispatch signup action
        dispatch(signupAsync(form))
            .unwrap()
            .then(() => {
                showSnackBar('Success', 'Account created successfully');
                NavigationService.goBack(); // Navigate back on success
            })
            .catch((err) => {
                showSnackBar('Error', err || 'Failed to create account');
            });
    };

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex">
                <View className="flex-row justify-start">
                    <TouchableOpacity className="p-2 ml-2" onPress={() => NavigationService.goBack()}>
                        <ArrowLeftIcon size="20" color="black" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <TopBar />
            <ScrollView className='px-8'>
                <Text className="flex text-center text-gray-800 text-2xl">SIGN UP</Text>
                <TextBox label='NAME' value={form.name} onChangeText={(value) => handleChange('name', value)} />
                <TextBox label='MOBILE NUMBER' keyboardType='phone-pad' hintText='e.g. 03001234567' value={form.mobileNumber} onChangeText={(value) => handleChange('mobileNumber', value)} />
                <TextBox label="EMAIL (OPTIONAL)" keyboardType='email-address' value={form.email} onChangeText={(value) => handleChange('email', value)} />
                <TextBox label='PASSWORD' isPassword value={form.password} onChangeText={(value) => handleChange('password', value)} />
                <CustomButton onPress={handleSignUp} title='SIGN UP' loading={loading} />
                {error && <Text className="text-red-500 text-center">{error}</Text>}
            </ScrollView>
        </View>
    );
};

export default SignUpScreen;
