import { AnimatePresence, motion } from "framer-motion";
import { Copy, QrCode, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createQrMatrix } from "../utils/qrCode.js";

function QRCodeModal({ isOpen, onClose }) {
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPageUrl(window.location.href);
    setCopied(false);
  }, [isOpen]);

  const qrMatrix = useMemo(() => {
    if (!pageUrl) {
      return null;
    }

    return createQrMatrix(pageUrl);
  }, [pageUrl]);

  const copyUrl = async () => {
    if (!pageUrl) {
      return;
    }

    await navigator.clipboard?.writeText(pageUrl);
    setCopied(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="qr-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="qr-modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            aria-label="QR код"
          >
            <button type="button" className="modal-close-button" onClick={onClose}>
              <X size={16} />
              <span>Хаах</span>
            </button>

            <div className="qr-modal-header">
              <span className="qr-icon-wrap">
                <QrCode size={24} />
              </span>
              <div>
                <span className="panel-kicker">Digital Flower Gift</span>
                <h2>QR код</h2>
              </div>
            </div>

            <div className="qr-frame">
              {qrMatrix && <QrSvg matrix={qrMatrix} />}
            </div>

            <p className="qr-url">{pageUrl}</p>

            <button type="button" className="qr-copy-button" onClick={copyUrl}>
              <Copy size={16} />
              {copied ? "Хуулагдлаа" : "Линк хуулах"}
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QRCodeModal;

function QrSvg({ matrix }) {
  const quietZone = 4;
  const viewBoxSize = matrix.size + quietZone * 2;

  return (
    <svg className="qr-svg" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} role="img" aria-label="Энэ сайтын QR код">
      <rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" rx="1.8" />
      {matrix.modules.map((row, y) =>
        row.map((value, x) =>
          value ? (
            <rect
              key={`${x}-${y}`}
              x={x + quietZone}
              y={y + quietZone}
              width="1"
              height="1"
              fill="#20243f"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
