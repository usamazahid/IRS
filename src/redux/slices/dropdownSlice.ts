import {getDropDownData} from './../../services/DropDownServices';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';


interface DropdownState {
  ambulanceServiceData: Object[] | null;
  frequentlyUsedServices: Object[] | null;
  accidentTypes: Object[] | null;
  patientVictim: Object[] | null;
  vehicleInvolved: Object[] | null;
  apparentCauses: Object[] | null;
  weatherConditions: Object[] | null;
  visibilityLevels: Object[] | null;
  roadSurfaceConditions: Object[] | null;
  roadTypes: Object[] | null;
  roadSignages: Object[] | null;
  caseReferredTo: Object[] | null;
  faultAssessments: Object[] | null;
  genderTypes: Object[] | null;
  error: string | null;
  loading: boolean;
}

const initialState: DropdownState = {
  accidentTypes: [],
  patientVictim: [],
  vehicleInvolved: [],
  apparentCauses: [],
  weatherConditions: [],
  visibilityLevels: [],
  roadSurfaceConditions: [],
  roadTypes: [],
  roadSignages: [],
  caseReferredTo: [],
  faultAssessments: [],
  ambulanceServiceData: [],
  frequentlyUsedServices: [],
  genderTypes: [],
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

export const fetchAllLovs = createAsyncThunk(
  'dropdown/fetchAllLovs',
  async (_, {rejectWithValue}) => {
    try {
      const lovs = await getDropDownData('fetchAllLovs');
      return {
        accidentTypes: lovs.accidentTypes,
        patientVictim: lovs.patientVictims,
        vehicleInvolved: lovs.vehicleInvolved,
        apparentCauses: lovs.apparentCauses,
        weatherConditions: lovs.weatherConditions,
        visibilityLevels: lovs.visibilityLevels,
        roadSurfaceConditions: lovs.roadSurfaceConditions,
        roadTypes: lovs.roadTypes,
        roadSignages: lovs.roadSignages,
        caseReferredTo: lovs.caseReferredTo,
        faultAssessments: lovs.faultAssessments,
        genderTypes: lovs.genderTypes,
      };
    } catch (error: any) {
      console.error('Error fetching LOV data:', error);
      return rejectWithValue('Failed to fetch LOVs');
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
      })
        .addCase(fetchAllLovs.pending, state => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAllLovs.fulfilled, (state, action) => {
          state.loading = false;
          state.accidentTypes = action.payload.accidentTypes;
          state.patientVictim = action.payload.patientVictim;
          state.vehicleInvolved = action.payload.vehicleInvolved;
          state.apparentCauses = action.payload.apparentCauses;
          state.weatherConditions = action.payload.weatherConditions;
          state.visibilityLevels = action.payload.visibilityLevels;
          state.roadSurfaceConditions = action.payload.roadSurfaceConditions;
          state.roadTypes = action.payload.roadTypes;
          state.roadSignages = action.payload.roadSignages;
          state.caseReferredTo = action.payload.caseReferredTo;
          state.faultAssessments = action.payload.faultAssessments;
          state.genderTypes = action.payload.genderTypes;
        })
        .addCase(fetchAllLovs.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  },
});

export const {resetError} = dropdownSlice.actions;
export default dropdownSlice.reducer;
