import React, { useState, useEffect, useRef } from "react";
import "./Todo.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import Navbar from "./Navbar";

const sortByCreatedAtDesc = (items) =>
  [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
const taskSignature = (item) => `${item?.text || ""}__${item?.createdAt || 0}`;

function Todo({ user, dark, toggleDark }) {
  const [task, setTask] = useState("");
  const [list, setList] = useState([]);
  const [taskError, setTaskError] = useState("");
  const removedIdsRef = useRef(new Set());

  useEffect(() => {
    // Reset list immediately when auth user changes to avoid showing old account data.
    setList([]);
    setTaskError("");
    removedIdsRef.current = new Set();

    if (!user?.uid) {
      return;
    }

    const cacheKey = `tasks_${user.uid}`;
    const cachedTasks = localStorage.getItem(cacheKey);
    if (cachedTasks) {
      try {
        setList(sortByCreatedAtDesc(JSON.parse(cachedTasks)));
      } catch {
        // Ignore invalid cache format.
      }
    }

    const q = query(collection(db, "tasks"), where("user", "==", user.uid));
    const mapTasks = (snapshot) =>
      snapshot.docs
        .map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }));
    const parseCachedTasks = () => {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return [];
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    };
    const mergeTasksById = (primary, secondary) => {
      const map = new Map();
      secondary.forEach((item) => map.set(item.id, item));
      primary.forEach((item) => map.set(item.id, item));
      const dedupBySignature = new Map();
      Array.from(map.values())
        .filter((item) => !removedIdsRef.current.has(item.id))
        .forEach((item) => {
          const signature = taskSignature(item);
          if (!dedupBySignature.has(signature) || !String(item.id).startsWith("local-")) {
            dedupBySignature.set(signature, item);
          }
        });
      return sortByCreatedAtDesc(Array.from(dedupBySignature.values()));
    };

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteTasks = sortByCreatedAtDesc(mapTasks(snapshot));
        const cachedTasksNow = parseCachedTasks();
        const next = mergeTasksById(remoteTasks, cachedTasksNow);
        localStorage.setItem(cacheKey, JSON.stringify(next));
        setList(next);
        if (remoteTasks.length === 0 && cachedTasksNow.length === 0) {
          setList([]);
        }
      },
      () => {
        setTaskError("Live sync failed. Please check Firebase rules.");
      }
    );

    return unsubscribe;
  }, [user]);

  const addTask = async () => {
    const cleanTask = task.trim();
    if (!cleanTask) {
      setTaskError("Please enter a task.");
      return;
    }

    try {
      setTaskError("");
      const cacheKey = `tasks_${user.uid}`;
      const localId = `local-${Date.now()}`;
      const optimisticTask = {
        id: localId,
        text: cleanTask,
        user: user.uid,
        createdAt: Date.now()
      };

      const optimisticList = sortByCreatedAtDesc([optimisticTask, ...list]);
      setList(optimisticList);
      localStorage.setItem(cacheKey, JSON.stringify(optimisticList));

      const docRef = await addDoc(collection(db, "tasks"), {
        text: cleanTask,
        user: user.uid,
        createdAt: optimisticTask.createdAt
      });
      setList((prev) => {
        const next = prev.map((item) =>
          item.id === localId ? { ...item, id: docRef.id } : item
        );
        localStorage.setItem(cacheKey, JSON.stringify(next));
        return next;
      });
      setTask("");
    } catch {
      setTaskError("Failed to add task. Please try again.");
    }
  };

  const deleteTask = async (id) => {
    const cacheKey = `tasks_${user.uid}`;
    try {
      removedIdsRef.current.add(id);
      const next = list.filter((item) => item.id !== id);
      setList(next);
      localStorage.setItem(cacheKey, JSON.stringify(next));

      if (id.startsWith("local-")) {
        return;
      }
      await deleteDoc(doc(db, "tasks", id));
    } catch {
      setTaskError("Delete failed. Please try again.");
    }
  };

  const onEnterAdd = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const totalRows = Math.max(10, list.length);
  const rowPalette = ["row-lilac", "row-purple", "row-pink", "row-rose", "row-peach"];

  return (
    <div className={dark ? "theme-dark" : "theme-light"}>
      <Navbar user={user} toggleDark={toggleDark} />

      <div className="planner-shell">
        <div className="planner-card">
          <div className="planner-head">
            <h2>
              <span>To-do-list</span> <em>Planner</em>
            </h2>
          </div>

          <div className="input-box">
            <input
              value={task}
              onChange={(e)=>setTask(e.target.value)}
              onKeyDown={onEnterAdd}
              placeholder="Write your task and press Enter"
            />
            <button onClick={addTask}>Add Task</button>
          </div>
          {taskError ? <p className="task-error">{taskError}</p> : null}

          <div className="planner-grid">
            <ul className="task-list planner-task-list">
              {Array.from({ length: totalRows }).map((_, index) => {
                const item = list[index];
                const palette = rowPalette[index % rowPalette.length];

                return (
                  <li
                    key={item ? item.id : `empty-${index}`}
                    className={`planner-task-item ${palette} ${item ? "filled" : "empty"}`}
                  >
                    <span className="task-dot" />
                    <span className="task-text">{item ? item.text : ""}</span>
                    {item ? (
                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(item.id)}
                        title="Delete task"
                      >
                        x
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Todo;