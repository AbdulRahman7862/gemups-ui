import { configureStore, combineReducers, Reducer } from "@reduxjs/toolkit";
import { PersistConfig, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistPartial } from "redux-persist/es/persistReducer";
import userReducer from "./user/userSlice";
import bookingReducer from "./bookings/bookingSlice";
import proxyReducer from "./proxies/proxySlice";

// Combine all reducers
const reducers = combineReducers({
  user: userReducer,
  booking: bookingReducer,
  proxy: proxyReducer,
});

// Type for reducer state before persist
type RootReducerType = ReturnType<typeof reducers>;

// Type for persisted state
type PersistedState = RootReducerType & PersistPartial;

const persistConfig: PersistConfig<RootReducerType> = {
  key: "root",
  storage,
  whitelist: ["user"],
};

// Persisted reducer
const persistedReducer = persistReducer<RootReducerType>(persistConfig, reducers);

// Final rootReducer with reset handling
const rootReducer: Reducer<PersistedState> = (state, action) => {
  if (action.type === "RESET_ALL_SLICES") {
    storage.removeItem("persist:root");
    state = undefined;
  }
  return persistedReducer(state, action);
};

// Configure store
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
