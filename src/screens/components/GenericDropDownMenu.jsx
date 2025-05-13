import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const GenericDropDownMenu = ({
  data,
  valueField,
  labelField,
  placeholder,
  onItemSelect,
  value: propValue,      // For pre-filled values
  disabled = false,      // Disable interaction
  disabledStyles = {},   // Custom disabled styling
  searchable = true,     // Enable/disable search
}) => {
  const [selectedValue, setSelectedValue] = useState(null);
  const [safeData, setSafeData] = useState([]);

  // Clone data to prevent state mutation
  useEffect(() => {
    if (data) {
      const clonedData = data.map(item => ({ ...item }));
      setSafeData(clonedData);
    }
  }, [data]);

  // Set initial value when prop or data changes
  useEffect(() => {
    if (propValue === undefined) {
      setSelectedValue(null);
    } else if (safeData.length > 0) {
      const initialItem = safeData.find(item => item[valueField] === propValue);
      if (initialItem) {
        setSelectedValue(initialItem[valueField]);
      }
    }
  }, [propValue, safeData, valueField]);

  const handleSelect = (item) => {
    if (!disabled) {
      setSelectedValue(item[valueField]);
      onItemSelect?.(item);
    }
  };

  // Merge default disabled styles with custom ones
  const mergedDisabledStyles = {
    ...styles.disabledDropdown,
    ...disabledStyles,
  };

  return (
    <SafeAreaView>
      <Dropdown
        style={[
          styles.dropdown,
          disabled && mergedDisabledStyles,
        ]}
        placeholderStyle={[
          styles.placeholderStyle,
          disabled && styles.disabledText,
        ]}
        selectedTextStyle={[
          styles.selectedTextStyle,
          disabled && styles.disabledText,
        ]}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.textStyle}
        iconStyle={styles.iconStyle}
        data={safeData}
        search={searchable && !disabled}
        maxHeight={300}
        labelField={labelField}
        valueField={valueField}
        placeholder={placeholder}
        value={selectedValue}
        onChange={handleSelect}
        disable={disabled}
        flatListProps={{
          scrollEnabled: !disabled,
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
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
    borderBottomColor: '#d3d3d3',
  },
  disabledText: {
    color: '#a0a0a0',
  },
  textStyle: {
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
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
});

export default GenericDropDownMenu;
