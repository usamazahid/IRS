import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { TimeSeriesDataPoint } from '../../services/accidentService';

interface TimeSeriesChartProps {
  title: string;
  data: TimeSeriesDataPoint[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ title, data }) => {
  // Calculate minimum width needed per data point (75px per point)
  const chartWidth = Math.max(Dimensions.get('window').width * 1.5, data.length * 75);
  
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
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '4',
          strokeWidth: '2',
          stroke: '#ffa726',
        },
        propsForLabels: {
          fontSize: 9,
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
      yLabelsOffset={20}
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
        <View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.chartScrollContainer}>
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  chartScrollContainer: {
    paddingRight: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
  },
});

export default TimeSeriesChart;
