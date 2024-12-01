/**
 * @format
 */
 

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import store, { persistor } from './src/redux/store'; // Import your store
import App from './App'; // Adjust the path to your App component
import { name as appName } from './app.json';

import { PersistGate } from 'redux-persist/integration/react';
import LoadingSpinner from './src/screens/components/LoadingSpinner';
const Root = () => (
  <Provider store={store}>
     <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <App />
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
