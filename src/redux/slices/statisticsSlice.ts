import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAccidentStatistics, StatisticsRequest } from '../../services/accidentService';

interface ChartDataPoint {
  label: string;
  count: number;
  avgSeverity: number;
}

interface TimeSeriesDataPoint {
  timePeriod: string;
  totalCount: number;
  fatalCount: number;
  avgSeverity: number;
  weatherRelatedCount: number;
  roadConditionRelatedCount: number;
}

interface StatisticsState {
  accidentTypeDistribution: ChartDataPoint[];
  vehicleTypeDistribution: ChartDataPoint[];
  trends: TimeSeriesDataPoint[];
  loading: boolean;
  error: string | null;
}

const initialState: StatisticsState = {
  accidentTypeDistribution: [],
  vehicleTypeDistribution: [],
  trends: [],
  loading: false,
  error: null,
};

export const fetchStatistics = createAsyncThunk(
  'statistics/fetchStatistics',
  async (request: StatisticsRequest) => {
    const response = await getAccidentStatistics(request);
    return response;
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    clearStatistics: (state) => {
      state.accidentTypeDistribution = [];
      state.vehicleTypeDistribution = [];
      state.trends = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.accidentTypeDistribution = action.payload.accidentTypeDistribution;
        state.vehicleTypeDistribution = action.payload.vehicleTypeDistribution;
        state.trends = action.payload.trends;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch statistics';
      });
  },
});

export const { clearStatistics } = statisticsSlice.actions;
export default statisticsSlice.reducer;