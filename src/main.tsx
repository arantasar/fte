import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { routes } from "./routes/routes";
import { TreeProvider } from "./state/TreeProvider";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TreeProvider>
      <RouterProvider router={router} />
    </TreeProvider>
  </StrictMode>,
);
