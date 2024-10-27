import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import * as Progress from 'react-native-progress';

interface AudioRecorderProps {
  expiryTime?: number; // Optional time limit in milliseconds (default 1 min)
  onRecordingComplete: (audioPath: string | null) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ expiryTime = 60000, onRecordingComplete }) => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request audio permissions
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          // Android 13 and above, request RECORD_AUDIO only
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For Android below 13, request additional permissions
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          ]);

          return (
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
          );
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // For iOS or other platforms
    return true;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRecorderPlayer.current?.stopRecorder();
      audioRecorderPlayer.current?.removeRecordBackListener();
      clearInterval(timerRef.current!); // Ensure interval cleanup
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permissions Required', 'You need to grant permissions to record audio.');
      return;
    }

    try {
      setRecording(true);
      setPaused(false);
      setElapsedTime(0);
      setCurrentTime('00:00');
      setProgress(0);

      const audioPath = await audioRecorderPlayer.current.startRecorder();
      console.log('Recording started at:', audioPath);

      // Update elapsed time and progress
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1000;
          const newProgress = newTime / expiryTime;
          setProgress(newProgress);

          // Stop recording when expiry time is reached
          if (newTime >= expiryTime) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      // Set recording time
      audioRecorderPlayer.current.addRecordBackListener((e) => {
        setCurrentTime(audioRecorderPlayer.current.mmss(Math.floor(e.currentPosition)));
      });
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to start recording');
      setRecording(false);
    }
  };

  // Pause recording
  const pauseRecording = async () => {
    try {
      await audioRecorderPlayer.current.pauseRecorder();
      setPaused(true);
      clearInterval(timerRef.current!);
    } catch (error) {
      Alert.alert('Pause Error', 'Failed to pause recording');
    }
  };

  // Resume recording
  const resumeRecording = async () => {
    try {
      await audioRecorderPlayer.current.resumeRecorder();
      setPaused(false);

      // Restart the timer after resuming
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1000;
          const newProgress = newTime / expiryTime;
          setProgress(newProgress);

          if (newTime >= expiryTime) stopRecording();
          return newTime;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Resume Error', 'Failed to resume recording');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;

    try {
      const result = await audioRecorderPlayer.current.stopRecorder();
      setRecording(false);
      setPaused(false);
      setCurrentTime('00:00');
      setProgress(0);
      clearInterval(timerRef.current!); // Clear timer when stopped
      onRecordingComplete(result);
    } catch (error) {
      Alert.alert('Stop Error', 'Failed to stop recording');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>Recording: {currentTime}</Text>
      {recording && (
        <View style={styles.progressContainer}>
          <Progress.Bar progress={progress} width={200} />
          <Text style={styles.elapsedTimeText}>{currentTime}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        onPress={recording ? (paused ? resumeRecording : pauseRecording) : startRecording}
        style={[styles.button, recording ? styles.pauseButton : styles.startButton]}>
        <Text style={styles.buttonText}>
          {recording ? (paused ? 'Resume Recording' : 'Pause Recording') : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      
      {recording && (
        <TouchableOpacity onPress={stopRecording} style={[styles.button, styles.stopButton]}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  timerText: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  elapsedTimeText: { marginLeft: 10, fontWeight: 'bold' },
  button: { padding: 10, borderRadius: 5, marginVertical: 10 },
  startButton: { backgroundColor: 'green' },
  pauseButton: { backgroundColor: 'orange' },
  stopButton: { backgroundColor: 'red' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default AudioRecorder;
