import React,{useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import TextBox from './TextBox';
import {PlusCircleIcon, XMarkIcon} from 'react-native-heroicons/solid';
import GenericDropDownMenu from './GenericDropDownMenu';
import EvidenceToggle from './EvidenceToggle';
import DateTimePicker from '@react-native-community/datetimepicker';

const DynamicFormSection = ({title, items=[], fields, onAdd, onUpdate,onRemove,disabled = false,editable=true,maxItems = 10}) => {
    const [showDatePicker, setShowDatePicker] = useState(null);

    const handleDateChange = (event, selectedDate, index, fieldKey) => {
      setShowDatePicker(null);
      if (selectedDate) {
        onUpdate(index, fieldKey, selectedDate.toISOString().split('T')[0]);
      }
    };
    const safeItems = Array.isArray(items) ? items : [];
     const canAdd = safeItems.length < maxItems && editable && !disabled;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={onAdd}
          style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
          disabled={!canAdd}
        >
          <PlusCircleIcon size={24} color={canAdd ? '#3b82f6' : '#ccc'} />
        </TouchableOpacity>
      </View>

      {safeItems.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>Entry {index + 1}</Text>
            <TouchableOpacity
              onPress={() => onRemove(index)}
              style={styles.deleteButton}
              disabled={disabled}>
              <XMarkIcon size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
          {fields.map(field => (
            <View key={field.key} style={styles.fieldContainer}>
              {field.type === 'dropdown' ? (
                <GenericDropDownMenu
                  data={field.data}
                  valueField="id"
                  labelField={field.labelField}
                  imageField="image"
                  placeholder={field.label}
                  value={item[field.key]}
                  disabled={disabled}
                  onItemSelect={selected =>
                    onUpdate(
                      index,
                      field.key,
                      selected[field.valueField || field.labelField || 'id'],
                    )
                  }
                />
              ) : field.type === 'toggle' ? (
                <EvidenceToggle
                label={field.label}
                value={item[field.key]}
                disabled={!editable}
                onValueChange={selected =>
                  onUpdate(
                    index,
                    field.key,
                    selected
                  )
                }
              />
              ): field.type === 'date' ? (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker({index, key: field.key})}
                    >
                    <TextBox
                      style={styles.input}
                      label={field.label}
                      value={item[field.key]}
                      editable={false}
                      placeholder="Select Date"
                    />
                  </TouchableOpacity>
                  {showDatePicker &&
                    showDatePicker.index === index &&
                    showDatePicker.key === field.key && (
                      <DateTimePicker
                        value={
                          item[field.key]
                            ? new Date(item[field.key])
                            : new Date()
                        }
                        mode="date"
                        display="default"
                        onChange={(event, date) =>
                          handleDateChange(event, date, index, field.key)
                        }
                      />
                    )}
                </>
              ) : (
                <TextBox
                  style={styles.input}
                  label={field.label}
                  value={item[field.key]}
                  onChangeText={text => onUpdate(index, field.key, text)}
                  editable={editable}
                />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  addButton: {
    padding: 4,
  },
  itemContainer: {
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
  },
  fieldContainer: {
    marginVertical: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  itemNumber: {
    color: '#475569',
    fontWeight: '500',
  },
  input: {
    color:'black',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
  },
  addButtonDisabled: { opacity: 0.5 },
});

export default DynamicFormSection;
