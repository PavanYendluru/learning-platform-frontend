import { useRef, type KeyboardEvent, type ClipboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const digits = [
    value[0] ?? "",
    value[1] ?? "",
    value[2] ?? "",
    value[3] ?? "",
  ];

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char.slice(-1);
    const newOtp = newDigits.join("");
    onChange(newOtp);

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    onChange(pasted);
    const targetIdx = Math.min(pasted.length, 3);
    inputRefs[targetIdx].current?.focus();
  }

  return (
    <div className="otp-container">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={inputRefs[idx]}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={idx === 0}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="otp-digit"
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}
