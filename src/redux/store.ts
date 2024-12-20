import {configureStore, combineReducers} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For React Native storage
import authReducer from './slices/authSlice';
import dropdownReducer from './slices/dropdownSlice';

// Configurations for redux-persist
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['isAuthenticated', 'user', 'role', 'permissions'], // Only persist these keys
};

// Configurations for redux-persist
const dropdownPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
      'accidentTypes',
    'patientVictim',
    'vehicleInvolved',
    'frequentlyUsedServices',
    'ambulanceServiceData',
  ], // Only persist these keys
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  dropdown: persistReducer(dropdownPersistConfig,dropdownReducer), // Non-persisted reducer
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore redux-persist actions
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;
