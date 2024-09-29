import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import NavigationService from './NavigationService';
import { hasRequiredPermissions } from '../utils/permissionUtils';

interface AuthContextProps {
  isAuthenticated: boolean;
  user: any;
  role: string | null; // Single role instead of an array
  permissions: string[];
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user,role, permissions } = useSelector((state: RootState) => state.auth);

 

  const values = {
    isAuthenticated,
    user,
    permissions,
    role
  };

  // Check if user is authenticated, if not redirect to Login
  useEffect(() => {
    if (!isAuthenticated) { 
      NavigationService.replace('Login');
    }
  }, [isAuthenticated]);

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



// AuthGuard to protect routes and check permissions
export const AuthGuard :React.FC<{requiredPermissions:string[], children: ReactNode }>= ({ requiredPermissions, children }) => {
 

  const { isAuthenticated, loading, permissions } = useSelector((state: RootState) => state.auth);


  useEffect(() => {
    if (!loading) {
      // Authentication check
      if (!isAuthenticated) {
        NavigationService.replace('Login');  // Redirect to login if not authenticated
      } 
      // Permissions check
      else if (!hasRequiredPermissions(permissions, requiredPermissions)) {
        NavigationService.goBack();  // Redirect to login if not authenticated
      }
    }
  }, [isAuthenticated, permissions, loading, requiredPermissions]);
  
  
  // Helper function to check if the user has required permissions
  

  // Display a loading spinner while checking authentication and permissions
  if (!isAuthenticated || permissions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return children; // Render the protected component if the user is authenticated and has permissions
};
