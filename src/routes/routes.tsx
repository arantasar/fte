import type { RouteObject } from "react-router-dom";
import { AppShell } from "./AppShell";
import { ErrorPage } from "./ErrorPage";
import { HomePage } from "./HomePage";
import { NodeDetails } from "./NodeDetails";
import { NotFound } from "./NotFound";
import { TreeLayout } from "./TreeLayout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "tree",
        element: <TreeLayout />,
        children: [
          { index: true, element: <NodeDetails /> },
          { path: ":nodePath", element: <NodeDetails /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];
