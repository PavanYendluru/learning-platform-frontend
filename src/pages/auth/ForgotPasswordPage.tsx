import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { OtpInput } from "./components/OtpInput";
import { PasswordField } from "./components/PasswordField";
import { StepIndicator } from "./components/StepIndicator";
import { CheckCircle2, ArrowLeft, RefreshCw, KeyRound } from "lucide-react";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard state: 1 = Email, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form inputs
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  // STEP 1: Send Password Reset OTP
  async function handleSendOtp(e?: FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.sendPasswordResetOtp({
        email: email.trim().toLowerCase(),
      });
      setCooldown(3);
      setStep(2);
      setInfoMessage(`If an account exists with ${email.trim()}, a 4-digit code has been sent.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code.");
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
      const res = await authApi.verifyPasswordResetOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        purpose: "PASSWORD_RESET",
      });
      setResetToken(res.data.verificationToken);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  // STEP 3: Set New Password
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
      });
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
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
      await authApi.sendPasswordResetOtp({
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

  const stepLabels = ["Email", "Verify", "New Password", "Done"];

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">LearnHub</p>

        {step < 4 && (
          <>
            <StepIndicator steps={stepLabels} currentStep={step} />
            <h1>
              {step === 1 && "Reset your password"}
              {step === 2 && "Enter reset code"}
              {step === 3 && "Create new password"}
            </h1>
            <p>
              {step === 1 && "Enter your registered email and we'll send you a 4-digit code."}
              {step === 2 && "Enter the 4-digit code sent to your email. Valid for 5 minutes."}
              {step === 3 && "Enter your new password below."}
            </p>
          </>
        )}

        {/* STEP 1: Email entry */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label className="auth-field">
              <span>Registered Email Address</span>
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
              {loading ? "Sending code..." : "Send Reset Code"}
            </button>

            <p className="auth-switch">
              Remember your password? <Link to="/login">Log in</Link>
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

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimum 8 characters"
              disabled={loading}
              minLength={8}
            />

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter new password"
              disabled={loading}
              minLength={8}
            />

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? "Updating password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* STEP 4: Reset Success */}
        {step === 4 && (
          <div className="auth-success-view">
            <div className="auth-success-icon-wrap">
              <CheckCircle2 size={54} color="#16a34a" />
            </div>
            <h1>Password Reset Complete!</h1>
            <p>Your password has been securely updated. You can now log in with your new credentials.</p>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/login", { replace: true })}
            >
              <KeyRound size={16} style={{ marginRight: "0.5rem" }} />
              Log In With New Password
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
