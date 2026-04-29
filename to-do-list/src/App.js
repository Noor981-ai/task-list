import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import Todo from "./components/Todo";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const toggleDark = () => setDark((prev) => !prev);

  useEffect(() => {
    document.body.classList.toggle("app-dark", dark);
    return () => document.body.classList.remove("app-dark");
  }, [dark]);

  return (
    <div className={`app-shell ${dark ? "app-dark" : ""}`}>
      {user ? (
        <Todo user={user} dark={dark} toggleDark={toggleDark} />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;