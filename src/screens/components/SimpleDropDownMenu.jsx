import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const SimpleDropDownMenu = ({
  dataUrl,
  data,
  valueField,
  labelField,
  placeholder,
  onItemSelect,
  value: propValue,       // Pre-filled value from parent
  disabled = false,      // Disabled flag from parent
  disabledStyles = {}    // Custom disabled styles
}) => {
  const [dropdownData, setDropdownData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle initial value and data updates
  useEffect(() => {
    if (propValue && dropdownData.length > 0) {
      const initialItem = dropdownData.find(item => item[valueField] === propValue);
      if (initialItem) {
        setSelectedValue(initialItem[valueField]);
      }
    }
  }, [propValue, dropdownData, valueField]);

  // Data loading with clone protection
  useEffect(() => {
    const processData = (rawData) => {
      // Clone data to prevent state mutation
      return rawData ? rawData.map(item => ({ ...item })) : [];
    };

    if (data) {
      setDropdownData(processData(data));
      setLoading(false);
    } else if (dataUrl) {
      const fetchData = async () => {
        try {
          const response = await fetch(dataUrl);
          if (!response.ok) throw new Error('Network response was not ok');
          setDropdownData(processData(await response.json()));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [data, dataUrl]);

  const handleSelect = (item) => {
    if (!disabled) {
      setSelectedValue(item[valueField]);
      onItemSelect?.(item);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <Dropdown
        style={[
          styles.dropdown,
          disabled && styles.disabledDropdown,
          disabledStyles
        ]}
        placeholderStyle={[
          styles.placeholderStyle,
          disabled && styles.disabledText
        ]}
        selectedTextStyle={[
          styles.selectedTextStyle,
          disabled && styles.disabledText
        ]}
        itemTextStyle={[
          styles.textStyle,
          disabled && styles.disabledText
        ]}
        data={dropdownData}
        search
        maxHeight={300}
        labelField={labelField}
        valueField={valueField}
        placeholder={placeholder}
        value={selectedValue}
        onChange={handleSelect}
        disable={disabled}
        flatListProps={{
          scrollEnabled: !disabled
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  disabledDropdown: {
    borderBottomColor: '#d3d3d3',
    opacity: 0.7
  },
  textStyle: {
    color: 'black',
  },
  disabledText: {
    color: '#a0a0a0',
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'black',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  inputSearchStyle: {
    height: 40,
    color: 'black',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default SimpleDropDownMenu;