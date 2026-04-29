import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";

function Todo() {
  const [task, setTask] = useState("");
  const [list, setList] = useState([]);

  const addTask = async () => {
    await addDoc(collection(db, "tasks"), {
      text: task,
      user: auth.currentUser.uid
    });
    setTask("");
    getTasks();
  };

  const getTasks = async () => {
    const data = await getDocs(collection(db, "tasks"));
    setList(data.docs.map(doc => doc.data()));
  };

  useEffect(() => {
    getTasks();
  }, []);

  const logout = () => {
    signOut(auth);
  };

  return (
    <div>
      <h2>Todo App</h2>

      <input value={task} onChange={(e)=>setTask(e.target.value)} />
      <button onClick={addTask}>Add</button>

      <ul>
        {list.map((item, index) => (
          <li key={index}>{item.text}</li>
        ))}
      </ul>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Todo;