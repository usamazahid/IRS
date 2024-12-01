import axios from 'axios';
import {API_BASE_URL} from '@env';

const apiURL = API_BASE_URL;

export const submitAccidentReport = async (reportData: any) => {
  try {
    const path = `${apiURL}/irs/saveReportData`;
    const response = await axios.post(path, reportData, {
      headers: {
        Accept: 'application/json',
        // 'Content-Type': 'multipart/form-data',// Use this for handling files (images, audio)
        'Content-Type': 'application/json'
      },
    });
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
