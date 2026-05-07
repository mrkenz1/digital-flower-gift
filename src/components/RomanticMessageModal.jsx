import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const FINAL_MESSAGE = `Энэ жижигхэн дижитал цэцгийн ертөнц бол чамд зориулагдсан.
Чамайг харах бүрт төрдөг мэдрэмжээ үгээр бүгдийг нь хэлж чаддаггүй ч,
энэ цэцгүүд миний оронд багахан ч гэсэн илэрхийлж чадна гэж найдаж байна.

Чи миний хувьд онцгой шүү<3.`;

function RomanticMessageModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="message-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="message-modal"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="зурвас"
          >
            <button type="button" className="modal-close-button" onClick={onClose}>
              <X size={18} aria-hidden="true" />
              <span>Хаах</span>
            </button>
            <span className="panel-kicker">Final Signal</span>
            <h2>зурвас</h2>
            <p>{FINAL_MESSAGE}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RomanticMessageModal;
