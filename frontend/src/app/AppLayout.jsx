import React from "react";
import Nav from "../features/Shared/Components/Nav";
import { Outlet } from "react-router";
import ScrollToTop from "../features/Shared/Components/ScrollToTop";

const AppLayout = () => {
  return (
    <>
      <Nav />
      <Outlet />
      <ScrollToTop />
    </>
  );
};

export default AppLayout;
