import AsyncStorage from '@react-native-async-storage/async-storage';
import {submitAccidentReport} from './accidentService';
import {Alert} from 'react-native';

import NetInfo from '@react-native-community/netinfo'; 
const OFFLINE_QUEUE_KEY = '@offline_reports';
const MAX_RETRIES = 3;

export const saveReportOffline = async (reportData, isUpdate = false) => {
  try {
    const existingReports = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const reports = existingReports ? JSON.parse(existingReports) : [];

    if (isUpdate) {
      // Find the index of the report to update
      const reportIndex = reports.findIndex(
        (report) => report.id === reportData.id || report.createdAt === reportData.createdAt
      );

      if (reportIndex !== -1) {
        // Update the existing report
        reports[reportIndex] = {
          ...reports[reportIndex],
          ...reportData,
          retries: reports[reportIndex].retries, // Preserve retries count
        };
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(reports));
        console.log('Report updated for offline submission');
        return;
      }
    }

    // Add new report if not updating
    reports.push({
      ...reportData,
      retries: 0,
      syncStatus: 'pending',
    });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(reports));
    console.log('Report saved for offline submission');
  } catch (error) {
    console.error('Error saving report offline:', error);
  }
};

export const getOfflineReports = async () => {
  const reports = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return reports ? JSON.parse(reports) : [];
};

export const clearOfflineReports = async () => {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
};

export const removeOfflineReport = async (reportData) => {
  try {
    const existingReports = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const reports = existingReports ? JSON.parse(existingReports) : [];

    // Filter out the report with the same `createdAt` or matching fields
    const updatedReports = reports.filter(
      (report) => report.createdAt !== reportData.createdAt
    );

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedReports));
    console.log(`Report with createdAt ${reportData.createdAt} removed from offline storage.`);
  } catch (error) {
    console.error('Error removing offline report:', error);
  }
};

// Enhanced sync function with retries
export const syncOfflineReports = async () => {
  try {
    const offlineReports = await getOfflineReports();
    if (offlineReports.length === 0) {return;}

    const successfulSubmissions = [];
    const remainingReports = [];

    for (const report of offlineReports) {
      if (report.retries >= MAX_RETRIES) {
        if(report.viewOfflineReport) {
          remainingReports.push(report); // Keep in storage for viewing
          console.warn(
            `Report ${report.createdAt} is marked as viewable, skipping submission`,
          );
          continue;
        }
        console.warn(
          `Skipping report ${report.createdAt}: max retries reached`,
        );
        continue;
      }

      try {
        console.log(report);
        const response = await submitAccidentReport(report);
        if (response.id) {
          successfulSubmissions.push(report.createdAt);
          console.log('Submitted offline report:', response.id);
        } else {
          console.warn(
            'Report submission failed, will retry:',
            report.createdAt,
          );
          remainingReports.push({...report, retries: report.retries + 1});
        }
      } catch (error) {
        console.error('Failed to submit report:', report.createdAt, error);
        remainingReports.push({...report, retries: report.retries + 1});
      }
    }

    // Save only remaining reports that failed or need more retries
    await AsyncStorage.setItem(
      OFFLINE_QUEUE_KEY,
      JSON.stringify(remainingReports),
    );

    if (successfulSubmissions.length > 0) {
      Alert.alert(
        'Sync Complete',
        `${successfulSubmissions.length} offline reports submitted successfully`,
      );
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
};


let isSyncing = false; // 🏁 Sync flag

export const setupNetworkListener = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable && !isSyncing) {
      console.log('Internet connected — syncing offline reports');
      isSyncing = true;

      syncOfflineReports().finally(() => {
        isSyncing = false; // Reset flag after sync
      });
    }
  });
};
