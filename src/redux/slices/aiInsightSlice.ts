import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateAIInsight, AIInsightResponse } from '../../services/accidentService';

interface AIInsightState {
  loading: boolean;
  error: string | null;
  currentInsight: AIInsightResponse | null;
  suggestedQuestions: string[];
}

const initialState: AIInsightState = {
  loading: false,
  error: null,
  currentInsight: null,
  suggestedQuestions: [
    "Total number of accidents in Karachi",
    "Count of accidents with more than 3 casualties",
    "Number of accidents involving pedestrians",
    "Count accidents by weather condition",
    "What areas have the highest number of accidents?",
    "Number of accidents that occurred during rainy weather",
    "Vehicle type involved in the most accidents",
    "Count of accidents on roads with poor visibility",
    "Monthly trend of accidents in the past year",
    "Average number of casualties per accident type",
    "Gender distribution of drivers in reported accidents",
    "Top 5 accident locations by frequency",
    "Count of accidents by road surface condition",
    "Count of accidents where fitness certificate was expired",
    "Count of \"Hit and Run\" accidents"
  ]
};

export const fetchAIInsight = createAsyncThunk(
  'aiInsight/fetchInsight',
  async (question: string) => {
    const response = await generateAIInsight(question);
    return response;
  }
);

const aiInsightSlice = createSlice({
  name: 'aiInsight',
  initialState,
  reducers: {
    clearInsight: (state) => {
      state.currentInsight = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIInsight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAIInsight.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInsight = action.payload;
      })
      .addCase(fetchAIInsight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch insight';
      });
  },
});

export const { clearInsight } = aiInsightSlice.actions;
export default aiInsightSlice.reducer; 