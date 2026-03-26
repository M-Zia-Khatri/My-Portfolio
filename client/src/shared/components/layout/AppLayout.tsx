import { Outlet } from 'react-router';
import Footer from './Footer/Footer';
import TopBar from './TopBar/TopBar';

export default function AppLayout() {
  return (
    <>
      <TopBar />
      <Outlet />
      <Footer />
    </>
  );
}
