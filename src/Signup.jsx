import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    const {data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) setMessage('Error: ' + error.message);
    else setMessage('Signup successful! Please check your email to confirm.');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px', width: '250px' }}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px', width: '250px' }}
        />
        <br />
        <button type="submit" style={{ padding: '8px 20px' }}>Sign Up</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Signup;
