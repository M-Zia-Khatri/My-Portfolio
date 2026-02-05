import { RouterProvider } from "react-router";
import { AppRouter } from "./routes/router";

export default function App() {
  return (
    <RouterProvider router={AppRouter} />
  )
}
