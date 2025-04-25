import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import * as Progress from 'react-native-progress';

/**
 * Props:
 *  - expiryTime: optional time limit in ms
 *  - onRecordingComplete: callback with recorded file path
 *  - disabled: when true, recording cannot be started or paused/resumed/stopped
 */
interface AudioRecorderProps {
  expiryTime?: number;
  onRecordingComplete: (audioPath: string | null) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ expiryTime = 60000, onRecordingComplete, disabled = false }) => {
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
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
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
    return true;
  };

  useEffect(() => {
    return () => {
      audioRecorderPlayer.current?.stopRecorder();
      audioRecorderPlayer.current?.removeRecordBackListener();
      if (timerRef.current) {clearInterval(timerRef.current);}
    };
  }, []);

  const startRecording = async () => {
    if (disabled) {return;}                 // <-- respect disabled flag
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

      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1000;
          setProgress(newTime / expiryTime);
          if (newTime >= expiryTime) {stopRecording();}
          return newTime;
        });
      }, 1000);

      audioRecorderPlayer.current.addRecordBackListener((e) => {
        setCurrentTime(audioRecorderPlayer.current.mmss(Math.floor(e.currentPosition)));
      });
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to start recording');
      setRecording(false);
    }
  };

  const pauseRecording = async () => {
    if (disabled) {return;}
    try {
      await audioRecorderPlayer.current.pauseRecorder();
      setPaused(true);
      if (timerRef.current) {clearInterval(timerRef.current)};
    } catch (error) {
      Alert.alert('Pause Error', 'Failed to pause recording');
    }
  };

  const resumeRecording = async () => {
    if (disabled) {return;}
    try {
      await audioRecorderPlayer.current.resumeRecorder();
      setPaused(false);
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1000;
          setProgress(newTime / expiryTime);
          if (newTime >= expiryTime) stopRecording();
          return newTime;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Resume Error', 'Failed to resume recording');
    }
  };

  const stopRecording = async () => {
    if (disabled || !recording) {return;}
    try {
      const result = await audioRecorderPlayer.current.stopRecorder();
      setRecording(false);
      setPaused(false);
      setCurrentTime('00:00');
      setProgress(0);
      if (timerRef.current) {clearInterval(timerRef.current)};
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
        style={[
          styles.button,
          recording ? styles.pauseButton : styles.startButton,
          disabled && styles.disabledButton  // <-- disabled style
        ]}
        disabled={disabled}                  // <-- disable touch
      >
        <Text style={styles.buttonText}>
          {disabled
            ? 'Recording Disabled'
            : recording
            ? paused
              ? 'Resume Recording'
              : 'Pause Recording'
            : 'Start Recording'}
        </Text>
      </TouchableOpacity>

      {recording && (
        <TouchableOpacity
          onPress={stopRecording}
          style={[styles.button, styles.stopButton, disabled && styles.disabledButton]}
          disabled={disabled}
        >
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
  disabledButton: { opacity: 0.5 }, // visually indicate disabled
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default AudioRecorder;