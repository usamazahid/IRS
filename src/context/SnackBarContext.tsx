import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';

// Define the shape of the SnackBarContext
interface SnackBarContextProps {
  showSnackBar: (msg: string) => void;
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

  const showSnackBar = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  const hideSnackBar = () => {
    setVisible(false);
  };

  return (
    <SnackBarContext.Provider value={{ showSnackBar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackBar}
        duration={3000}
        action={{
          label: 'Close',
          onPress: hideSnackBar,
        }}
      >
        {message}
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
