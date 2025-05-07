import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchReportDropdowns } from '../../redux/slices/dropdownSlice';
import GenericDropDownMenu from './GenericDropDownMenu';

interface FilterOptions {
  vehicleType?: string;
  accidentType?: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
}

interface DropdownItem {
  id: string;
  label: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const dispatch = useDispatch<AppDispatch>();
  const { vehicleInvolved, accidentTypes, loading, error } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    // Only fetch if data is not already loaded and not currently loading
    if (!loading && !error && (!vehicleInvolved?.length || !accidentTypes?.length)) {
      dispatch(fetchReportDropdowns());
    }
  }, [dispatch, loading, error, vehicleInvolved?.length, accidentTypes?.length]);

  const handleFilterChange = (type: keyof FilterOptions, value: string | null) => {
    const newFilters = {
      ...filters,
      [type]: value || undefined
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.pickerContainer}>
          <GenericDropDownMenu
            data={vehicleInvolved || []}
            valueField="id"
            labelField="label"
            placeholder="Select Vehicle Type"
            value={filters.vehicleType}
            disabled={loading || !vehicleInvolved?.length}
            onItemSelect={(value: DropdownItem | null) => handleFilterChange('vehicleType', value?.id || null)}
          />
        </View>

        <View style={styles.pickerContainer}>
          <GenericDropDownMenu
            data={accidentTypes || []}
            valueField="id"
            labelField="label"
            placeholder="Select Accident Type"
            value={filters.accidentType}
            disabled={loading || !accidentTypes?.length}
            onItemSelect={(value: DropdownItem | null) => handleFilterChange('accidentType', value?.id || null)}
          />
        </View>
      </View>
      
      {(filters.vehicleType || filters.accidentType) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerContainer: {
    flex: 1,
  },
  clearButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default FilterPanel; 