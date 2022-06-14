import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Brushes } from "../components/Canvas/CanvasOperations/canvas-utils";

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState: { logged: false },
  reducers: {
    handleGuest(state: any) {
      state.logged = true;
    },
    handleLogout(state: any) {
      state.logged = false;
    },
    handleLogin(state: any) {
      state.logged = true;
    },
  },
});

const canvasSlice = createSlice({
  name: "canvas",
  initialState: {
    size: 1,
    brush: Brushes.normal,
    color: "black",
    pickingColor: false,
    panning: false,
    background: "",
    canvasSize: 10,
    zoom: 1,
    sc: 0,
    sr: 0,
    name: "project",
  },
  reducers: {
    setCanvasName(state: any, action: any) {
      state.name = action.payload.name;
    },
    setCanvasSize(state: any, action: any) {
      state.canvasSize = action.payload.canvasSize;
    },
    addBackground(state: any, action: any) {
      state.background = action.payload.background;
    },
    handlePanning(state: any) {
      state.panning = !state.panning;
    },
    changePickingColor(state: any) {
      state.pickingColor = !state.pickingColor;
    },
    changeBrush(state: any, action: any) {
      state.brush = action.payload.brush;
    },
    changeSize(state: any, action: any) {
      state.size = action.payload.size;
    },
    changeColor(state: any, action: any) {
      state.color = action.payload.color;
    },
  },
});

const store = configureStore({
  reducer: {
    canvas: canvasSlice.reducer,
    userManagement: userManagementSlice.reducer,
  },
});

export const canvasActions = canvasSlice.actions;
export const userManagementActions = userManagementSlice.actions;
export default store;
