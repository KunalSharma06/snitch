import React, { useEffect } from "react";
import Nav from "../features/Shared/Components/Nav";
import { Outlet } from "react-router";
import ScrollToTop from "../features/Shared/Components/ScrollToTop";

const AppLayout = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Nav />
      <Outlet />
      <ScrollToTop />
    </>
  );
};

export default AppLayout;
