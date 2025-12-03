import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  logout,
  selectCurrentUser,
  updateProfile,
  updateAvatar,
  updateHeadline,
} from "../../features/auth/authSlice";
import { resetArticles } from "../../features/articles/articlesSlice";

const Profile = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();

  const [headline, setHeadline] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    // Initialize form with current user data
    setHeadline(currentUser.headline || "");
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
    setZipcode(currentUser.zipcode || "");
  }, [currentUser, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Accept various phone formats
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const validateZipcode = (zipcode: string) => {
    const zipcodeRegex = /^\d{5}(-\d{4})?$/;
    return zipcodeRegex.test(zipcode);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (email && !validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (phone && !validatePhone(phone)) {
      setError("Invalid phone format");
      return;
    }

    if (zipcode && !validateZipcode(zipcode)) {
      setError("Zipcode must be 5 digits");
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== passwordConfirm) {
        setError("Passwords do not match");
        return;
      }
    }

    if (headline !== currentUser?.headline) {
      dispatch(updateHeadline(headline));
    }

    dispatch(
      updateProfile({
        email: email !== currentUser?.email ? email : undefined,
        phone: phone !== currentUser?.phone ? phone : undefined,
        zipcode: zipcode !== currentUser?.zipcode ? zipcode : undefined,
        password: password ? password : undefined,
      })
    );
    setSuccess("Profile updated successfully!");

    // Clear password fields
    setPassword("");
    setPasswordConfirm("");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      dispatch(updateAvatar(formData));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetArticles());
    navigate("/");
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1>RiceBook</h1>
          <div className="navbar-user">
            <img
              src={currentUser.avatar || "https://via.placeholder.com/50"}
              alt={currentUser.username}
              className="navbar-avatar"
            />
            <span>{currentUser.username}</span>
            <button
              onClick={() => navigate("/main")}
              className="btn btn-secondary"
            >
              Main
            </button>
            <button onClick={handleLogout} className="btn btn-logout">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="profile-content">
        <h2>Edit Profile</h2>

        <div className="profile-layout">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <h3>Profile Picture</h3>
            <img
              src={currentUser.avatar || "https://via.placeholder.com/150"}
              alt={currentUser.username}
              className="profile-picture"
            />
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/*";
                fileInput.onchange = (ev) => handleAvatarUpload(ev as any);
                fileInput.click();
              }}
            >
              📷 Upload New Picture
            </button>
          </div>

          {/* Profile Information Form */}
          <div className="profile-form-section">
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={currentUser.username}
                  disabled
                  className="form-control disabled"
                />
                <small>Username cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="headline">Headline</label>
                <input
                  type="text"
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="form-control"
                  placeholder="Your headline"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  placeholder="123-456-7890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipcode">Zipcode</label>
                <input
                  type="text"
                  id="zipcode"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  className="form-control"
                  placeholder="12345"
                  maxLength={5}
                />
              </div>

              <hr />

              <h3>Change Password</h3>
              <small>Leave blank to keep current password</small>

              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="form-group">
                <label htmlFor="passwordConfirm">Confirm New Password</label>
                <input
                  type="password"
                  id="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="form-control"
                  placeholder="Re-enter new password"
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/main")}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Profile
                </button>
              </div>
            </form>

            {/* Account Linking Section (COMP 531) */}
            <div
              className="account-linking-section"
              style={{
                marginTop: "30px",
                borderTop: "1px solid #eee",
                paddingTop: "20px",
              }}
            >
              <h3>Account Linking</h3>
              <p>Link your account with Google to login with either method.</p>
              <button
                className="btn"
                style={{ backgroundColor: "#db4437", color: "white" }}
                onClick={() =>
                  (window.location.href = "http://localhost:3000/auth/google")
                }
              >
                Link Google Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
