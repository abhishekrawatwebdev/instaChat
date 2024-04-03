// userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    updateUserData: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
  },
});

export const { setUserData, updateUserData } = userSlice.actions;

export const selectUserData = (state) => state.user.userData;

export default userSlice.reducer;
