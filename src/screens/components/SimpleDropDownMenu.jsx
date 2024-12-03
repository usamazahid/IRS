import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const SimpleDropDownMenu = ({ dataUrl, data, valueField, labelField, placeholder, onItemSelect }) => {
  const [dropdownData, setDropdownData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use passed data or fetch from API
  useEffect(() => {
    if (data) {
      setDropdownData(data); // Use passed data directly
      setLoading(false);
    } else if (dataUrl) {
      const fetchData = async () => {
        try {
          const response = await fetch(dataUrl);

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const jsonData = await response.json();
          setDropdownData(jsonData);
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
    setSelectedValue(item[valueField]);
    onItemSelect && onItemSelect(item);
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
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.textStyle}
        iconStyle={styles.iconStyle}
        data={dropdownData} // Use the data (either passed as prop or fetched from API)
        search
        maxHeight={300}
        labelField={labelField}
        valueField={valueField}
        placeholder={placeholder}
        value={selectedValue}
        onChange={handleSelect}
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
  textStyle: {
    color: 'black', // Text color inside the dropdown
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'black', // Placeholder text color
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black', // Selected text color
  },
  inputSearchStyle: {
    height: 40,
    color: 'black',
    fontSize: 16,
  },
});

export default SimpleDropDownMenu;
