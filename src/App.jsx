import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import BackgroundMusic from "./components/BackgroundMusic.jsx";
import ChatGptWidget from "./components/ChatGptWidget.jsx";
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
  const [isControlsHidden, setIsControlsHidden] = useState(false);

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

            <div className={isControlsHidden ? "gallery-ui controls-hidden" : "gallery-ui"} aria-live="polite">
              <p className="gallery-hint" aria-hidden={isControlsHidden}>
                Цэцгэн дээр дарж утгыг нь нээгээрэй
              </p>

              <BackgroundMusic />
              <ChatGptWidget />

              <div className="gallery-actions" aria-hidden={isControlsHidden} inert={isControlsHidden ? "" : undefined}>
                <FlowerSelector selectedFlower={selectedFlower} onSelect={focusFlower} />
                <button
                  type="button"
                  className="final-message-button"
                  onClick={() => setIsMessageOpen(true)}
                  tabIndex={isControlsHidden ? -1 : 0}
                >
                  Зурвас
                </button>
                <button
                  type="button"
                  className="qr-open-button"
                  onClick={() => setIsQrOpen(true)}
                  tabIndex={isControlsHidden ? -1 : 0}
                >
                  QR
                </button>
              </div>

              <button
                type="button"
                className="gallery-panel-toggle"
                onClick={() => setIsControlsHidden((current) => !current)}
                aria-expanded={!isControlsHidden}
              >
                {isControlsHidden ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span>{isControlsHidden ? "Гаргах" : "Нуух"}</span>
              </button>

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
