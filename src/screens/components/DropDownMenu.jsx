import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SelectCountry } from 'react-native-element-dropdown';

const GenericDropdown = ({ dataUrl, valueField, labelField, imageField, placeholder, onItemSelect }) => {
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const jsonData = await response.json();

        const processedData = jsonData.map((item) => ({
          ...item,
          image_uri: item.image_uri || 'https://via.placeholder.com/150', // Add fallback image
        }));

        console.log('Processed Data:', JSON.stringify(processedData, null, 2));
        setData(processedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl]);

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
        imageField="image"
        placeholder={placeholder}
        searchPlaceholder="Search..."
        onChange={handleSelect}
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
