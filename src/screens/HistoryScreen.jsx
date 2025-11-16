import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';
import { useSelector } from 'react-redux';
import { getReportData } from '../services/accidentService';

import { hasRequiredPermissions } from '../utils/permissionUtils';
const recordsPerPage = 20;

const HistoryScreen = () => {
  const { user, role, permissions } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchReport = useCallback(async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const data = await getReportData(user.id, pageNumber, recordsPerPage);
      
      if (pageNumber === 1) {
        setReportData(data.reports);
      } else {
        setReportData(prevData => [...prevData, ...data.reports]);
      }
      
      // Update hasMore based on whether we received any data
      setHasMore(data.reports && data.reports.length === recordsPerPage);
    } catch (err) {
      setError('Failed to fetch report data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [user.id]);

  const loadMoreData = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReport(nextPage);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Update filtered data whenever reportData or search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = reportData.filter(item =>
        item.accidentTypeLabel?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(reportData);
    }
  }, [reportData, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

   const viewReportFullReport = (report) => {
     const defaultValues = {
       initialData: report,
       isApiCallRequired: true,
       editable: false,
       isUpdateData:false,
       reportId:report.id,
       returnId: report.createdAt
      }
     if( hasRequiredPermissions(permissions, ['investigation_form']) ){
        NavigationService.navigate('InvestigationForm',defaultValues );
     } else{
        NavigationService.navigate('ReportAccident',defaultValues );
     }
   };


  const renderPanel = ({ item }) => (
    <TouchableOpacity
      className="bg-gray-100 p-4 rounded-lg mb-2"
      onPress={() => handleItemPress(item)}
    >
      <Text className="text-lg font-semibold text-black">{item.accidentTypeLabel}</Text>
      <Text className="text-sm text-gray-600">{item.location}</Text>
      <Text className="text-sm mt-1 text-black">
        Status: <Text className="font-medium">{item.status}</Text>
      </Text>
    </TouchableOpacity>
  );

  if (loading && page === 1) {
    return (
      <SafeAreaView className="flex-1 bg-slate-200">
        <Text className="text-center mt-4 text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-200">
        <Text className="text-center mt-4 text-red-500">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-200">
      <View className="flex-1 p-4">
        <View className="flex-row justify-start p-2">
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
        <TopBar />
        <Text className="text-center text-gray-800 text-2xl mb-4">HISTORY</Text>

        <TextInput
          className="h-10 border border-gray-300 rounded-lg px-3 mb-4 mx-4"
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FlatList
          contentContainerStyle={styles.listContentContainer}
          data={filteredData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderPanel}
          ListEmptyComponent={
            <Text className="text-center mt-4 text-gray-500">No results found</Text>
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          ListFooterComponent={
            isLoadingMore ? <Text className="text-center mt-4 text-gray-500">Loading more...</Text> : null
          }
        />

        {selectedItem && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <Text style={styles.modalTitle}>Details</Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Accident Type:</Text> {selectedItem.accidentTypeLabel}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Description:</Text> {selectedItem.accidentTypeDescription}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Location:</Text> {selectedItem.location}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Status:</Text> {selectedItem.status}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Reported By:</Text> {selectedItem.reportedBy}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Created At:</Text> {selectedItem.createdAt}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={styles.viewFullButton}
                  onPress={() => {
                    console.log('=== View Full Report button pressed ===');
                    console.log('Selected item:', selectedItem);
                    console.log('Closing modal and navigating...');
                    setModalVisible(false);
                    viewReportFullReport(selectedItem);
                  }}
                >
                  <Text style={styles.viewFullButtonText}>View Full Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  modalText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  modalLabel: {
    fontWeight: 'bold',
    color: 'black',
  },
  viewFullButton: {
    marginTop: 15,
    backgroundColor: '#6A5ACD',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  viewFullButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingHorizontal: 16,
  },
});

export default HistoryScreen;
