import { createBrowserRouter, redirect } from "react-router";
import Downloads from "@components/downloads";

const router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect("/downloads"),
  },
  {
    path: "/downloads",
    element: <Downloads />,
  },
]);

export default router;
