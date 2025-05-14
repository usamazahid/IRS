import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { TimeSeriesDataPoint } from '../../services/accidentService';

interface TimeSeriesChartProps {
  title: string;
  data: TimeSeriesDataPoint[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ title, data }) => {
  const screenWidth = Dimensions.get('window').width;
  // Ensure minimum width for readability, accounting for padding
  const chartWidth = Math.max(screenWidth - 64, data.length * 80);
  
  const formatXLabel = (label: string) => {
    try {
      const date = new Date(label);
      if (isNaN(date.getTime())) {
        // If it's not a valid date string, return as is
        return label;
      }
      // Format based on the length - show different formats for different intervals
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: data.length <= 31 ? 'numeric' : undefined,
        year: 'numeric',
      });
    } catch {
      return label;
    }
  };

  const chartData = {
    labels: data.map(point => formatXLabel(point.timePeriod)),
    datasets: [
      {
        data: data.map(point => point.totalCount),
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: data.map(point => point.fatalCount),
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: data.map(point => point.avgSeverity),
        color: (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Total Accidents', 'Fatal Accidents', 'Avg. Severity'],
  };

  const renderChart = () => (
    <LineChart
      data={chartData}
      width={chartWidth}
      height={220}
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
        style: {
          borderRadius: 16,
          paddingLeft: 60,
          paddingRight: 30,
        },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#ffa726',
        },
        propsForLabels: {
          fontSize: 12,
          fontWeight: '600',
        },
        propsForVerticalLabels: {
          fontSize: 12,
          fontWeight: '600',
        },
        propsForHorizontalLabels: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
      bezier
      style={styles.chart}
      fromZero
      yAxisLabel=""
      yAxisSuffix=""
      yAxisInterval={1}
      verticalLabelRotation={0}
      horizontalLabelRotation={45}
      segments={5}
      formatYLabel={(value: string | number) => Math.round(Number(value)).toString()}
      xLabelsOffset={8}
      yLabelsOffset={30}
      withInnerLines={true}
      withOuterLines={true}
      withVerticalLabels={true}
      withHorizontalLabels={true}
    />
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      {chartData.legend.map((label, index) => (
        <View key={index} style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: chartData.datasets[index].color(1) },
            ]}
          />
          <Text style={styles.legendText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {data.length > 0 ? (
        <View style={styles.chartWrapper}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.chartScrollContainer}
          >
            {renderChart()}
          </ScrollView>
          {renderLegend()}
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  chartWrapper: {
    width: '100%',
    paddingLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  chartScrollContainer: {
    paddingRight: 24,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
    gap: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default TimeSeriesChart;
