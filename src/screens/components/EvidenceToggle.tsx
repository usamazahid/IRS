import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface EvidenceToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const EvidenceToggle: React.FC<EvidenceToggleProps> = ({
  label,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    marginRight: 8,
    fontSize: 16,
    color: '#333',
  },
});

export default EvidenceToggle;