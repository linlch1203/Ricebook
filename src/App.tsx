import { useEffect } from "react";
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
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  loadUsers,
  selectAuthStatus,
  selectCurrentUser,
} from "./features/auth/authSlice";

function App() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const authStatus = useAppSelector(selectAuthStatus);

  useEffect(() => {
    if (authStatus === "idle") {
      dispatch(loadUsers());
    }
  }, [authStatus, dispatch]);

  const isAuthResolving = authStatus === "idle" || authStatus === "loading";

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/main"
            element={
              isAuthResolving ? (
                <div className="app-loader">Loading...</div>
              ) : currentUser ? (
                <Main />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthResolving ? (
                <div className="app-loader">Loading...</div>
              ) : currentUser ? (
                <Profile />
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
