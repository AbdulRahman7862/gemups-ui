"use client";
import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import store from "./store";
import RefreshLoading from "@/components/common/RefreshLoading";

const persistor = persistStore(store);

interface ProvidersProps {
  children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<RefreshLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default Providers;
