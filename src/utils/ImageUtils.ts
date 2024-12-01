
import RNFS from 'react-native-fs';
import {Alert} from 'react-native';

/**
 * Reads the image file as base64
 * @param {string} imageUri - The URI of the image file
 * @returns {Promise<string | null>} - Returns base64 string of image data
 */
export const readImageFileAsBase64 = async (
  imageUri: string,
): Promise<string | null> => {
  try {
    return await RNFS.readFile(imageUri, 'base64');
  } catch (error) {
    console.error('Error reading image file:', error);
    Alert.alert('Error', 'Unable to read image file.');
    return null;
  }
};
 
export const handleImageConversion = async (imageUri: string) => {
  const imageBase64 = await readImageFileAsBase64(imageUri);
  if (imageBase64) {
    return imageBase64;
    // You can now send this to the backend
  }
  return null;
};
