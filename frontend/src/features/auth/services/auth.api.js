import axios from "axios"

const API_URL = axios.create({
  baseURL: "/api/auth",
  withCredentials: true
})

export async function register({ email, contact, password, fullName, isSeller }) {
  const res = await API_URL.post("/register", {
    email,
    contact,
    password,
    fullName,
    isSeller
  })
  console.log(res.data);
  return res.data;
}



export async function login({ email, password }) {
  const res = await API_URL.post("/login", {
    email,
    password,
  })
  return res.data;
}

export async function getMe() {
  const res = await API_URL.get("/me");
  return res.data;
}

export async function logout() {
  const res = await API_URL.post("/logout");
  return res.data;
}