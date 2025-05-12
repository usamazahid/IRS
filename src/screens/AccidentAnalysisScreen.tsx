import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import FilterPanel from './components/FilterPanel';
import NavigationService from '../context/NavigationService';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import TopBar from './components/TopBarComponent';
import AccidentHeatmap from './components/AccidentHeatmap';
import AccidentClustering from './components/AccidentClustering';

interface Filters {
  vehicleType?: string;
  accidentType?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  range?: string;
}

const AccidentAnalysisScreen: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClustering, setShowClustering] = useState(false);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const toggleView = (isHeatmap: boolean) => {
    setShowHeatmap(isHeatmap);
    setShowClustering(!isHeatmap);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => NavigationService.goBack()}
        >
          <ArrowLeftIcon size="20" color="black" />
        </TouchableOpacity>
      </View>
      
      <TopBar title="Accident Analysis" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FilterPanel
          onFilterChange={handleFilterChange}
          showVehicleType={true}
          showAccidentType={true}
          showDateRange={true}
          showSeverity={true}
          showRange={false} // Always hide range since it's handled by backend
        />
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, showHeatmap && styles.activeToggle]}
            onPress={() => toggleView(true)}
          >
            <Text style={[styles.toggleText, showHeatmap && styles.activeToggleText]}>
              Heatmap View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, showClustering && styles.activeToggle]}
            onPress={() => toggleView(false)}
          >
            <Text style={[styles.toggleText, showClustering && styles.activeToggleText]}>
              Clustering View
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapWrapper}>
          {showHeatmap && (
            <AccidentHeatmap
              limit={100}
              vehicleType={filters.vehicleType}
              accidentType={filters.accidentType}
              startDate={filters.startDate}
              endDate={filters.endDate}
              severity={filters.severity}
            />
          )}

          {showClustering && (
            <AccidentClustering
              limit={100}
              vehicleType={filters.vehicleType}
              accidentType={filters.accidentType}
              range={filters.range}
              startDate={filters.startDate}
              endDate={filters.endDate}
              severity={filters.severity}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
  },
  mapWrapper: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
});

export default AccidentAnalysisScreen;
