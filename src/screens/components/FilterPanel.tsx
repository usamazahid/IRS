import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchReportDropdowns } from '../../redux/slices/dropdownSlice';
import GenericDropDownMenu from './GenericDropDownMenu';
import DatePickerField from './DatePickerField';

export interface FilterOptions {
  vehicleType?: string;
  accidentType?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  range?: string;
  interval?: string;
}

export interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  showVehicleType?: boolean;
  showAccidentType?: boolean;
  showDateRange?: boolean;
  showSeverity?: boolean;
  showRange?: boolean;
  showInterval?: boolean;
  disableVehicleType?: boolean;
  disableAccidentType?: boolean;
  disableDateRange?: boolean;
  disableSeverity?: boolean;
  disableRange?: boolean;
  disableInterval?: boolean;
}

interface DropdownItem {
  id: string;
  label: string;
}

const FILTER_SEVERITY = [
  { id: 'low', label: 'Low Severity (1-3)' },
  { id: 'medium', label: 'Medium Severity (4-6)' },
  { id: 'high', label: 'High Severity (7-10)' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  showVehicleType = true,
  showAccidentType = true,
  showDateRange = true,
  showSeverity = true,
  showRange = false,
  showInterval = false,
  disableVehicleType = false,
  disableAccidentType = false,
  disableDateRange = false,
  disableSeverity = false,
  disableRange = false,
  disableInterval = false,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const dispatch = useDispatch<AppDispatch>();
  const { vehicleInvolved, accidentTypes, loading, error } = useSelector((state: RootState) => state.dropdown);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const rangeOptions = [
    { id: '1w', label: 'Last Week' },
    { id: '1m', label: 'Last Month' },
    { id: '3m', label: 'Last 3 Months' },
    { id: '6m', label: 'Last 6 Months' },
    { id: '1y', label: 'Last Year' },
  ];

  const intervalOptions = [
    // { id: 'hour', label: 'Hourly' },
    { id: 'day', label: 'Daily' },
    { id: 'week', label: 'Weekly' },
    { id: 'month', label: 'Monthly' },
    { id: 'quarter', label: 'Quarterly' },
    { id: 'year', label: 'Yearly' },
  ];

  useEffect(() => {
    if (!loading && !error && (!vehicleInvolved?.length || !accidentTypes?.length)) {
      dispatch(fetchReportDropdowns());
    }
  }, [dispatch, loading, error, vehicleInvolved?.length, accidentTypes?.length]);

  const handleFilterChange = (type: keyof FilterOptions, value?: string) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      vehicleType: undefined,
      accidentType: undefined,
      startDate: undefined,
      endDate: undefined,
      severity: undefined,
      range: undefined,
      interval: undefined,
    });
    setStartDate(null);
    setEndDate(null);
    onFilterChange({});
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flex1}>
        {showVehicleType && (
          <GenericDropDownMenu
            data={vehicleInvolved || []}
            valueField="id"
            labelField="label"
            placeholder="Select Vehicle Type"
            value={filters.vehicleType}
            disabled={loading || disableVehicleType || !vehicleInvolved?.length}
            onItemSelect={(item: DropdownItem | null) => handleFilterChange('vehicleType', item?.id)}
          />
        )}
        </View>
        <View style={styles.flex1}>
        {showAccidentType && (
          <GenericDropDownMenu
            data={accidentTypes || []}
            valueField="id"
            labelField="label"
            placeholder="Select Accident Type"
            value={filters.accidentType}
            disabled={loading || disableAccidentType || !accidentTypes?.length}
            onItemSelect={(item: DropdownItem | null) => handleFilterChange('accidentType', item?.id)}
          />
        )}
        </View>
      </View>

      {showDateRange && (
        <View style={styles.dateRow}>
          <DatePickerField
            label="Start Date"
            value={startDate ? startDate.toISOString() : undefined}
            onChange={(date) => {
              setStartDate(date);
              handleFilterChange('startDate', date.toISOString());
            }}
            disabled={disableDateRange}
            placeholder="Select Start Date"
            maximumDate={endDate || undefined}
          />
          <View style={styles.dateSeparator} />
          <DatePickerField
            label="End Date"
            value={endDate ? endDate.toISOString() : undefined}
            onChange={(date) => {
              setEndDate(date);
              handleFilterChange('endDate', date.toISOString());
            }}
            disabled={disableDateRange}
            placeholder="Select End Date"
            minimumDate={startDate || undefined}
          />
        </View>
      )}

      {showSeverity && (
      <View style={styles.row}>
        <View style={styles.flex1}>
          <GenericDropDownMenu
            data={FILTER_SEVERITY}
            valueField="id"
            labelField="label"
            placeholder="Select Severity"
            value={filters.severity}
            disabled={loading || disableSeverity}
            onItemSelect={(item: DropdownItem | null) => handleFilterChange('severity', item?.id)}
          />
        </View>
      </View>
      )}

      {showRange && (
      <View style={styles.row}>
        <View style={styles.flex1}>
          <GenericDropDownMenu
            data={rangeOptions}
            valueField="id"
            labelField="label"
            placeholder="Select Time Range"
            value={filters.range}
            disabled={disableRange}
            onItemSelect={(item: DropdownItem | null) => handleFilterChange('range', item?.id)}
          />
        </View>
      </View>
      )}

      {showInterval && (
      <View style={styles.row}>
        <View style={styles.flex1}>
          <GenericDropDownMenu
            data={intervalOptions}
            valueField="id"
            labelField="label"
            placeholder="Select Interval"
            value={filters.interval}
            disabled={disableInterval}
            onItemSelect={(item: DropdownItem | null) => handleFilterChange('interval', item?.id)}
          />
        </View>
      </View>
      )}

      {(filters.vehicleType || filters.accidentType || filters.startDate || filters.endDate || filters.severity || filters.range || filters.interval) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 12, borderRadius: 8, margin: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  flex1: { flex: 1, marginHorizontal: 4 },
  dateButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, alignItems: 'center', marginHorizontal: 4 },
  clearButton: { marginTop: 8, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 4, alignItems: 'center' },
  clearButtonText: { color: '#666', fontSize: 14 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dateButtonText: { color: '#495057', fontSize: 14 },
  dateSeparator: { width: 10 },
});

export default FilterPanel;
