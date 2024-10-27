import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

interface AudioPlayerProps {
  audioPath: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioPath }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());

  useEffect(() => {
    return () => {
      // Clean up when the component unmounts
      audioRecorderPlayer.current.stopPlayer();
      audioRecorderPlayer.current.removePlayBackListener();
    };
  }, []);

  const startPlaying = async () => {
    try {
      await audioRecorderPlayer.current.startPlayer(audioPath);
      setIsPlaying(true);
      console.log('Playback started');
    } catch (error) {
      Alert.alert('Playback Error', 'Failed to start playback');
    }
  };

  const stopPlaying = async () => {
    try {
      await audioRecorderPlayer.current.stopPlayer();
      setIsPlaying(false);
      console.log('Playback stopped');
    } catch (error) {
      Alert.alert('Stop Error', 'Failed to stop playback');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={isPlaying ? stopPlaying : startPlaying} style={styles.playButton}>
        <Text style={styles.buttonText}>{isPlaying ? 'Stop Playback' : 'Play Recording'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  playButton: { backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default AudioPlayer;
