import axios from 'axios';
import {API_BASE_URL} from '@env';

const apiURL = API_BASE_URL;

export const getDropDownData = async (urlPath: String) => {
  try {
    const dataUrl = `${apiURL}/irs/${urlPath}`;
    // Send GET request to the API
    const response = await axios.get(dataUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.data) {
      console.log('Data Issue');
      throw new Error('Data issue');
    }
  
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Response Error:', error.response.data);
      console.error('Status Code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};
