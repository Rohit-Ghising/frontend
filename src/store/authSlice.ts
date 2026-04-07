import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../lib/api';
import type { AuthState, User } from '../types';

type AuthResponse = {
  user: User;
  access: string;
  refresh?: string;
};

const saveTokens = (access: string, refresh?: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
};

const removeTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const signupUser = createAsyncThunk<AuthResponse, { name: string; email: string; password: string }, { rejectValue: any }>(
  'auth/signupUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/signup/', payload);
      return response.data as AuthResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Signup failed' });
    }
  },
);

export const loginUser = createAsyncThunk<AuthResponse, { email: string; password: string }, { rejectValue: any }>(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login/', payload);
      return response.data as AuthResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  },
);

export const fetchProfile = createAsyncThunk<User, void, { rejectValue: any }>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me/');
      return response.data as User;
    } catch (err: any) {
      removeTokens();
      return rejectWithValue(err.response?.data || { error: 'Failed to fetch profile' });
    }
  },
);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(ACCESS_TOKEN_KEY),
  loading: false,
  error: null,
  isAuthenticated: Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isAuthenticated = false;
      removeTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
        saveTokens(action.payload.access, action.payload.refresh);
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? JSON.stringify(action.payload) : 'Signup failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
        saveTokens(action.payload.access, action.payload.refresh);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? JSON.stringify(action.payload) : 'Login failed';
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload ? JSON.stringify(action.payload) : 'Unable to load profile';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
