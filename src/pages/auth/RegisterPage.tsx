import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { OtpInput } from "./components/OtpInput";
import { PasswordField } from "./components/PasswordField";
import { StepIndicator } from "./components/StepIndicator";
import { CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();

  // Wizard state: 1 = Email/Name, 2 = Verify OTP, 3 = Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Resend cooldown timer (3 seconds default per user specification)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // STEP 1: Send OTP
  async function handleSendOtp(e?: FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.sendRegistrationOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      setCooldown(3); // 3 seconds cooldown
      setStep(2);
      setInfoMessage(`We've sent a 4-digit code to ${email.trim()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Verify OTP
  async function handleVerifyOtp(e?: FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setInfoMessage("");

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyRegistrationOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        purpose: "REGISTRATION",
      });
      setVerificationToken(res.data.verificationToken);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  // STEP 3: Complete Registration
  async function handleCompleteRegistration(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.completeRegistration({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        verificationToken,
      });
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP helper
  async function handleResendOtp() {
    if (cooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      await authApi.sendRegistrationOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      setCooldown(3);
      setOtp("");
      setInfoMessage("A new 4-digit code has been sent!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend code.");
    } finally {
      setLoading(false);
    }
  }

  const stepLabels = ["Email", "Verify", "Password", "Done"];

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">LearnHub</p>

        {step < 4 && (
          <>
            <StepIndicator steps={stepLabels} currentStep={step} />
            <h1>
              {step === 1 && "Create your account"}
              {step === 2 && "Enter verification code"}
              {step === 3 && "Set your password"}
            </h1>
            <p>
              {step === 1 && "Start your learning journey. We'll verify your email first."}
              {step === 2 && "Check your inbox for the 4-digit code. Valid for 5 minutes."}
              {step === 3 && "Secure your account with a strong password."}
            </p>
          </>
        )}

        {/* STEP 1: Name and Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label className="auth-field">
              <span>Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                autoComplete="name"
                maxLength={120}
                required
                disabled={loading}
              />
            </label>

            <label className="auth-field">
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Sending code..." : "Send Verification Code"}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        )}

        {/* STEP 2: 4-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="auth-verification-box">
              <span className="auth-email-badge">{email}</span>
              <button
                type="button"
                className="auth-link-button"
                onClick={() => { setStep(1); setError(""); }}
              >
                Change
              </button>
            </div>

            {infoMessage && <p className="auth-info">{infoMessage}</p>}

            <div className="auth-otp-wrapper">
              <label className="auth-field">
                <span>Enter 4-Digit Code</span>
                <OtpInput value={otp} onChange={setOtp} disabled={loading} />
              </label>
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || otp.length !== 4}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="auth-resend-row">
              <button
                type="button"
                className="resend-timer-btn"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} />
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>

              <button
                type="button"
                className="auth-back-link"
                onClick={() => { setStep(1); setError(""); }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set Password */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration}>
            <PasswordField
              label="New Password"
              value={password}
              onChange={setPassword}
              placeholder="Minimum 8 characters"
              disabled={loading}
              minLength={8}
            />

            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter password"
              disabled={loading}
              minLength={8}
            />

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* STEP 4: Registration Success */}
        {step === 4 && (
          <div className="auth-success-view">
            <div className="auth-success-icon-wrap">
              <CheckCircle2 size={54} color="#16a34a" />
            </div>
            <h1>Account Created!</h1>
            <p>Your email has been verified and your account is ready to use.</p>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/login", { replace: true })}
            >
              Proceed to Log in
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
