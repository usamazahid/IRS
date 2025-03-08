import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const GenericDropDownMenu = ({ data, valueField, labelField, placeholder, onItemSelect }) => {
  const [selectedValue, setSelectedValue] = useState(null);

  const handleSelect = (item) => {
    setSelectedValue(item[valueField]);
    onItemSelect && onItemSelect(item);
  };


  return (
    <SafeAreaView>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.textStyle}
        iconStyle={styles.iconStyle}
        data={data} // Use the data (either passed as prop or fetched from API)
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

export default GenericDropDownMenu;
