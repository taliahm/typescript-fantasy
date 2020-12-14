import { Link } from 'react-router-dom';
import axios from 'axios';
import React, { useState } from 'react';

interface props {
  fetchMe: Function,
}
function Login({ fetchMe }: props): JSX.Element {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const login = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();
    await axios.post("/api/user/login", {
      email,
      password,
    });
    await fetchMe();
  };
  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button type="submit" onClick={login}>
        Login
      </button>
      <Link to="/signup">Don't have an account? Sign up</Link>
    </div>
  );
}

export default Login;