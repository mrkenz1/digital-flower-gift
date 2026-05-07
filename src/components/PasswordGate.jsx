import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";

// Replace "0217" with the real birthday password if you want to change it.
// This is a simple client-side password gate for a romantic gift website, not a high-security login system.
const CORRECT_PASSWORD = "0217";

function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password.trim() === CORRECT_PASSWORD) {
      setHasError(false);
      onUnlock();
      return;
    }

    setHasError(true);
  };

  return (
    <motion.section
      className="gate-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="gate-atmosphere" />
      <div className="gate-lines" />

      <motion.form
        className="password-card"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="card-orbit" />
        <div className="gate-icon-wrap" aria-hidden="true">
          <LockKeyhole size={24} />
        </div>

        <div className="gate-copy">
          <span className="eyebrow">Дэлгэрмаад</span>
          <h1>Нууц ертөнц</h1>
          <p>Чамд зориулсан гэрэлт ертөнц .</p>
        </div>

        <label className="password-label" htmlFor="password">
          Нууц үг
        </label>
        <div className="input-shell">
          <input
            id="password"
            value={password}
            type="password"
            autoComplete="off"
            inputMode="text"
            placeholder="таалда"
            onChange={(event) => {
              setPassword(event.target.value);
              setHasError(false);
            }}
          />
          <Sparkles size={18} aria-hidden="true" />
        </div>

        <p className="password-hint">Hint (чиний төрсөн өдөр)</p>

        <AnimatePresence>
          {hasError && (
            <motion.p
              className="password-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              role="alert"
            >
              Нууц үг буруу байна. Дахин оролдоно уу.
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          className="open-button"
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
        >
          Нээх
        </motion.button>
      </motion.form>
    </motion.section>
  );
}

export default PasswordGate;
