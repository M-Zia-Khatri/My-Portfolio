import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { startLenis, stopLenis } from '@/shared/lib/lenis';
import Footer from './Footer/Footer';
import TopBar from './TopBar/TopBar';

export default function AppLayout() {
  useEffect(() => {
    startLenis();

    return () => {
      stopLenis();
    };
  }, []);

  return (
    <>
      <TopBar />
      <Outlet />
      <Footer />
    </>
  );
}
