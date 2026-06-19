import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchTimeline = createAsyncThunk('timeline/fetchTimeline', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/timeline');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch timeline');
  }
});

export const addEntry = createAsyncThunk('timeline/addEntry', async (entryData, { rejectWithValue }) => {
  try {
    const response = await API.post('/timeline', entryData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add timeline entry');
  }
});

export const updateEntry = createAsyncThunk('timeline/updateEntry', async ({ id, entryData }, { rejectWithValue }) => {
  try {
    const response = await API.put(`/timeline/${id}`, entryData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update timeline entry');
  }
});

export const deleteEntry = createAsyncThunk('timeline/deleteEntry', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/timeline/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete timeline entry');
  }
});

const initialState = {
  timeline: [],
  loading: false,
  error: null,
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    clearTimelineError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTimeline
      .addCase(fetchTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = action.payload;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addEntry
      .addCase(addEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline.push(action.payload);
      })
      .addCase(addEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateEntry
      .addCase(updateEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = state.timeline.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteEntry
      .addCase(deleteEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = state.timeline.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTimelineError } = timelineSlice.actions;
export default timelineSlice.reducer;
