import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { ArrowLeftIcon } from 'react-native-heroicons/solid'
import { useNavigation } from '@react-navigation/native';
import TextBox from './components/TextBox';
import NavigationService, { navigationRef } from '../context/NavigationService';
import CustomButton from './components/CustomButton';

import { useDispatch, useSelector } from 'react-redux';
import TopBar from './components/TopBarComponent';
import { hasRequiredPermissions } from '../utils/permissionUtils'; 
import { logout } from '../redux/slices/authSlice'; // Adjust the path to where your authSlice is located
import { resetLovs } from '../redux/slices/dropdownSlice'; // Adjust the path to where your authSlice is located
import {useSnackBar} from '../context/SnackBarContext'

const HomeScreen = () => {
    const { showSnackBar } = useSnackBar();
    const dispatch = useDispatch();
    const { user, role, permissions } = useSelector((state) => state.auth);
    const navigation = useNavigation();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Return true to prevent default behavior (app exit)
            return true;
        });

        return () => backHandler.remove();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetLovs()); 
        showSnackBar('Successful Logout');
        NavigationService.navigate('Login');
    };

    return (
        <View className="flex-1 bg-slate-200">
            {/* <SafeAreaView className="flex">
                <View className="flex-row justify-start">
                    <TouchableOpacity className="p-2 ml-2"
                        onPress={() => NavigationService.goBack()}>
                        <ArrowLeftIcon size="20" color="black" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView> */}
            <TopBar />
            <ScrollView className='px-8 '>
                <Text className="flex text-center text-gray-800 text-2xl">
                    DASHBOARD
                </Text>
                {
                    hasRequiredPermissions(permissions, ['alert_options']) &&
                    ( <></>)
                }
                
                {
                    hasRequiredPermissions(permissions, ['manage_activities']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('ManageActivities')}
                        title='MANAGE ACTIVITIES' />)
                }
                {
                    hasRequiredPermissions(permissions, ['current_activities']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('CurrentActivities')}
                        title='CURRENT ACTIVITIES' />)
                }
                {
                    hasRequiredPermissions(permissions, ['manage_users']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('ManageUsers')}
                        title='MANAGE USERS' />)
                }


                {
                    hasRequiredPermissions(permissions, ['pick_up']) &&
                    (<CustomButton
                        onPress={() => showSnackBar('pick up')}
                        title='PICK UP' />)
                }
                {
                    hasRequiredPermissions(permissions, ['drop_off']) &&
                    (<CustomButton
                        onPress={() => showSnackBar('droff off')}
                        title='DROP OFF' />)
                }
                {
                    hasRequiredPermissions(permissions, ['investigation_form']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('InvestigationForm')}
                        title='INVESTIGATION FORM' />)
                }
                {
                    hasRequiredPermissions(permissions, ['report_accident']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('ReportAccident')}
                        title='REPORT ACCIDENT' />)
                }
                {
                    hasRequiredPermissions(permissions, ['call_ambulance']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('CallAmbulance')}
                        title='CALL AMBULANCE'
                        variant='outlined' />)
                }


                {
                    hasRequiredPermissions(permissions, ['ambulance_stats']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('AmbulanceStats')}
                        title='AMBULANCE STATS'
                        variant='outlined' />)
                }
                {
                    hasRequiredPermissions(permissions, ['view_history']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('History')}
                        title='HISTORY' />)
                }

               
                {
                    hasRequiredPermissions(permissions, ['view_offline_reports']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('OfflineReports')}
                        title='OFFLINE REPORTS' />)
                }

                {
                    hasRequiredPermissions(permissions, ['view_profile']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('Profile')}
                        title='PROFILE'
                        variant='outlined' />)
                }
                {
                    hasRequiredPermissions(permissions, ['view_report']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('AccidentAnalysis')}
                        title='ACCIDENT ANALYSIS' />)
                }
                {
                    hasRequiredPermissions(permissions, ['view_report']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('AccidentStatistics')}
                        title='ACCIDENT STATISTICS'
                        variant='outlined' />)
                }
                {
                    hasRequiredPermissions(permissions, ['view_report']) &&
                    (<CustomButton
                        onPress={() => NavigationService.navigate('GeneratedAI')}
                        title='AI INSIGHTS'
                        variant='outlined' />)
                }
                    <CustomButton
                        onPress={handleLogout}
                        title='LOGOUT'
                        variant='outlined' />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
