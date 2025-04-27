import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import CustomButton from './components/CustomButton';
import TopBar from './components/TopBarComponent';
import NavigationService from '../context/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitAccidentReport } from '../services/accidentService';

const OFFLINE_QUEUE_KEY = '@offline_reports';
const MAX_RETRIES = 10;

const OfflineReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const list = stored ? JSON.parse(stored) : [];
      setReports(list);
    } catch (error) {
      console.error('Error loading offline reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const deleteReport = async (report) => {
    const filtered = reports.filter(r => r.createdAt !== report.createdAt);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
    setReports(filtered);
  };

  const resubmitReport = async (report) => {
    if (report.retries >= MAX_RETRIES) {
      Alert.alert('Cannot Resubmit', 'Max retries reached for this report.');
      return;
    }
    try {
      const response = await submitAccidentReport(report);
      if (response.id) {
        await deleteReport(report);
        Alert.alert('Submitted', 'Report submitted successfully.');
      } else {
        throw new Error('No ID returned');
      }
    } catch (error) {
      const updated = reports.map(r =>
        r.createdAt === report.createdAt
          ? { ...r, retries: (r.retries || 0) + 1 }
          : r
      );
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
      setReports(updated);
      Alert.alert('Retry Failed', 'Will retry later.');
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  // Navigate to form screen with disabled editing flag, pass callback
  const viewReportFullReport = (report) => {
    const defaultValues = {
      initialData: report,
      editable: false,
      isUpdateData:false,
      returnId: report.createdAt,
    }
    console.log('useCase:', report.useCase); // Added missing semicolon
    if(report.useCase){
       NavigationService.navigate(report.useCase,defaultValues );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.accidentTypeLabel}</Text>
      <Text style={styles.subtitle}>Created: {new Date(item.createdAt).toLocaleString()}</Text>
      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <CustomButton
            title="View"
            onPress={() => viewReport(item)}
            color="transparent"
            textColor="blue"
          />
        </View>
        <View style={styles.actionButton}>
          <CustomButton
            title="Resubmit"
            onPress={() => resubmitReport(item)}
            color="transparent"
            textColor="green"
          />
        </View>
        <View style={styles.actionButton}>
          <CustomButton
            title="Delete"
            onPress={() => deleteReport(item)}
            color="transparent"
            textColor="red"
          />
        </View>
      </View>
      <View style={styles.fullReportButtonContainer}>
        <View style={styles.fullReportButton}>
          <CustomButton
            title="View Full Report"
            onPress={() => viewReportFullReport(item)}
            color="transparent"
            textColor="blue"
          />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => NavigationService.goBack()}>
          <ArrowLeftIcon size={20} color="black" />
        </TouchableOpacity>
      </View>
      <TopBar />
      <Text style={styles.screenTitle}>Offline Reports</Text>
      {reports.length === 0 ? (
        <Text style={styles.empty}>No pending offline reports</Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.createdAt}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer} // Fixed inline style warning by moving it to the styles object
        />
      )}

      {selectedReport && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Report Details</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Type:</Text> {selectedReport.accidentTypeLabel}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Desc:</Text> {selectedReport.accidentTypeDescription}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Location:</Text> {selectedReport.nearestLandMark}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Retries:</Text> {selectedReport.retries}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Created:</Text> {new Date(selectedReport.createdAt).toLocaleString()}
                </Text>
              </ScrollView>
              <CustomButton title="Close" onPress={() => setModalVisible(false)} color="blue" textColor="white" />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', padding: 8 },
  screenTitle: { textAlign: 'center', fontSize: 24, marginVertical: 12, color: '#1E293B' },
  loading: { textAlign: 'center', marginTop: 20, color: 'gray' },
  empty: { textAlign: 'center', marginTop: 20, color: 'gray' },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#61748B', marginBottom: 8 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Adjust spacing between buttons
    marginHorizontal: -4,
  },
  actionButton: {
    width: '30%',
    margin: 4,
  },
  fullReportButtonContainer: {
    width: '100%', // Full width for the container
    alignItems: 'center', // Center the button horizontally
  },
  fullReportButton: {
    flexShrink: 0, // Prevent text wrapping
    width: '70%', // Full width for the button
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    padding: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#0F172A' },
  modalText: { fontSize: 14, marginBottom: 8, color: '#334155' },
  modalLabel: { fontWeight: 'bold', color: '#0F172A' },
  contentContainer: {
    padding: 16,
  },
});

export default OfflineReportsScreen;
