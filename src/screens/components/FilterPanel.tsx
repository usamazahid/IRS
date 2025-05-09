import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchReportDropdowns } from '../../redux/slices/dropdownSlice';
import GenericDropDownMenu from './GenericDropDownMenu';
import DatePickerField from './DatePickerField';

interface FilterOptions {
  vehicleType?: string;
  accidentType?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
}
interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  // visibility flags
  showVehicleType?: boolean;
  showAccidentType?: boolean;
  showDateRange?: boolean;
  showSeverity?: boolean;
  // disable flags
  disableVehicleType?: boolean;
  disableAccidentType?: boolean;
  disableDateRange?: boolean;
  disableSeverity?: boolean;
}

interface DropdownItem {
  id: string;
  label: string;
}

const FILTER_SEVERITY = [
  { id: 'low', label: 'Low (1-3)' },
  { id: 'medium', label: 'Medium (4-6)' },
  { id: 'high', label: 'High (7-10)' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  showVehicleType = true,
  showAccidentType = true,
  showDateRange = true,
  showSeverity = true,
  disableVehicleType = false,
  disableAccidentType = false,
  disableDateRange = false,
  disableSeverity = false,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const dispatch = useDispatch<AppDispatch>();
  const { vehicleInvolved, accidentTypes, loading, error } = useSelector((state: RootState) => state.dropdown);

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
    setFilters({});
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
          label="From Date"
          value={filters.startDate}
          onChange={date => handleFilterChange('startDate', date.toISOString().split('T')[0])}
          disabled={disableDateRange}
        />
        <DatePickerField
          label="To Date"
          value={filters.endDate}
          onChange={date => handleFilterChange('endDate', date.toISOString().split('T')[0])}
          disabled={disableDateRange}
        />
      </View>
      )}
      {showSeverity && (
      <GenericDropDownMenu
            data={FILTER_SEVERITY || []}
            valueField="id"
            labelField="label"
            placeholder="Select Severity"
            value={filters.severity}
            disabled={loading || disableSeverity || !FILTER_SEVERITY?.length}
            onItemSelect={(item: DropdownItem | null) => handleFilterChange('severity', item?.id)}
          />
      )}

      {(filters.vehicleType || filters.accidentType || filters.startDate || filters.endDate || filters.severity) && (
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
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

export default FilterPanel;