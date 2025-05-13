import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface DatePickerFieldProps {
  label?: string;
  value?: string;                     // ISO date string
  onChange: (date: Date) => void;
  disabled?: boolean;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getDisplayValue = () => {
    if (!value) { return placeholder; }
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openPicker = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleConfirm = (date: Date) => {
    setIsVisible(false);
    // Normalize the date to start of day in local timezone
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    onChange(normalized);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, disabled && styles.inputDisabled]}
        onPress={openPicker}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text style={[styles.text, !value && styles.placeholderText]}>
          {getDisplayValue()}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        date={value ? new Date(value) : new Date()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 45,
    justifyContent: 'center',
  },
  inputDisabled: {
    backgroundColor: '#f2f2f2',
    borderColor: '#ddd',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    color: '#888',
  },
});

export default DatePickerField;
