import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Landing from "./components/auth/Landing";
import Main from "./components/main/Main";
import Profile from "./components/profile/Profile";
import { User, fetchUsers } from "./services/api";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from JSON Placeholder
    const loadUsers = async () => {
      try {
        const loadedUsers = await fetchUsers();
        setUsers(loadedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={<Landing users={users} onLogin={handleLogin} />}
          />
          <Route
            path="/main"
            element={
              currentUser ? (
                <Main
                  currentUser={currentUser}
                  users={users}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              currentUser ? (
                <Profile currentUser={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
