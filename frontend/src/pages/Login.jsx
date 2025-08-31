import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setRole, setUserId } from '../redux/reducer/userReducer';

const USERS = [
  { username: 'abc', password: 'abc123' ,userId:1},
  { username: 'admin', password: 'admin123',userId:2},
  { username: 'sangita', password: 'sangita123',userId:3} 
];

export default function Login() {
    
    const navigate=useNavigate();
    const dispatch=useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const found = USERS.find(u => u.username === username && u.password === password);
   if (found) {
  setMsg('Login successful!');
  dispatch(setUserId(found.userId));

  if (found.userId == 2) {
    dispatch(setRole('admin'));
    localStorage.setItem("role", "admin");
    localStorage.setItem("userId", found.userId);
    navigate('/admin-home');
  } else {
    dispatch(setRole('user'));
    localStorage.setItem("role", "user");
    localStorage.setItem("userId", found.userId);
    navigate('/home');
  }
}
    else {
      setMsg('Invalid username or password');
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: 8 }}>Login</button>
      </form>
      {msg && <div style={{ marginTop: 10, color: msg === 'Login successful!' ? 'green' : 'red' }}>
        {msg}</div>}
    </div>
  );
}