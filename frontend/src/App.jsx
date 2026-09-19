import { useEffect, useMemo, useState } from "react";
import api from "./api";

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: ""
};

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
  };

  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load tasks");
    }
  };

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const submitAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const res = await api.post(endpoint, payload);
      saveSession(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      if (editingId) {
        const res = await api.put(`/tasks/${editingId}`, form);
        setTasks(tasks.map((t) => (t._id === editingId ? res.data : t)));
      } else {
        const res = await api.post("/tasks", form);
        setTasks([res.data, ...tasks]);
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save task");
    } finally {
      setLoading(false);
    }
  };

  const editTask = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete task");
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || task.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    progress: tasks.filter((t) => t.status === "In Progress").length,
    pending: tasks.filter((t) => t.status === "Pending").length
  };

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand">Task<span>Flow</span></div>
          <p className="subtitle">Manage your work. Stay organized.</p>
          <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>

          <form onSubmit={submitAuth}>
            {authMode === "register" && (
              <label>
                Full name
                <input required value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Your name" />
              </label>
            )}
            <label>
              Email
              <input required type="email" value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input required type="password" minLength="6" value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Minimum 6 characters" />
            </label>
            <button className="primary full" disabled={loading}>
              {loading ? "Please wait..." : authMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          {message && <div className="alert">{message}</div>}

          <p className="switch">
            {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setMessage(""); }}>
              {authMode === "login" ? " Register" : " Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Task<span>Flow</span></div>
        <div className="user-area">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <span>{user.name}</span>
          <button className="logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">TASK MANAGEMENT</p>
            <h1>Your tasks, organized.</h1>
            <p>Create, update, track and complete your tasks from one dashboard.</p>
          </div>
        </section>

        <section className="stats">
          <div><span>Total</span><strong>{stats.total}</strong></div>
          <div><span>Pending</span><strong>{stats.pending}</strong></div>
          <div><span>In Progress</span><strong>{stats.progress}</strong></div>
          <div><span>Completed</span><strong>{stats.completed}</strong></div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>{editingId ? "Edit Task" : "Create New Task"}</h2>
            {editingId && <button className="text-btn" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
          </div>

          <form className="task-form" onSubmit={submitTask}>
            <label>
              Title
              <input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Finish internship project" />
            </label>
            <label>
              Description
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add task details..." />
            </label>
            <div className="form-grid">
              <label>Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Pending</option><option>In Progress</option><option>Completed</option>
                </select>
              </label>
              <label>Priority
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </label>
              <label>Due date
                <input type="date" value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </label>
            </div>
            <button className="primary" disabled={loading}>
              {editingId ? "Update Task" : "Add Task"}
            </button>
          </form>
        </section>

        <section className="tasks-section">
          <div className="section-head">
            <h2>My Tasks</h2>
            <div className="controls">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option>
              </select>
            </div>
          </div>

          {message && <div className="alert">{message}</div>}

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">✓</div>
                <h3>No tasks found</h3>
                <p>Create a task above to get started.</p>
              </div>
            ) : filteredTasks.map((task) => (
              <article className="task-card" key={task._id}>
                <div className="task-main">
                  <div className={`status-dot ${task.status.replace(" ", "-").toLowerCase()}`}></div>
                  <div>
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <div className="meta">
                      <span className={`badge ${task.status.replace(" ", "-").toLowerCase()}`}>{task.status}</span>
                      <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority} priority</span>
                      {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <button onClick={() => editTask(task)}>Edit</button>
                  <button className="danger" onClick={() => deleteTask(task._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
