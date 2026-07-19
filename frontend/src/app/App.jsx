import './App.css'
import { routes } from './app.routes.jsx'
import { RouterProvider } from 'react-router'
import { useAuth } from '../features/auth/hook/useAuth.js'
import { useCart } from '../features/cart/hook/useCart.js'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function App() {

  const { handleGetMe } = useAuth();
  const { handleGetCart } = useCart();

  const user = useSelector(state => state.auth.user);

  // Fetch user session on startup
  useEffect(() => {
    handleGetMe();
  }, []);

  // Once user is loaded, fetch their cart so the badge is always correct
  useEffect(() => {
    if (user && user.role !== 'seller') {
      handleGetCart();
    }
  }, [user]);

  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App
