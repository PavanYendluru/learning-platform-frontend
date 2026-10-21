import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  disabled?: boolean;
}

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
  minLength = 8,
  required = true,
  disabled = false,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="password-input-wrapper">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          disabled={disabled}
        />
        <button
          type="button"
          tabIndex={-1}
          className="password-toggle-btn"
          onClick={() => setShow((prev) => !prev)}
          title={show ? "Hide password" : "Show password"}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
