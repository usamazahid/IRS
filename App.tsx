import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import  { navigationRef } from './src/context/NavigationService'; // Adjust if needed
import { AuthGuard, AuthProvider } from './src/context/AuthContext'; // Adjust the path to the AuthContext if it's also in src
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallAmbulanceScreen from './src/screens/CallAmbulanceScreen';
import ReportAccident from './src/screens/ReportAccident';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import ReportScreen from './src/screens/ReportScreen';
import ManageUsersScreen from './src/screens/ManageUsersScreen';
import CurrentActivityScreen from './src/screens/CurrentActivityScreen';
import ManageActivityScreen from './src/screens/ManageActivityScreen';
import SearchUserScreen from './src/screens/SearchUserScreen';
import CreateUserScreen from './src/screens/CreateUserScreen';

import { Provider as PaperProvider } from 'react-native-paper';
import { SnackBarProvider } from './src/context/SnackBarContext';
import AmbulanceStatsScreen from './src/screens/AmbulanceStatsScreen';
 
const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <AuthProvider>
       <PaperProvider>
      <SnackBarProvider>
  
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['dashboard_view']}>
                <HomeScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="CallAmbulance">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['call_ambulance']}>
                <CallAmbulanceScreen />
              </AuthGuard>
            )}
          </Stack.Screen>

          <Stack.Screen name="ReportAccident">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['report_accident']}>
                <ReportAccident />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="InvestigationForm">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['investigation_form']}>
                <ReportAccident />
              </AuthGuard>
            )}
          </Stack.Screen>

          <Stack.Screen name="Profile">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['view_profile']}>
                <ProfileScreen />
              </AuthGuard>
            )}
          </Stack.Screen>

          <Stack.Screen name="History">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['view_history']}>
                <HistoryScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Report">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['view_report']}>
                <ReportScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="AmbulanceStats">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['ambulance_stats']}>
                <AmbulanceStatsScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="ManageActivities">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['manage_activities']}>
                <ManageActivityScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="CurrentActivities">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['current_activities']}>
                <CurrentActivityScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="ManageUsers">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['manage_users']}>
                <ManageUsersScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="SearchUsers">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['search_users']}>
                <SearchUserScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="CreateUsers">
            {(props) => (
              <AuthGuard {...props} requiredPermissions={['create_users']}>
                <CreateUserScreen />
              </AuthGuard>
            )}
          </Stack.Screen>
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </SnackBarProvider>
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;

 