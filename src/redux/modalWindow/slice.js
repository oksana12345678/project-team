import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "modal",
  initialState: {
    isModalOpen: false,
    isSettingModalOpen: false,
    logOutModal: false,
    isUserLogoModalOpen: false,
    isDeleteEntryModalOpen: false,
    isAddWaterModalOpen: false,
  },
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.isSettingModalOpen = false;
      state.logOutModal = false;
      state.isUserLogoModalOpen = false;
      state.isDeleteEntryModalOpen = false;
      state.isAddWaterModalOpen = false;
    },
    settingModal: (state) => {
      state.isSettingModalOpen = true;
    },
    logOutModal: (state) => {
      state.logOutModal = true;
    },
    userLogoModal: (state) => {
      state.isUserLogoModalOpen = true;
    },
    deleteEntryModalOpen: (state) => {
      state.isDeleteEntryModalOpen = true;
    },
    addWaterModalOpen: (state) => {
      state.isAddWaterModalOpen = true;
    },
  },
});

export const {
  openModal,
  closeModal,
  settingModal,
  logOutModal,
  userLogoModal,
  deleteEntryModalOpen,
  addWaterModalOpen,
} = modalSlice.actions;

export const modalReducer = modalSlice.reducer;
