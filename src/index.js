import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import store from "./redux"; // your Redux store file
import App from "App";
// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "context";
import 'leaflet/dist/leaflet.css';
import { Provider } from "react-redux";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
 <Provider store={store}>
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <App />
    </MaterialUIControllerProvider>
  </BrowserRouter>
  </Provider>
);
