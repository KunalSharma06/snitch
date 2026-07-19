import { setUser, setError, setLoading } from "../state/auth.slice.js"
import { register, login, getMe, logout } from "../services/auth.api.js"
import { useDispatch } from "react-redux"

export const useAuth = () => {

  const dispatch = useDispatch();
  async function handleRegister({ email, contact, password, fullName, isSeller}) {
    const data = await register({ email, contact, password, fullName, isSeller});

    dispatch(setUser(data.user));
    return data.user;
  }

  async function handleLogin({ email, password}) {
    const data = await login({ email, password});

    dispatch(setUser(data.user));
    return data.user;
  }


  async function handleGetMe() {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data.user)); 
    } catch (err) {
      console.log(err);
    } finally {
        dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    try {
      await logout();
      dispatch(setUser(null));
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
  }
}