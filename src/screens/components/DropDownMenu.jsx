import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, ActivityIndicator, View, Image, TouchableOpacity } from 'react-native';
import { SelectCountry } from 'react-native-element-dropdown'; // Update to your dropdown component

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
        setData(jsonData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl]);

  useEffect(() => {
    if (data.length > 0 && selectedValue) {
      const selectedItem = data.find(d => d[valueField] === selectedValue);
      if (selectedItem && onItemSelect) {
        onItemSelect(selectedItem);
      }
    }
  }, [selectedValue, data, onItemSelect]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center pt-4 mb-4">
      <SelectCountry
        className="m-4 h-12 p-2 w-full bg-white"
        selectedTextStyle="text-base ml-2"
        placeholderStyle="text-base"
        imageStyle="w-6 h-6 rounded-full"
        iconStyle="w-5 h-5"
        maxHeight={200}
        value={selectedValue}
        data={data}
        valueField={valueField}
        labelField={labelField}
        imageField={imageField}
        placeholder={placeholder}
        searchPlaceholder="Search..."
        onChange={e => {
          setSelectedValue(e[valueField]);
        }}
      />
    </SafeAreaView>
  );
};

export default GenericDropdown;
