import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  login,
  register,
  resetAuthErrors,
  selectCurrentUser,
  selectLoginError,
  selectRegistrationError,
  selectUsers,
} from "../../features/auth/authSlice";

const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const currentUser = useAppSelector(selectCurrentUser);
  const loginError = useAppSelector(selectLoginError);
  const registrationError = useAppSelector(selectRegistrationError);

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regZipcode, setRegZipcode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState<string>("");

  const suggestedUsernames = useMemo(
    () =>
      users
        .slice(0, 5)
        .map((user) => user.username)
        .join(", "),
    [users]
  );

  useEffect(() => {
    if (currentUser) {
      navigate("/main");
    }
  }, [currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(resetAuthErrors());
    dispatch(login({ username: loginUsername, password: loginPassword }));
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
    setRegistrationMessage("");
    dispatch(resetAuthErrors());

    // Validation
    if (!regName || regName.length < 2) {
      setRegistrationMessage("Name must be at least 2 characters");
      return;
    }

    if (!validateEmail(regEmail)) {
      setRegistrationMessage("Invalid email format");
      return;
    }

    if (!validatePhone(regPhone)) {
      setRegistrationMessage("Phone must be in format: 123-456-7890");
      return;
    }

    if (!validateZipcode(regZipcode)) {
      setRegistrationMessage("Zipcode must be 5 digits");
      return;
    }

    if (regPassword.length < 6) {
      setRegistrationMessage("Password must be at least 6 characters");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegistrationMessage("Passwords do not match");
      return;
    }

    dispatch(
      register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        zipcode: regZipcode,
        password: regPassword,
      })
    );
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
              <small>Try: {suggestedUsernames || "loading users..."}</small>
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
            {(registrationMessage || registrationError) && (
              <div className="error-message">
                {registrationMessage || registrationError}
              </div>
            )}
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
