import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null;
  modal: {
    type: string;
    visible: boolean;
    data?: any;
  } | null;
  language: string;
}

const DEFAULT_LANGUAGE = 'English';
const LANGUAGE_KEY = 'edutalks_language';

const initialState: UIState = {
  theme: 'dark', // Force dark mode
  sidebarOpen: true,
  toast: null,
  modal: null,
  language: localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      // Force dark mode regardless of payload
      state.theme = 'dark';
      localStorage.setItem('edutalks_theme', 'dark');
      document.documentElement.classList.add('dark');
    },
    toggleTheme: (state) => {
      // Always ensure it's dark
      state.theme = 'dark';
      localStorage.setItem('edutalks_theme', 'dark');
      document.documentElement.classList.add('dark');
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
      }>
    ) => {
      state.toast = {
        ...action.payload,
        visible: true,
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
    showModal: (
      state,
      action: PayloadAction<{
        type: string;
        data?: any;
      }>
    ) => {
      state.modal = {
        ...action.payload,
        visible: true,
      };
    },
    hideModal: (state) => {
      state.modal = null;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      localStorage.setItem(LANGUAGE_KEY, action.payload);
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  showToast,
  hideToast,
  showModal,
  hideModal,
  setLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;
