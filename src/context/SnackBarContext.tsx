import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';
import { ViewStyle, TextStyle, Text } from 'react-native';

// Define the types for the snackbar
type SnackBarType = 'success' | 'error' | 'info';

// Define the shape of the SnackBarContext
interface SnackBarContextProps {
  showSnackBar: (msg: string, type?: SnackBarType) => void;
}

// Provide a default value for the context
const SnackBarContext = createContext<SnackBarContextProps | undefined>(undefined);

// Define the props for the SnackBarProvider component
interface SnackBarProviderProps {
  children: ReactNode;
}

// SnackBarProvider component
export const SnackBarProvider: React.FC<SnackBarProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [type, setType] = useState<SnackBarType>('success'); // Default to 'success'

  // Show snackbar with a message and optional type
  const showSnackBar = (msg: string, msgType: SnackBarType = 'success') => {
    setMessage(msg);
    setType(msgType);
    setVisible(true);
  };

  // Hide snackbar
  const hideSnackBar = () => {
    setVisible(false);
  };

  // Define colors/styles for different types
  const getSnackbarStyle = (): ViewStyle => {
    switch (type) {
      case 'error':
        return { backgroundColor: '#D32F2F' }; // Red for error
      case 'info':
        return { backgroundColor: '#0288D1' }; // Blue for info
      case 'success':
      default:
        return { backgroundColor: '#388E3C' }; // Green for success (default)
    }
  };

  const getSnackbarTextStyle = (): TextStyle => ({
    color: '#FFFFFF', // White text for contrast
  });

  return (
    <SnackBarContext.Provider value={{ showSnackBar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackBar}
        duration={3000}
        style={getSnackbarStyle()} // Dynamically set the style
        action={{
          label: 'Close',
          onPress: hideSnackBar,
        }}
      >
        <Text style={getSnackbarTextStyle()}>{message}</Text>
      </Snackbar>
    </SnackBarContext.Provider>
  );
};

// Custom hook for accessing the SnackBar context
export const useSnackBar = (): SnackBarContextProps => {
  const context = useContext(SnackBarContext);
  if (!context) {
    throw new Error('useSnackBar must be used within a SnackBarProvider');
  }
  return context;
};
