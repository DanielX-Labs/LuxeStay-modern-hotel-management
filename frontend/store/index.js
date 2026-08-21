
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import appSlices from './slices/appSlice';

const rootReducer = combineReducers({
  app: appSlices
});

export const store = configureStore({
  reducer: rootReducer
});
