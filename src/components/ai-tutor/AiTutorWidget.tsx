import { useState, useEffect } from "react";
import { AiTutorButton } from "./AiTutorButton";
import { AiTutorPanel } from "./AiTutorPanel";
import "./AiTutor.css";

export function AiTutorWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <AiTutorButton isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      <AiTutorPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
