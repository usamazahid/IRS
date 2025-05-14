import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import type { ChartDataPoint } from '../../services/accidentService';

interface PieChartCardProps {
  title: string;
  data: ChartDataPoint[];
}

const colors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#8AC24A',
  '#FF5252',
  '#03A9F4',
  '#795548',
];

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const screenWidth = Dimensions.get('window').width;
  // Adjust width to account for parent padding and safe area
  const chartWidth = screenWidth - 96; 
  
  const chartData = data.map((item, index) => ({
    name: ` ${item.count} - ${item.label}`,
    population: item.count,
    color: colors[index % colors.length],
    legendFontColor: '#1f2937',
    legendFontSize: 14,
    percentage: ((item.count / total) * 100).toFixed(1),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {data.length > 0 ? (
        <View style={styles.chartWrapper}>
          <PieChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 14,
                fontWeight: '600',
              },
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={false}
          />
          <View style={styles.legendContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText} numberOfLines={2}>
                  {item.name} ({item.percentage}%)
                </Text>
              </View>
            ))}
          </View>
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
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  legendContainer: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    lineHeight: 20,
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

export default PieChartCard;
