import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { flowerById } from "../data/flowers.js";

function FlowerInfoPanel({ openedFlowerInfo, onClose }) {
  const flower = openedFlowerInfo ? flowerById[openedFlowerInfo] : null;

  return (
    <AnimatePresence>
      {flower && (
        <motion.aside
          className="flower-info-panel"
          initial={{ opacity: 0, x: 34, y: 18 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 28, y: 16 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ "--accent": flower.accent, "--glow": flower.glow }}
        >
          <div className="info-panel-glow" />
          <div className="info-panel-header">
            <div>
              <span className="panel-kicker">{flower.englishTitle}</span>
              <h2>{flower.title}</h2>
            </div>
            <button type="button" className="panel-close-button" onClick={onClose}>
              <X size={17} aria-hidden="true" />
              <span>Хаах</span>
            </button>
          </div>

          <div className="info-section meaning-section">
            <span>Утга</span>
            <p>{flower.meaning}</p>
          </div>

          <div className="info-section">
            <span>Романтик мэдрэмж</span>
            <p>{flower.romanticInterpretation}</p>
          </div>

          <div className="info-section">
            <span>Танин мэдэхүйн арчилгаа</span>
            <p>{flower.care}</p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default FlowerInfoPanel;
