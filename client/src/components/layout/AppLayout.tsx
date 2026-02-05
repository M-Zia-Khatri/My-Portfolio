import TopBar from "./TopBar/TopBar";
import { Outlet } from "react-router";
import Footer from "./Footer/Footer";

export default function AppLayout() {
  return (
    <>
      <TopBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
