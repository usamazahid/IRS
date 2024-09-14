import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavigationService, { navigationRef } from './src/context/NavigationService'; // Adjust if needed
import { AuthProvider } from './src/context/AuthContext'; // Adjust the path to the AuthContext if it's also in src
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallAmbulanceScreen from './src/screens/CallAmbulanceScreen';
import ReportAccident from './src/screens/ReportAccident';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';


const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CallAmbulance" component={CallAmbulanceScreen} />
          <Stack.Screen name="ReportAccident" component={ReportAccident} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
