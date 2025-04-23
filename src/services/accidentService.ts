import axios from 'axios';
import {API_BASE_URL} from '@env';

const apiURL = API_BASE_URL;

export const submitAccidentReport = async (reportData: any) => {
  try {
    const path = `${apiURL}/irs/saveReportData`;
    console.log('🛠️ API_BASE_URL →', apiURL);
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

export const getReportData = async (userId: string) => {
  try {
    // Construct the URL with query parameters
    const path = `${apiURL}/irs/getJoinedReportByUserId/${userId}`;
    
    // Send GET request to the API
    const response = await axios.get(path, {
      headers: {
        Accept: 'application/json',
      },
    });

    // Return the response data
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


export const getHeatMapData = async (range: string) => {
  try {
    // Construct the API URL
    const path = `${apiURL}/irs/heatmap/${range}`;

    // Send GET request to the API
    const response = await axios.get(path, {
      headers: { Accept: 'application/json' },
      timeout: 10000, // Timeout after 10 seconds
    });

    return response.data; // Return response data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response Error:', error.response.data);
        console.error('Status Code:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request Error:', error.request);
      }
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};
