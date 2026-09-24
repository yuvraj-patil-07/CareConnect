import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios.js';
import toast from 'react-hot-toast';

// ─── Load persisted auth from localStorage ────────────────────────────────────
const loadPersistedAuth = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const provider = localStorage.getItem('providerProfile');
    return {
      user: user ? JSON.parse(user) : null,
      provider: provider ? JSON.parse(provider) : null,
      accessToken: token || null,
    };
  } catch {
    return { user: null, provider: null, accessToken: null };
  }
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const googleLogin = createAsyncThunk('auth/google', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google login failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try {
    const { refreshToken } = getState().auth;
    await api.post('/auth/logout', { refreshToken });
  } catch { /* ignore */ }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const persisted = loadPersistedAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persisted.user,
    provider: persisted.provider,
    accessToken: persisted.accessToken,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isLoading: false,
    isInitialized: !!persisted.user,
    error: null,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.provider = payload.provider || null;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.isInitialized = true;
      localStorage.setItem('accessToken', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(payload.user));
      if (payload.provider) localStorage.setItem('providerProfile', JSON.stringify(payload.provider));
    },
    clearAuth: (state) => {
      state.user = null;
      state.provider = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isInitialized = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('providerProfile');
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setLoading: (state, { payload }) => { state.isLoading = payload; },
  },
  extraReducers: (builder) => {
    const onPending = (state) => { state.isLoading = true; state.error = null; };
    const onFulfilled = (state, { payload }) => {
      state.isLoading = false;
      state.user = payload.user;
      state.provider = payload.provider || null;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.isInitialized = true;
      localStorage.setItem('accessToken', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(payload.user));
      if (payload.provider) localStorage.setItem('providerProfile', JSON.stringify(payload.provider));
    };
    const onRejected = (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
      toast.error(payload);
    };

    builder
      .addCase(loginUser.pending, onPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        onFulfilled(state, action);
        toast.success('Welcome back! 👋');
      })
      .addCase(loginUser.rejected, onRejected)

      .addCase(registerUser.pending, onPending)
      .addCase(registerUser.fulfilled, (state, action) => {
        onFulfilled(state, action);
        toast.success('Account created! Please verify your email. 🎉');
      })
      .addCase(registerUser.rejected, onRejected)

      .addCase(googleLogin.pending, onPending)
      .addCase(googleLogin.fulfilled, (state, action) => {
        onFulfilled(state, action);
        toast.success('Logged in with Google! 🎉');
      })
      .addCase(googleLogin.rejected, onRejected)

      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.provider = payload.provider || null;
        state.isInitialized = true;
        localStorage.setItem('user', JSON.stringify(payload.user));
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.provider = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isInitialized = false;
        localStorage.clear();
        toast.success('Logged out successfully.');
      });
  },
});

export const { setCredentials, clearAuth, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
