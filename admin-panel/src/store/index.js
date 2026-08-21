import { combineReducers, configureStore } from '@reduxjs/toolkit';
import appSlices from './slice/appSlice';

const rootReducer = combineReducers({
  app: appSlices
});

export const store = configureStore({
  reducer: rootReducer
});
