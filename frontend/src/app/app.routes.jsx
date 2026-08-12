import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import RegisterOTP from "../features/auth/pages/RegisterOtp";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import GuestOnly from "../features/auth/components/GuestOnly";
import Home from "../features/products/pages/Home";
import ProductDetail from "../features/products/pages/ProductDetail";
import SellerProductDetails from "../features/products/pages/SellerProductDetails";
import Cart from "../features/cart/pages/Cart";
import OrderSuccess from "../features/cart/pages/OrderSuccess";
import AllProducts from "../features/products/pages/AllProducts";
import AppLayout from "./AppLayout";
import Checkout from "../features/cart/pages/Checkout";
import Orders from "../features/cart/pages/Orders";
import Profile from "../features/auth/components/Profile";
import Favourites from "../features/favourites/pages/Favourites";
import AdminOrders from "../features/admin/pages/AdminOrders";
import AdminAnalytics from "../features/admin/pages/AdminAnalytics";

export const routes = createBrowserRouter([
  {
    path: "/register",
    element: (
      <GuestOnly>
        <Register />
      </GuestOnly>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestOnly>
        <Login />
      </GuestOnly>
    ),
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/product/:productId",
        element: <ProductDetail />,
      },
      {
        path: "/products",
        element: <AllProducts />,
      },
      {
        path: "/profile",
        element: (
          <Protected>
            <Profile />
          </Protected>
        ),
      },
      {
        path: "/cart",
        element: (
          <Protected>
            <Cart />
          </Protected>
        ),
      },
      {
        path: "/favourites",
        element: (
          <Protected>
            <Favourites />
          </Protected>
        ),
      },
      {
        path: "/admin/orders",
        element: (
          <Protected role="admin">
            <AdminOrders />
          </Protected>
        ),
      },
      {
        path: "/admin/analytics",
        element: (
          <Protected role="admin">
            <AdminAnalytics />
          </Protected>
        ),
      },
      {
        path: "/checkout",
        element: (
          <Protected>
            <Checkout />
          </Protected>
        ),
      },
      {
        path: "/order-success",
        element: (
          <Protected>
            <OrderSuccess />
          </Protected>
        ),
      },
      {
        path: "/orders",
        element: (
          <Protected>
            <Orders />
          </Protected>
        ),
      },
      {
        path: "/seller",
        children: [
          {
            path: "/seller/create-product",
            element: (
              <Protected role="seller">
                <CreateProduct />
              </Protected>
            ),
          },
          {
            path: "/seller/dashboard",
            element: (
              <Protected role="seller">
                <Dashboard />
              </Protected>
            ),
          },
          {
            path: "/seller/product/:productId",
            element: (
              <Protected role="seller">
                <SellerProductDetails />
              </Protected>
            ),
          },
        ],
      },
    ],
  },
]);
