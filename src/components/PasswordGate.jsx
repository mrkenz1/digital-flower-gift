import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// Replace "0217" with the real birthday password if you want to change it.
// This is a simple client-side password gate for a romantic gift website, not a high-security login system.
const CORRECT_PASSWORD = "0217";
const MAX_PASSWORD_LENGTH = CORRECT_PASSWORD.length;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "empty", "0", "back"];

function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const checkPassword = (value) => {
    if (value === CORRECT_PASSWORD) {
      setHasError(false);
      setIsUnlocking(true);
      window.setTimeout(onUnlock, 360);
      return;
    }

    setHasError(true);
    window.setTimeout(() => {
      setPassword("");
    }, 260);
  };

  const handleKeyPress = (key) => {
    if (isUnlocking || key === "empty") {
      return;
    }

    setHasError(false);

    if (key === "back") {
      setPassword((current) => current.slice(0, -1));
      return;
    }

    setPassword((current) => {
      const nextValue = `${current}${key}`.slice(0, MAX_PASSWORD_LENGTH);

      if (nextValue.length === MAX_PASSWORD_LENGTH) {
        window.setTimeout(() => checkPassword(nextValue), 80);
      }

      return nextValue;
    });
  };

  return (
    <motion.section
      className="gate-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="gate-bg-image" aria-hidden="true" />

      <div className="gate-dream-field" aria-hidden="true">
        {["cloud-one", "cloud-two", "cloud-three", "cloud-four", "cloud-five"].map((cloudClass) => (
          <div key={cloudClass} className={`gate-cloud ${cloudClass}`}>
            <div className="puff p1" />
            <div className="puff p2" />
            <div className="puff p3" />
            <div className="cloud-base" />
            <div className="cloud-shade" />
          </div>
        ))}
        {["dot-one", "dot-two", "dot-three", "dot-four", "dot-five", "dot-six"].map((dotClass) => (
          <span key={dotClass} className={`gate-dot ${dotClass}`} />
        ))}
        <span className="gate-heart heart-one" />
        <span className="gate-heart heart-two" />
        <span className="gate-heart heart-three" />
        <span className="gate-flower flower-one" />
        <span className="gate-flower flower-two" />
      </div>

      <motion.div
        className={hasError ? "password-card gate-shake" : "password-card"}
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="gate-lock-illustration" aria-hidden="true">
          <svg className="gate-heart-lock" viewBox="0 0 130 120">
            <path
              d="M65 106 C28 75 12 53 22 30 C31 9 56 14 65 35 C74 14 99 9 108 30 C118 53 102 75 65 106Z"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(74,72,76,0.62)"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <rect
              x="49"
              y="53"
              width="32"
              height="31"
              rx="3"
              fill="rgba(92,90,96,0.65)"
              stroke="rgba(74,72,76,0.62)"
              strokeWidth="2"
            />
            <path
              d="M57 53 V44 C57 34 73 34 73 44 V53"
              fill="none"
              stroke="rgba(92,90,96,0.70)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="65" cy="65" r="4.5" fill="rgba(245,245,245,0.9)" />
            <path d="M65 69 L65 78" stroke="rgba(245,245,245,0.9)" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <svg className="gate-key-icon" viewBox="0 0 100 100">
            <circle cx="28" cy="28" r="15" fill="none" stroke="rgba(74,72,76,0.62)" strokeWidth="8" />
            <path d="M40 40 L82 82" stroke="rgba(74,72,76,0.62)" strokeWidth="8" strokeLinecap="round" />
            <path d="M65 65 L76 54" stroke="rgba(74,72,76,0.62)" strokeWidth="7" strokeLinecap="round" />
            <path d="M75 75 L86 64" stroke="rgba(74,72,76,0.62)" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </div>

        <div className="gate-copy">
          <span className="eyebrow">Дэлгэрмаад</span>
          <h1>For You</h1>
          <p>taalda huurhnu</p>
        </div>

        <div className="password-display" aria-label="Password">
          {Array.from({ length: MAX_PASSWORD_LENGTH }, (_, index) => (
            <span
              key={index}
              className={[
                "password-dot",
                password.length > index ? "filled" : "",
                hasError ? "error" : "",
                isUnlocking ? "success" : "",
              ].join(" ")}
            />
          ))}
        </div>

        <AnimatePresence>
          {hasError && (
            <motion.p
              key="error"
              className="password-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              role="alert"
            >
              Нууц үг буруу байна. Дахин оролдоно уу.
            </motion.p>
          )}
          {isUnlocking && (
            <motion.p
              key="success"
              className="password-success"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              Нээгдлээ
            </motion.p>
          )}
        </AnimatePresence>

        <div className="gate-keypad" aria-label="Password keypad">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={key === "empty" ? "gate-keypad-button empty" : key === "back" ? "gate-keypad-button utility" : "gate-keypad-button"}
              onClick={() => handleKeyPress(key)}
              aria-label={key === "empty" ? "Empty keypad slot" : key === "back" ? "Delete last number" : `Number ${key}`}
              disabled={key === "empty"}
            >
              {key === "back" && "⌫"}
              {key !== "empty" && key !== "back" && key}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

export default PasswordGate;
