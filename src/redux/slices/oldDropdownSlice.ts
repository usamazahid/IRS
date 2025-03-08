import {getDropDownData} from './../../services/DropDownServices';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';


interface DropdownState {
  ambulanceServiceData: Object[] | null; // Add other dropdown keys if necessary
  frequentlyUsedServices: Object[] | null;
  accidentTypes: Object[] | null;
  patientVictim: Object[] | null;
  vehicleInvolved: Object[] | null;
  error: string | null;
  loading: boolean;
}

const initialState: DropdownState = {
  accidentTypes: null,
  patientVictim: null,
  vehicleInvolved: null,
  ambulanceServiceData: null, // Add other dropdown keys if necessary
  frequentlyUsedServices: null,
  error: null,
  loading: false,
};

// Async thunk for fetching dropdown data
export const origanizationData = createAsyncThunk(
  'dropdown/origanizationData',
  async (pathUrl: string, {rejectWithValue}) => {
    try {
      const ambulanceServiceData = await getDropDownData(pathUrl);
      let frequentlyUsedServices = null;
      if (ambulanceServiceData) {
        // Filter frequently used services
        const frequentlyUsedLabels = [
          'Rescue 1122',
          'Chhipa',
          'Edhi Foundation',
          'Suhayl Ambulance Service',
        ];
        frequentlyUsedServices = ambulanceServiceData.filter((service: any) =>
          frequentlyUsedLabels.includes(service.label),
        );
      }

      return {
        ambulanceServiceData: ambulanceServiceData,
        frequentlyUsedServices: frequentlyUsedServices,
      };
    } catch (error: any) {
      console.error('Error fetching dropdown data:', error);
      return rejectWithValue('Failed to fetch data');
    }
  },
);

// Async thunk for fetching dropdown data
export const fetchReportDropdowns = createAsyncThunk(
  'dropdown/fetchReportDropdowns',
  async (_, {rejectWithValue}) => {
    try {
      const accidentTypes = await getDropDownData('getAccidentTypes');
      const patientVictim=await getDropDownData('getPatientVictim');
      const vehicleInvolved=await getDropDownData('getVehicleInvolved');


      return {
        accidentTypes : accidentTypes,
        patientVictim:patientVictim,
        vehicleInvolved:vehicleInvolved
      };
    } catch (error: any) {
      console.error('Error fetching dropdown data:', error);
      return rejectWithValue('Failed to fetch data');
    }
  },
);

const dropdownSlice = createSlice({
  name: 'dropdown',
  initialState,
  reducers: {
    resetError(state) {
      state.error = null; // Reset the error state
    },
  },
  extraReducers: builder => {
    builder
      .addCase(origanizationData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(origanizationData.fulfilled, (state, action) => {
        state.ambulanceServiceData = action.payload.ambulanceServiceData;
        state.frequentlyUsedServices = action.payload.frequentlyUsedServices;
        state.loading = false;
        state.error = null;
      })
      .addCase(origanizationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchReportDropdowns.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportDropdowns.fulfilled, (state, action) => {
        (state.accidentTypes = action.payload.accidentTypes),
          (state.patientVictim = action.payload.patientVictim),
          (state.vehicleInvolved = action.payload.vehicleInvolved);
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchReportDropdowns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {resetError} = dropdownSlice.actions;
export default dropdownSlice.reducer;
