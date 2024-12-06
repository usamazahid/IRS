import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Modal, ScrollView ,StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';
import { useSelector } from 'react-redux';
import { getReportData } from '../services/accidentService';

const HistoryScreen = () => {
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportData(user.id);
        setReportData(data); // Store fetched data
        setFilteredData(data); // Initialize the filtered data
      } catch (err) {
        setError('Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user.id]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query) {
      const filtered = reportData.filter(
        (item) =>
          item.accidentTypeLabel &&
          item.accidentTypeLabel.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(reportData); // Reset to full list if query is empty
    }
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
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

  if (loading) {
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

        {/* List of Panels */}
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16 }}
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderPanel}
          ListEmptyComponent={
            <Text className="text-center mt-4 text-gray-500">No results found</Text>
          }
        />

        {/* Modal for Details */}
        {/* Transparent Modal */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent black background
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
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
export default HistoryScreen;