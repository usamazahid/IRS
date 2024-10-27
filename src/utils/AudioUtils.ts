// utils/AudioUtils.ts
import RNFS from 'react-native-fs';
import {Alert} from 'react-native';

/**
 * Reads the audio file as base64
 * @param {string} path - The path to the audio file
 * @returns {Promise<string | null>} - Returns base64 string of audio data
 */
export const readAudioFileAsBase64 = async (
  path: string,
): Promise<string | null> => {
  try {
    return await RNFS.readFile(path, 'base64');
  } catch (error) {
    console.error('Error reading audio file:', error);
    Alert.alert('Error', 'Unable to read audio file.');
    return null;
  }
};
