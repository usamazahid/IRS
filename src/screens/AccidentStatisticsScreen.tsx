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
import { fetchStatistics, clearStatistics, fetchInsights, clearInsights } from '../redux/slices/statisticsSlice';
import type { FilterOptions } from './components/FilterPanel';

interface InsightsSectionProps {
  type: 'accidentType' | 'vehicleType' | 'trends' | 'comprehensive';
  title: string;
  comprehensive?: boolean;
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ type, title, comprehensive = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insights = useSelector((state: RootState) => state.statistics.insights[type]);
  const loading = useSelector((state: RootState) => state.statistics.insightsLoading[type]);
  const error = useSelector((state: RootState) => state.statistics.insightsError[type]);

  const handleGenerateInsights = () => {
    if (comprehensive) {
      dispatch(fetchInsights({ type: 'comprehensive', comprehensive: true }));
    } else {
      dispatch(fetchInsights({ type, comprehensive: false }));
    }
  };

  const handleClearInsights = () => {
    dispatch(clearInsights(type));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.insightsLoading}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.insightsLoadingText}>Generating insights...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.insightsError}>
          <Text style={styles.insightsErrorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleGenerateInsights}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (insights) {
      return (
        <View style={styles.insightsContent}>
          <View style={styles.insightsContentHeader}>
            <View style={styles.insightsTextContainer}>
              <Text style={styles.insightsText}>{insights}</Text>
            </View>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearInsights}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.insightsSection}>
      <View style={styles.insightsHeader}>
        <Text style={styles.insightsTitle}>{title} Insights</Text>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateInsights}
          disabled={loading}
        >
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating...' : 'Generate'}
          </Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
};

const AccidentStatisticsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [visibleCharts, setVisibleCharts] = useState({
    accidentType: true,
    vehicleType: true,
    trends: true,
  });
  const { 
    accidentTypeDistribution, 
    vehicleTypeDistribution, 
    trends, 
    loading, 
    error
  } = useSelector((state: RootState) => state.statistics);

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
            {/* Comprehensive Insights Section */}
            <View style={[styles.chartSection, styles.comprehensiveSection]}>
            {!loading && (<InsightsSection type="comprehensive" title="Comprehensive" comprehensive={true} />)}
            </View>

            {/* Individual Chart Sections */}
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
                <>
                  <PieChartCard
                    title=""
                    data={accidentTypeDistribution}
                  />
                 {!loading && (<InsightsSection type="accidentType" title="AI" />)}
                </>
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
                <>
                  <PieChartCard
                    title=""
                    data={vehicleTypeDistribution}
                  />
                  {!loading && (<InsightsSection type="vehicleType" title="AI" />)}
                </>
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
                <>
                  <TimeSeriesChart
                    title=""
                    data={trends}
                  />
                  {!loading && (<InsightsSection type="trends" title="AI" />)}
                </>
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
  insightsSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  generateButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  insightsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  insightsLoadingText: {
    marginLeft: 8,
    color: '#6B7280',
  },
  insightsError: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  insightsErrorText: {
    color: '#DC2626',
    marginBottom: 8,
  },
  insightsContent: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  insightsContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  comprehensiveSection: {
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
  },
});

export default AccidentStatisticsScreen;