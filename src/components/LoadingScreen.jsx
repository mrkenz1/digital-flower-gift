import { motion } from "framer-motion";

function LoadingScreen() {
  const particles = Array.from({ length: 22 }, (_, index) => index);

  return (
    <motion.section
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="loading-field">
        {particles.map((particle) => (
          <span
            key={particle}
            className="loading-particle"
            style={{
              "--delay": `${particle * 0.17}s`,
              "--x": `${(particle % 7) * 14 - 42}vw`,
              "--y": `${Math.floor(particle / 7) * 18 - 24}vh`,
            }}
          />
        ))}
      </div>
      <motion.div
        className="loading-core"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.8 }}
      >
        <div className="loading-ring" />
        <p>Чамд зориулсан жижигхэн ертөнцийг нээж байна...</p>
      </motion.div>
    </motion.section>
  );
}

export default LoadingScreen;
