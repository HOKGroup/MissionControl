import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";

import App from "./App";
import Layout from "./Layout";
import registerIcons from "./fontAwesome";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import AddProject from "./routes/AddProject";
import Home from "./routes/Home";
import Projects from "./routes/Projects";
import ZombieLogs from "./routes/ZombieLogs";

registerIcons();

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/settings",
        element: <div>SETTINGS</div>,
      },
      {
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/file-paths",
        element: <div>FILE PATHS</div>,
      },
      {
        path: "/addins",
        element: <div>ADDINS</div>,
      },
      {
        path: "/zombie-logs",
        element: <ZombieLogs />,
      },
      {
        path: "/projects/add",
        element: <AddProject />,
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
