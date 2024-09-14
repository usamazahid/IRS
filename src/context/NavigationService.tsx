import { CommonActions, StackActions, NavigationContainerRef } from '@react-navigation/native';
import React from 'react';

// Define a navigation reference
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

class NavigationService {
  // Navigate to a screen
  static navigate(routeName: string, params?: any) {
    navigationRef.current?.navigate(routeName, params);
  }

  // Go back to the previous screen
  static goBack() {
    navigationRef.current?.goBack();
  }

  // Reset the navigation stack
  static reset(routeName: string, params?: any) {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      })
    );
  }

  // Replace the current route with a new one
  static replace(routeName: string, params?: any) {
    navigationRef.current?.dispatch(
      StackActions.replace(routeName, params)
    );
  }

  // Pop to the top of the stack
  static popToTop() {
    navigationRef.current?.dispatch(StackActions.popToTop());
  }
}

export default NavigationService;
