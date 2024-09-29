import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRolesPermissions, fetchUserByMobile } from '../../services/authService'// Service layer for API calls

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  role: string | null; // Single role instead of an array
  permissions: string[];
  error: string | null;
  loading: boolean; // Add loading state
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  permissions: [],
  error: null,
  loading: false, // Initialize loading as false
};

// Async thunk for logging in and fetching user roles/permissions
export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async (mobile: string, { rejectWithValue }) => {
    try {
      const userResponse = await fetchUserByMobile(mobile);
      const rolesPermissionsResponse = await fetchRolesPermissions(userResponse.id);

      return {
        user: userResponse,
        role: rolesPermissionsResponse.role, // Single role
        permissions: rolesPermissionsResponse.permissions
      };
    } catch (error) {
      return rejectWithValue('Failed to login');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.permissions = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginAsync.pending, (state) => {
      state.loading = true; // Set loading to true when login starts
    });
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role; // Storing single role
      state.permissions = action.payload.permissions;
      state.error = null; 
      state.loading = false; // Reset loading on success
    });
    builder.addCase(loginAsync.rejected, (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.permissions = [];
      state.error = action.payload as string;
      state.loading = false; // Reset loading on success 
    });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
