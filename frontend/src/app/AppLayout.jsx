import React, { useEffect } from "react";
import Nav from "../features/Shared/Components/Nav";
import { Outlet } from "react-router";
import ScrollToTop from "../features/Shared/Components/ScrollToTop";
import { useFavourites } from "../features/favourites/hook/useFavourites";
import { useSelector } from "react-redux";
import { socket } from "../lib/socket";
import BottomNav from "../features/Shared/Components/BottomNav";

const AppLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const { handleLoadFavouriteIds } = useFavourites();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      handleLoadFavouriteIds();
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("join", user.id || user._id);
    }

    return () => {
      if (!user && socket.connected) {
        socket.disconnect();
      }
    };
  }, [user]);

  return (
    <>
      <Nav />
      <div className="pb-16 sm:pb-0">
        <Outlet />
      </div>
      <ScrollToTop />
      <BottomNav />
    </>
  );
};

export default AppLayout;
