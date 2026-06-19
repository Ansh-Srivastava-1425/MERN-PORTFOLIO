import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchPosts = createAsyncThunk('posts/fetchAll', async () => {
  const res = await API.get('/posts');
  return res.data;
});

export const fetchAllPostsAdmin = createAsyncThunk('posts/fetchAllAdmin', async () => {
  const res = await API.get('/posts/all');
  return res.data;
});

export const createPost = createAsyncThunk('posts/create', async (data) => {
  const res = await API.post('/posts', data);
  return res.data;
});

export const updatePost = createAsyncThunk('posts/update', async ({ id, data }) => {
  const res = await API.put(`/posts/${id}`, data);
  return res.data;
});

export const deletePost = createAsyncThunk('posts/delete', async (id) => {
  await API.delete(`/posts/${id}`);
  return id;
});

const postSlice = createSlice({
  name: 'posts',
  initialState: { posts: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchAllPostsAdmin.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const idx = state.posts.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.posts[idx] = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
      });
  },
});

export default postSlice.reducer;
