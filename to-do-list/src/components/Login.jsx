import React, { useState } from "react";
import "./Login.css";
import { auth, provider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email or password.");
      return false;
    }
    setError("");
    return true;
  };

  const signup = async () => {
    if (!validate()) return;

    try {
      setBusy(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const login = async () => {
    if (!validate()) return;

    try {
      setBusy(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    try {
      setBusy(true);
      setError("");
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-orb orb-one" />
      <div className="login-orb orb-two" />
      <div className="login-orb orb-three" />
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in or create your account</p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        {error ? <p className="form-error">{error}</p> : null}

        <button onClick={login} disabled={busy}>{busy ? "Please wait..." : "Sign In"}</button>
        <button onClick={signup} disabled={busy}>{busy ? "Please wait..." : "Sign Up"}</button>

        <button className="google-btn" onClick={googleLogin} disabled={busy}>
          Login with Google
        </button>
      </div>
    </div>
  );
}

export default Login;