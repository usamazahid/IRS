import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import EvidenceToggle from './EvidenceToggle'; // Make sure this component is imported
import GenericDropDownMenu from './GenericDropDownMenu';
const FollowUpActions = ({onChange, dropDownData, disabled = false, editable = true, initialValues}) => {
  // State initialization with initial values
  const [formState, setFormState] = useState({
    firRegistered: false,
    firNumber: '',
    challanIssued: false,
    challanNumber: '',
    caseReferredTo: ''
  });

  // Single useEffect for initial values and updates
  useEffect(() => {
    if (initialValues) {
      setFormState(prev => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues]); // Only re-run when initialValues reference changes

  // Memoized update handler
  const handleUpdate = useCallback((newState) => {
    setFormState(prev => {
      const updatedState = {...prev, ...newState};
      onChange(updatedState);
      return updatedState;
    });
  }, [onChange]);

  const handleCaseReferral = useCallback(selected => {
    if (!disabled) {
      handleUpdate({caseReferredTo: selected?.id || ''});
    }
  }, [disabled, handleUpdate]);

  // Create a safe copy of dropdown data
  const safeDropDownData = dropDownData?.map(item => ({...item})) || [];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>FOLLOW-UP ACTIONS</Text>

      {/* FIR Registration */}
      <View style={styles.fieldGroup}>
        <View style={styles.toggleRow}>
          <EvidenceToggle
            label="FIR Registered?"
            value={formState.firRegistered}
            disabled={disabled}
            onValueChange={value => handleUpdate({
              firRegistered: value,
              firNumber: value ? formState.firNumber : ''
            })}
          />
        </View>
        {formState.firRegistered && (
          <TextInput
            style={styles.input}
            placeholder="FIR Number"
            placeholderTextColor="#7f8c8d"
            value={formState.firNumber}
            editable={editable}
            onChangeText={text => handleUpdate({firNumber: text})}
          />
        )}
      </View>

      {/* Challan Issued */}
      <View style={styles.fieldGroup}>
        <View style={styles.toggleRow}>
          <EvidenceToggle
            label="Challan Issued?"
            value={formState.challanIssued}
            disabled={disabled}
            onValueChange={value => handleUpdate({
              challanIssued: value,
              challanNumber: value ? formState.challanNumber : ''
            })}
          />
        </View>
        {formState.challanIssued && (
          <TextInput
            style={styles.input}
            placeholder="Challan Number"
            placeholderTextColor="#7f8c8d"
            value={formState.challanNumber}
            editable={editable}
            onChangeText={text => handleUpdate({challanNumber: text})}
          />
        )}
      </View>

      {/* Case Referral */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Case Referred To:</Text>
        <GenericDropDownMenu
          className="bg-slate-200"
          data={safeDropDownData}
          valueField="id"
          labelField="unit"
          placeholder="Select Case Referred"
          disabled={disabled}
          value={formState.caseReferredTo}
          onItemSelect={handleCaseReferral}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#34495e',
  },
  input: {
    color:'black',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
  },
  checkboxStyle: {
    marginVertical: 4,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

export default FollowUpActions;
