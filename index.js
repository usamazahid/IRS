/**
 * @format
 */
 

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/redux/store'; // Import your store
import App from './App'; // Adjust the path to your App component
import { name as appName } from './app.json';

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
