import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  fetchRolesPermissions,
  fetchUserByMobile,
  createUser,
} from '../../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  role: string | null;
  permissions: string[];
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  permissions: [],
  error: null,
  loading: false,
};

// Async thunk for signing up
export const signupAsync = createAsyncThunk(
  'auth/signupAsync',
  async ({name, mobileNumber, email, password}: any, {rejectWithValue}) => {
    try {
      const userResponse = await createUser({
        name,
        mobileNumber,
        email,
        password,
      });
      console.log('User created successfully:', userResponse);
      return userResponse;
    } catch (error: any) {
      console.error('Signup failed:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to sign up',
      );
    }
  },
);
// Async thunk for logging in
export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async (mobile: string, {rejectWithValue}) => {
     if (!mobile || mobile.trim() === '') {
       return rejectWithValue('Mobile number is required'); // Reject with specific error if no mobile number
     }
    try {
      const userResponse = await fetchUserByMobile(mobile);
      
      // Check if userResponse.id exists
      if (!userResponse.id) {
        return rejectWithValue('Invalid input: User not found'); // Return an error message for invalid input
      }
         const rolesPermissionsResponse = await fetchRolesPermissions(
           userResponse.id,
         );

      return {
        user: userResponse,
        role: rolesPermissionsResponse.role,
        permissions: rolesPermissionsResponse.permissions,
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      return rejectWithValue('Failed to login');
    }
  },
);

export const reportAccident = createAsyncThunk(
  'auth/reportAccident',
  async (mobile: string, {rejectWithValue}) => {
    try {
      const userResponse = await fetchUserByMobile(mobile);
      const rolesPermissionsResponse = await fetchRolesPermissions(
        userResponse.id,
      );
      return {
        user: userResponse,
        role: rolesPermissionsResponse.role,
        permissions: rolesPermissionsResponse.permissions,
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      return rejectWithValue('Failed to login');
    }
  },
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
    },
    resetError(state) {
      state.error = null; // Reset the error state
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signupAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.role = 'user'; // Default role assignment
        state.permissions = [];
        state.loading = false;
        state.error = null;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(loginAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.permissions = action.payload.permissions;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const {logout, resetError} = authSlice.actions;
export default authSlice.reducer;
