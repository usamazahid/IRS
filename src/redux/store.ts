import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For React Native storage
import authReducer from './slices/authSlice';
import dropdownReducer from './slices/dropdownSlice';
import statisticsReducer from './slices/statisticsSlice';

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
  blacklist: ['loading', 'error'], // Don't persist loading state and errors
  whielist: [
    'accidentTypes',
    'patientVictim',
    'vehicleInvolved',
    'apparentCauses',
    'weatherConditions',
    'visibilityLevels',
    'roadSurfaceConditions',
    'roadTypes',
    'roadSignages',
    'caseReferredTo',
    'faultAssessments',
    'ambulanceServiceData',
    'frequentlyUsedServices',
  ],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  dropdown: persistReducer(dropdownPersistConfig,dropdownReducer), // Non-persisted reducer
  statistics: statisticsReducer, // Don't persist statistics data
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore redux-persist actions
        warnAfter: 100,
      },
      immutableCheck: {
        warnAfter: 100,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;
