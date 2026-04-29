import React from "react";
import "./Navbar.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Navbar({ user, toggleDark }) {
  const displayName = user?.displayName || user?.email || "User";

  return (
    <div className="navbar">
      <h2>Todo App</h2>

      <div className="nav-right">
        <span className="username">{displayName}</span>

        <button className="theme-btn" onClick={toggleDark}>Light / Dark</button>

        <button className="logout-btn" onClick={() => signOut(auth)}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;