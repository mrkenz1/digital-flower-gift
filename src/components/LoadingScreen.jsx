import { motion } from "framer-motion";

function LoadingScreen() {
  const petals = Array.from({ length: 28 }, (_, index) => index);

  return (
    <motion.section
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="loading-paper-field" aria-hidden="true">
        <span className="loading-cloud cloud-a" />
        <span className="loading-cloud cloud-b" />
        <span className="loading-cloud cloud-c" />
        <span className="loading-heart heart-a" />
        <span className="loading-heart heart-b" />
        <span className="loading-heart heart-c" />
      </div>

      <div className="loading-flower-field" aria-hidden="true">
        {petals.map((petal) => (
          <span
            key={petal}
            className="loading-petal"
            style={{
              "--delay": `${petal * 0.08}s`,
              "--x": `${(petal % 9) * 12 - 48}vw`,
              "--y": `${Math.floor(petal / 9) * 13 - 18}vh`,
              "--r": `${(petal % 6) * 12 - 30}deg`,
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
        <div className="loading-envelope" aria-hidden="true">
          <div className="envelope-paper">
            <span />
            <span />
            <span />
          </div>
          <div className="envelope-body">
            <div className="envelope-flap" />
            <div className="envelope-sprig">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="envelope-seal" />
          </div>
        </div>

        <p>Чамд зориулсан жижигхэн ертөнцийг нээж байна...</p>
      </motion.div>
    </motion.section>
  );
}

export default LoadingScreen;
