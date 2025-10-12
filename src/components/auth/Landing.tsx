import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";
import { User } from "../../services/api";

interface LandingProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Landing = ({ users, onLogin }: LandingProps) => {
  const navigate = useNavigate();

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regZipcode, setRegZipcode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regError, setRegError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Find user by username
    const user = users.find((u) => u.username === loginUsername);

    if (!user) {
      setLoginError("User not found");
      return;
    }

    // Password is the street name for JSON placeholder users
    if (loginPassword !== user.address.street) {
      setLoginError("Invalid password");
      return;
    }

    onLogin(user);
    navigate("/main");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateZipcode = (zipcode: string) => {
    const zipcodeRegex = /^\d{5}$/;
    return zipcodeRegex.test(zipcode);
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    // Validation
    if (!regName || regName.length < 2) {
      setRegError("Name must be at least 2 characters");
      return;
    }

    if (!validateEmail(regEmail)) {
      setRegError("Invalid email format");
      return;
    }

    if (!validatePhone(regPhone)) {
      setRegError("Phone must be in format: 123-456-7890");
      return;
    }

    if (!validateZipcode(regZipcode)) {
      setRegError("Zipcode must be 5 digits");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError("Passwords do not match");
      return;
    }

    // Create new user object (not persistent for this assignment)
    const newUser: User = {
      id: users.length + 1,
      name: regName,
      username: regName.toLowerCase().replace(/\s/g, ""),
      email: regEmail,
      address: {
        street: regPassword, // Store password as street for consistency
        suite: "",
        city: "",
        zipcode: regZipcode,
      },
      phone: regPhone,
      company: {
        name: "",
        catchPhrase: "New user here!",
      },
    };

    onLogin(newUser);
    navigate("/main");
  };

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>Welcome to RiceBook</h1>
        <p className="tagline">Connect with friends and share your moments</p>
      </div>

      <div className="landing-content">
        {/* Login Section */}
        <div className="login-section">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
              <small>Try: Bret, Antonette, Samantha, etc.</small>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password (street name)"
                required
              />
              <small>Hint: Password is the street name</small>
            </div>
            {loginError && <div className="error-message">{loginError}</div>}
            <button type="submit" className="btn btn-primary">
              Log In
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="divider">
          <span>OR</span>
        </div>

        {/* Registration Section */}
        <div className="registration-section">
          <h2>Create Account</h2>
          <form onSubmit={handleRegistration}>
            <div className="form-group">
              <label htmlFor="reg-name">Display Name</label>
              <input
                type="text"
                id="reg-name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                type="email"
                id="reg-email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-phone">Phone</label>
              <input
                type="tel"
                id="reg-phone"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="123-456-7890"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-zipcode">Zipcode</label>
              <input
                type="text"
                id="reg-zipcode"
                value={regZipcode}
                onChange={(e) => setRegZipcode(e.target.value)}
                placeholder="12345"
                maxLength={5}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                type="password"
                id="reg-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password-confirm">Confirm Password</label>
              <input
                type="password"
                id="reg-password-confirm"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
            {regError && <div className="error-message">{regError}</div>}
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;
