import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('darkMode') === 'true',
    sidebarOpen: true,
    mobileSidebarOpen: false,
    searchOpen: false,
    activeModal: null,
    modalData: null,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setDarkMode: (state, { payload }) => {
      state.darkMode = payload;
      localStorage.setItem('darkMode', payload);
      document.documentElement.classList.toggle('dark', payload);
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setMobileSidebar: (state, { payload }) => { state.mobileSidebarOpen = payload; },
    openModal: (state, { payload }) => { state.activeModal = payload.modal; state.modalData = payload.data || null; },
    closeModal: (state) => { state.activeModal = null; state.modalData = null; },
    setSearchOpen: (state, { payload }) => { state.searchOpen = payload; },
  },
});

export const { toggleDarkMode, setDarkMode, toggleSidebar, setMobileSidebar, openModal, closeModal, setSearchOpen } = uiSlice.actions;
export default uiSlice.reducer;
