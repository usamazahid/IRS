import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';
import PieChartCard from './components/PieChartCard';
import TimeSeriesChart from './components/TimeSeriesChart';
import FilterPanel from './components/FilterPanel';
import { RootState, AppDispatch } from '../redux/store';
import { fetchStatistics, clearStatistics } from '../redux/slices/statisticsSlice';
import type { FilterOptions } from './components/FilterPanel';

const AccidentStatisticsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accidentTypeDistribution, vehicleTypeDistribution, trends, loading, error } = 
    useSelector((state: RootState) => state.statistics);

  const handleFilterChange = (filters: FilterOptions) => {
    // Only dispatch if we have at least one filter value
    if (Object.values(filters).some(value => value !== undefined)) {
      dispatch(fetchStatistics({
        startDate: filters.startDate,
        endDate: filters.endDate,
        range: filters.range,
        interval: filters.interval,
      }));
    } else {
      // If all filters are cleared, fetch with default values
      dispatch(fetchStatistics({
        range: '1y',
        interval: 'month',
      }));
    }
  };

  useEffect(() => {
    // Initial fetch with default filters
    dispatch(fetchStatistics({
      range: '1y',
      interval: 'month',
    }));

    // Cleanup on unmount
    return () => {
      dispatch(clearStatistics());
    };
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => NavigationService.goBack()}
        >
          <ArrowLeftIcon size={20} color="black" />
        </TouchableOpacity>
      </View>
      
      <TopBar title="Accident Statistics" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FilterPanel
          onFilterChange={handleFilterChange}
          showDateRange={true}
          showRange={true}
          showInterval={true}
          showVehicleType={false}
          showAccidentType={false}
          showSeverity={false}
          disableDateRange={loading}
          disableRange={loading}
          disableInterval={loading}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => dispatch(fetchStatistics({
                range: '1y',
                interval: 'month',
              }))}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <PieChartCard
              title="Accident Type Distribution"
              data={accidentTypeDistribution}
            />
            
            <PieChartCard
              title="Vehicle Type Distribution"
              data={vehicleTypeDistribution}
            />
            
            <TimeSeriesChart
              title="Accident Trends Over Time"
              data={trends}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  loadingOverlay: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    margin: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#4F46E5',
    fontSize: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AccidentStatisticsScreen;