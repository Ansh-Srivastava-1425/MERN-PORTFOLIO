import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import projectReducer from './slices/projectSlice';
import timelineReducer from './slices/timelineSlice';
import messageReducer from './slices/messageSlice';
import postReducer from './slices/postSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    projects: projectReducer,
    timeline: timelineReducer,
    messages: messageReducer,
    posts: postReducer,
  },
});
export default store;
