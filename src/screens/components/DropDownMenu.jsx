import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SelectCountry } from 'react-native-element-dropdown';

const GenericDropdown = ({ dataUrl, valueField, labelField,value: propValue, imageField, placeholder, onItemSelect,dropDownData, disabled = false }) => {
  const [data, setData] = useState(dropDownData || []);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Handle initial value and prop updates
  useEffect(() => {
    if (propValue !== undefined && data.length > 0) {
      const exists = data.some(item => item[valueField] === propValue);
      if (exists) setSelectedValue(propValue);
    }
  }, [propValue, data, valueField]);

 useEffect(() => {
  if (dropDownData) {
     const clonedData = dropDownData.map(item => ({ ...item }));
    setData(clonedData);
    setLoading(false); // Immediately stop loading as data is provided
  }else if(dataUrl){

      const fetchData = async () => {
        try {
          setLoading(true); // Ensure loading is true during fetch
          const response = await fetch(dataUrl);

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const jsonData = await response.json();

          const processedData = jsonData.map((item) => ({
            ...item,
            image_uri: item.image_uri || 'https://via.placeholder.com/150', // Add fallback image
          }));

          setData(processedData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
  }
  
}, [dataUrl, dropDownData]);

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
    <SafeAreaView style={styles.dropdownContainer}>
      <SelectCountry
        style={styles.dropdown}
        selectedTextStyle={styles.selectedTextStyle}
        placeholderStyle={styles.placeholderStyle}
        imageStyle={styles.imageStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        maxHeight={200}
        value={selectedValue}
        data={data}
        valueField={valueField}
        labelField={labelField}
        imageField={imageField}
        placeholder={placeholder}
        searchPlaceholder="Search..."
        onChange={handleSelect}
         disable={disabled}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  dropdown: {
    margin: 16,
    height: 50,
    width: '90%',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    backgroundColor: '#fff',
  },
  imageStyle: {
    width: 24,
    height: 24,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#000',
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8,
    color: '#000',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default GenericDropdown;
