import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface DatePickerFieldProps {
  label?: string;
  value?: string;                     // ISO‑date string, e.g. "2025-05-08"
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

  const displayValue = value
    ? new Date(value).toLocaleDateString()
    : placeholder;

  const openPicker = () => {
    if (!disabled) {setIsVisible(true);}
  };

  const handleConfirm = (date: Date) => {
    setIsVisible(false);
    onChange(date);
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
          {displayValue}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8, flex: 1 },
  label: { fontSize: 14, marginBottom: 4, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  inputDisabled: { backgroundColor: '#f2f2f2' },
  text: { fontSize: 16, color: '#000' },
  placeholderText: { color: '#888' },
});

export default DatePickerField;