import React, { useState } from "react";
import { auth, provider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("User Created");
  };

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged In");
  };

  const googleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  return (
    <div>
      <h2>Login / Signup</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />

      <button onClick={signup}>Signup</button>
      <button onClick={login}>Login</button>
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}

export default Login;