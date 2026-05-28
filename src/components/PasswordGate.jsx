import { AnimatePresence, motion } from "framer-motion";
import { Delete, LockKeyhole } from "lucide-react";
import { useState } from "react";

// Replace "0217" with the real birthday password if you want to change it.
// This is a simple client-side password gate for a romantic gift website, not a high-security login system.
const CORRECT_PASSWORD = "0217";
const MAX_PASSWORD_LENGTH = CORRECT_PASSWORD.length;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

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
    if (isUnlocking) {
      return;
    }

    setHasError(false);

    if (key === "clear") {
      setPassword("");
      return;
    }

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
      <div className="gate-dream-field" aria-hidden="true">
        <span className="gate-cloud cloud-one" />
        <span className="gate-cloud cloud-two" />
        <span className="gate-cloud cloud-three" />
        <span className="gate-heart heart-one" />
        <span className="gate-heart heart-two" />
        <span className="gate-heart heart-three" />
        <span className="gate-moon" />
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
          <div className="gate-lock-heart">
            <LockKeyhole size={34} />
          </div>
          <span className="gate-key" />
        </div>

        <div className="gate-copy">
          <span className="eyebrow">From: Zaya</span>
          <h1>For You</h1>
          <p>Нууц ертөнцийг нээх жижиг түлхүүр</p>
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
              className="password-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              role="alert"
            >
              Нууц үг буруу байна. Дахин оролдоно уу.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="gate-keypad" aria-label="Password keypad">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={key === "clear" || key === "back" ? "gate-keypad-button utility" : "gate-keypad-button"}
              onClick={() => handleKeyPress(key)}
              aria-label={key === "clear" ? "Clear password" : key === "back" ? "Delete last number" : `Number ${key}`}
            >
              {key === "clear" && "×"}
              {key === "back" && <Delete size={15} aria-hidden="true" />}
              {key !== "clear" && key !== "back" && key}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

export default PasswordGate;
