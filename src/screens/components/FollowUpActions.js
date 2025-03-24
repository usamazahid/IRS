import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import EvidenceToggle from './EvidenceToggle'; // Make sure this component is imported
import GenericDropDownMenu from './GenericDropDownMenu';

const FollowUpActions = ({onChange,dropDownData}) => {
  const [firRegistered, setFirRegistered] = useState(false);
  const [firNumber, setFirNumber] = useState('');
  const [challanIssued, setChallanIssued] = useState(false);
  const [challanNumber, setChallanNumber] = useState('');
  const [caseReferredTo, setCaseReferredTo] = useState('');

  // Create a safe copy of dropdown data to prevent mutations
  const safeDropDownData = dropDownData?.map(item => ({...item})) || [];


  const handleCaseReferral = selected => {
    // Use Object.assign to create new object reference
    const selectedValue = selected ? {...selected} : null;
    setCaseReferredTo(selectedValue?.unit || '');
    handleUpdate();
  };

  const handleUpdate = () => {
    onChange({
      firRegistered,
      firNumber,
      challanIssued,
      challanNumber,
      caseReferredTo,
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>FOLLOW-UP ACTIONS</Text>

      {/* FIR Registration */}
      <View style={styles.fieldGroup}>
        <View style={styles.toggleRow}>
          <EvidenceToggle
            label="FIR Registered?"
            value={firRegistered}
            onValueChange={value => {
              setFirRegistered(value);
              if (!value) setFirNumber(''); // Clear FIR number when toggled off
              handleUpdate();
            }}
          />
        </View>
        {firRegistered && (
          <TextInput
            style={styles.input}
            placeholder="FIR Number"
            placeholderTextColor="#7f8c8d" // 🔹 Set a visible placeholder color (light gray)
            value={firNumber}
            onChangeText={text => {
              setFirNumber(text);
              handleUpdate();
            }}
          />
        )}
      </View>

      {/* Challan Issued */}
      <View style={styles.fieldGroup}>
        <View style={styles.toggleRow}>
          <EvidenceToggle
            label="Challan Issued?"
            value={challanIssued}
            onValueChange={value => {
              setChallanIssued(value);
              if (!value) setChallanNumber(''); // Clear Challan number when toggled off
              handleUpdate();
            }}
          />
        </View>
        {challanIssued && (
          <TextInput
            style={styles.input}
            placeholder="Challan Number"
            placeholderTextColor="#7f8c8d" // 🔹 Set a visible placeholder color (light gray)
            value={challanNumber}
            onChangeText={text => {
              setChallanNumber(text);
              handleUpdate();
            }}
          />
        )}
      </View>

      {/* Case Referral */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Case Referred To:</Text>
        <GenericDropDownMenu
          data={safeDropDownData} // Use copied data
          valueField="id"
          labelField="unit"
          placeholder="Select Case Referred"
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
