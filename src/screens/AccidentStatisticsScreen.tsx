import React, { useEffect, useState } from 'react';
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
  const [visibleCharts, setVisibleCharts] = useState({
    accidentType: true,
    vehicleType: true,
    trends: true,
  });
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

  const toggleChart = (chartName: keyof typeof visibleCharts) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName],
    }));
  };

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
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Accident Type Distribution</Text>
                <TouchableOpacity 
                  style={styles.chartToggleButton}
                  onPress={() => toggleChart('accidentType')}
                >
                  <Text style={styles.chartToggleText}>
                    {visibleCharts.accidentType ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {visibleCharts.accidentType && (
                <PieChartCard
                  title=""
                  data={accidentTypeDistribution}
                />
              )}
            </View>

            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Vehicle Type Distribution</Text>
                <TouchableOpacity 
                  style={styles.chartToggleButton}
                  onPress={() => toggleChart('vehicleType')}
                >
                  <Text style={styles.chartToggleText}>
                    {visibleCharts.vehicleType ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {visibleCharts.vehicleType && (
                <PieChartCard
                  title=""
                  data={vehicleTypeDistribution}
                />
              )}
            </View>

            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Accident Trends Over Time</Text>
                <TouchableOpacity 
                  style={styles.chartToggleButton}
                  onPress={() => toggleChart('trends')}
                >
                  <Text style={styles.chartToggleText}>
                    {visibleCharts.trends ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {visibleCharts.trends && (
                <TimeSeriesChart
                  title=""
                  data={trends}
                />
              )}
            </View>
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  toggleButton: {
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 8,
    backgroundColor: '#e5e7eb',
  },
  activeToggle: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#fff',
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
  chartSection: {
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  chartToggleButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  chartToggleText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AccidentStatisticsScreen;