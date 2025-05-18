import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAccidentStatistics, StatisticsRequest, getAccidentInsights, StatisticsResponse } from '../../services/accidentService';
import { RootState } from '../store';
import { PayloadAction } from '@reduxjs/toolkit';

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
  insights: {
    accidentType: string | null;
    vehicleType: string | null;
    trends: string | null;
    comprehensive: string | null;
  };
  insightsLoading: {
    accidentType: boolean;
    vehicleType: boolean;
    trends: boolean;
    comprehensive: boolean;
  };
  insightsError: {
    accidentType: string | null;
    vehicleType: string | null;
    trends: string | null;
    comprehensive: string | null;
  };
}

const initialState: StatisticsState = {
  accidentTypeDistribution: [],
  vehicleTypeDistribution: [],
  trends: [],
  loading: false,
  error: null,
  insights: {
    accidentType: null,
    vehicleType: null,
    trends: null,
    comprehensive: null,
  },
  insightsLoading: {
    accidentType: false,
    vehicleType: false,
    trends: false,
    comprehensive: false,
  },
  insightsError: {
    accidentType: null,
    vehicleType: null,
    trends: null,
    comprehensive: null,
  },
};

export const fetchStatistics = createAsyncThunk(
  'statistics/fetchStatistics',
  async (request: StatisticsRequest) => {
    const response = await getAccidentStatistics(request);
    return response;
  }
);

export const fetchInsights = createAsyncThunk(
  'statistics/fetchInsights',
  async ({ type, comprehensive = false }: { type: 'accidentType' | 'vehicleType' | 'trends' | 'comprehensive', comprehensive?: boolean }, { getState }) => {
    const state = getState() as RootState;
    const { accidentTypeDistribution, vehicleTypeDistribution, trends } = state.statistics;
    
    let data: StatisticsResponse;
    if (type === 'comprehensive' || comprehensive) {
      // Send all data for comprehensive insights
      data = {
        accidentTypeDistribution,
        vehicleTypeDistribution,
        trends
      };
    } else {
      // Send only specific chart data
      switch (type) {
        case 'accidentType':
          data = { accidentTypeDistribution, vehicleTypeDistribution: [], trends: [] };
          break;
        case 'vehicleType':
          data = { accidentTypeDistribution: [], vehicleTypeDistribution, trends: [] };
          break;
        case 'trends':
          data = { accidentTypeDistribution: [], vehicleTypeDistribution: [], trends };
          break;
        default:
          throw new Error('Invalid insight type');
      }
    }
    
    const response = await getAccidentInsights(data);
    if (!response || !response.insight) {
      throw new Error('Invalid response from insights API');
    }
    return { type: comprehensive ? 'comprehensive' : type, insights: response.insight };
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
      state.insights = {
        accidentType: null,
        vehicleType: null,
        trends: null,
        comprehensive: null,
      };
      state.insightsError = {
        accidentType: null,
        vehicleType: null,
        trends: null,
        comprehensive: null,
      };
    },
    clearInsights: (state, action: PayloadAction<'accidentType' | 'vehicleType' | 'trends' | 'comprehensive' | 'all'>) => {
      if (action.payload === 'all') {
        state.insights = {
          accidentType: null,
          vehicleType: null,
          trends: null,
          comprehensive: null,
        };
        state.insightsError = {
          accidentType: null,
          vehicleType: null,
          trends: null,
          comprehensive: null,
        };
      } else {
        state.insights[action.payload] = null;
        state.insightsError[action.payload] = null;
      }
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
      })
      .addCase(fetchInsights.pending, (state, action) => {
        const type = action.meta.arg.type;
        state.insightsLoading[type] = true;
        state.insightsError[type] = null;
        state.insights[type] = null;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        const { type, insights } = action.payload;
        state.insightsLoading[type] = false;
        state.insights[type] = insights;
        state.insightsError[type] = null;
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        const type = action.meta.arg.type;
        state.insightsLoading[type] = false;
        state.insightsError[type] = action.error.message || 'Failed to fetch insights';
        state.insights[type] = null;
      });
  },
});

export const { clearStatistics, clearInsights } = statisticsSlice.actions;
export default statisticsSlice.reducer;