// services/ApiService.ts
import {Alert} from 'react-native';

const API_BASE_URL = 'https://your-backend-endpoint';

export const uploadAudioToBackend = async (
  audioData: string,
  fileName: string,
) => {
  try {
    const formData = new FormData();
    formData.append('audio', {
      name: fileName,
      type: 'audio/mpeg',
      uri: `file://${fileName}`,
      data: audioData,
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.ok) {
      Alert.alert('Success', 'Audio file uploaded successfully!');
    } else {
      Alert.alert('Error', 'Failed to upload audio file.');
    }
  } catch (error) {
    console.error('Error uploading audio:', error);
    Alert.alert('Error', 'An error occurred while uploading the audio file.');
  }
};
