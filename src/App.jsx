import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import BackgroundMusic from "./components/BackgroundMusic.jsx";
import FlowerInfoPanel from "./components/FlowerInfoPanel.jsx";
import FlowerScene from "./components/FlowerScene.jsx";
import FlowerSelector from "./components/FlowerSelector.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import PasswordGate from "./components/PasswordGate.jsx";
import QRCodeModal from "./components/QRCodeModal.jsx";
import RomanticMessageModal from "./components/RomanticMessageModal.jsx";

const LOADING_DURATION_MS = 2200;

function App() {
  const [phase, setPhase] = useState("gate");
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [openedFlowerInfo, setOpenedFlowerInfo] = useState(null);
  const [focusToken, setFocusToken] = useState(0);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const unlockExperience = useCallback(() => {
    setPhase("loading");
  }, []);

  useEffect(() => {
    if (phase !== "loading") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPhase("gallery");
    }, LOADING_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  const focusFlower = useCallback((flowerId) => {
    setSelectedFlower(flowerId);
    setFocusToken((current) => current + 1);
  }, []);

  const openFlowerInfo = useCallback(
    (flowerId) => {
      focusFlower(flowerId);
      setOpenedFlowerInfo(flowerId);
    },
    [focusFlower],
  );

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        {phase === "gate" && <PasswordGate key="gate" onUnlock={unlockExperience} />}
        {phase === "loading" && <LoadingScreen key="loading" />}
        {phase === "gallery" && (
          <motion.main
            key="gallery"
            className="gallery-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            <FlowerScene
              selectedFlower={selectedFlower}
              openedFlowerInfo={openedFlowerInfo}
              focusToken={focusToken}
              onFlowerOpen={openFlowerInfo}
            />

            <div className="gallery-ui" aria-live="polite">
              <p className="gallery-hint">Цэцгэн дээр дарж утгыг нь нээгээрэй</p>

              <BackgroundMusic />

              <div className="gallery-actions">
                <FlowerSelector selectedFlower={selectedFlower} onSelect={focusFlower} />
                <button
                  type="button"
                  className="final-message-button"
                  onClick={() => setIsMessageOpen(true)}
                >
                  Сүүлийн зурвас
                </button>
                <button type="button" className="qr-open-button" onClick={() => setIsQrOpen(true)}>
                  QR
                </button>
              </div>

              <FlowerInfoPanel
                openedFlowerInfo={openedFlowerInfo}
                onClose={() => setOpenedFlowerInfo(null)}
              />

              <RomanticMessageModal
                isOpen={isMessageOpen}
                onClose={() => setIsMessageOpen(false)}
              />

              <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
