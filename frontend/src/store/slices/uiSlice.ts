import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  loading: boolean;
  modalOpen: boolean;
  notification: string | null;
}

const initialState: UIState = {
  loading: false,
  modalOpen: false,
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
    setNotification: (state, action: PayloadAction<string | null>) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
  },
});

export const { setLoading, setModalOpen, setNotification, clearNotification } = uiSlice.actions;
export default uiSlice.reducer;
