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
        'Content-Type': 'application/json',
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

export const getReportData = async (userId: string,pageNumber: number,recordsPerPage: number) => {
  try {
    // Construct the URL with query parameters
    const path = `${apiURL}/irs/getJoinedReportByUserId/${userId}?pageNumber=${pageNumber}&recordsPerPage=${recordsPerPage}`;

    // Send GET request to the API
    const response = await axios.get(path, {
      headers: {
        Accept: 'application/json',
      },
    });
    console.log('Response length:', response.data.reports.length);
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


export const getHeatMapData = async (limit: string) => {
  try {
    // Construct the API URL with limit query parameter
    const path = `${apiURL}/irs/heatmap?limit=${limit}`;

    // Send GET request to the API
    const response = await axios.get(path, {
      headers: { Accept: 'application/json' },
      timeout: 10000, // Timeout after 10 seconds
    });
    console.log('Heatmap data:', response.data.length);
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

export const getClusteringData = async (limit: string) => {
  try {
    // Construct the API URL with limit query parameter
    const path = `${apiURL}/irs/getClusteredAccidentsDBSCAN?limit=${limit}`;

    // Send GET request to the API
    const response = await axios.get(path, {
      headers: { Accept: 'application/json' },
      timeout: 10000, // Timeout after 10 seconds
    });
    console.log('Clustering data:', response.data.length);
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

export const getFilteredHeatMapData = async (limit: number, vehicleType?: string, accidentType?: string) => {
  try {
    // Construct the API URL with query parameters
    const path = `${apiURL}/irs/heatmap?limit=${limit}${vehicleType ? `&vehicleType=${vehicleType}` : ''}${accidentType ? `&accidentType=${accidentType}` : ''}`;
    console.log('🌍 Filtered Heatmap URL:', path);

    // Send GET request to the API
    const response = await axios.get(path, {
      headers: { Accept: 'application/json' },
      timeout: 10000, // Timeout after 10 seconds
    });
    console.log('Filtered Heatmap data:', response.data.length);
    return response.data;
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

export const getFilteredClusteringData = async (limit: number, vehicleType?: string, accidentType?: string,range?: string,) => {
  try {
    // Construct the API URL with query parameters
    const path = `${apiURL}/irs/getClusteredAccidentsDBSCAN?limit=${limit}${vehicleType ? `&vehicleType=${vehicleType}` : ''}${accidentType ? `&accidentType=${accidentType}` : ''}${range ? `&range=${range}&` : ''}`;
    console.log('🗺️ Filtered Clustering URL:', path);

    // Send GET request to the API
    const response = await axios.get(path, {
      headers: { Accept: 'application/json' },
      timeout: 10000, // Timeout after 10 seconds
    });
    console.log('Filtered Clustering data:', response.data.length);
    return response.data;
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



interface BBox { swLat: number; swLng: number; neLat: number; neLng: number; }

export const getFilteredHeatMapDataWithBBox = async (
  limit: number,
  vehicleType?: string,
  accidentType?: string,
  startDate?: string,
  endDate?: string,
  severity?: string,
  bbox?: BBox
) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (vehicleType) {params.append('vehicleType', vehicleType);}
  if (accidentType) {params.append('accidentType', accidentType);}
  if (startDate) {params.append('startDate', startDate);}
  if (endDate) {params.append('endDate', endDate);}
  if (severity) {params.append('severity', severity);}
  if (bbox) {
    params.append('swLat', String(bbox.swLat));
    params.append('swLng', String(bbox.swLng));
    params.append('neLat', String(bbox.neLat));
    params.append('neLng', String(bbox.neLng));
  }

  const path = `${apiURL}/irs/heatmap?${params.toString()}`;
  const response = await axios.get(path, { headers: { Accept: 'application/json' } });
  return response.data;
};

export const getFilteredClusteringDataWithBBox = async (
  limit: number,
  vehicleType?: string,
  accidentType?: string,
  range?: string,
  startDate?: string,
  endDate?: string,
  severity?: string,
  bbox?: BBox
) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (vehicleType) {params.append('vehicleType', vehicleType);}
  if (accidentType) {params.append('accidentType', accidentType);}
  if (range) {params.append('range', range);}
  if (startDate) {params.append('startDate', startDate);}
  if (endDate) {params.append('endDate', endDate);}
  if (severity) {params.append('severity', severity);}
  if (bbox) {
    params.append('swLat', String(bbox.swLat));
    params.append('swLng', String(bbox.swLng));
    params.append('neLat', String(bbox.neLat));
    params.append('neLng', String(bbox.neLng));
  }

  const path = `${apiURL}/irs/getClusteredAccidentsDBSCAN?${params.toString()}`;
  const response = await axios.get(path, { headers: { Accept: 'application/json' } });
  return response.data;
};
