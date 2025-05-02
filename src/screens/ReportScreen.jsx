// src/screens/ConfirmationScreen.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import CustomButton from './components/CustomButton';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';
import AccidentHeatmap from './components/AccidentHeatmap';
import AccidentClustering from './components/AccidentClustering';

const ReportScreen = () => {
  const [isHeatmap, setIsHeatmap] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => NavigationService.goBack()}>
          <ArrowLeftIcon size={20} color="black" />
        </TouchableOpacity>
      </View>
      <TopBar />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Report Screen</Text>

        {/* Toggle Buttons for Heatmap and Clustering */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isHeatmap ? styles.activeButton : styles.inactiveButton]}
            onPress={() => setIsHeatmap(true)}
          >
            <Text style={isHeatmap ? styles.activeText : styles.inactiveText}>Heatmap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isHeatmap ? styles.activeButton : styles.inactiveButton]}
            onPress={() => setIsHeatmap(false)}
          >
            <Text style={!isHeatmap ? styles.activeText : styles.inactiveText}>Clustering</Text>
          </TouchableOpacity>
        </View>

        {/* Render Heatmap or Clustering based on toggle state */}
        {isHeatmap ? <AccidentHeatmap limit="100" /> : <AccidentClustering limit="100" />}

        <CustomButton
          onPress={() => NavigationService.navigate('Home')}
          title="Back"
          color="transparent"
          textColor="blue"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'gray',
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'blue',
  },
  inactiveButton: {
    backgroundColor: 'lightgray',
  },
  activeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: 'black',
  },
});

export default ReportScreen;
