import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download, QrCode, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createQrMatrix } from "../utils/qrCode.js";

// Keep the QR pinned to the deployed GitHub Pages URL so it never points to localhost.
const LIVE_SITE_URL = "https://mrkenz1.github.io/digital-flower-gift/";

function QRCodeModal({ isOpen, onClose }) {
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPageUrl(LIVE_SITE_URL);
    setCopied(false);
    setDownloaded(false);
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

  const downloadQr = async () => {
    if (!qrMatrix) {
      return;
    }

    const blob = await createQrPngBlob(qrMatrix);
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "digital-flower-gift-qr.png";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
    setDownloaded(true);
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

            <div className="qr-button-row">
              <button type="button" className="qr-copy-button" onClick={copyUrl}>
                <Copy size={16} />
                {copied ? "Хуулагдлаа" : "Линк хуулах"}
              </button>
              <button type="button" className="qr-download-button" onClick={downloadQr}>
                <Download size={16} />
                {downloaded ? "Татагдлаа" : "QR татах"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function createQrPngBlob(matrix) {
  const quietZone = 4;
  const moduleSize = 18;
  const canvasSize = (matrix.size + quietZone * 2) * moduleSize;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = canvasSize;
  canvas.height = canvasSize;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = "#20243f";

  matrix.modules.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) {
        return;
      }

      context.fillRect(
        (x + quietZone) * moduleSize,
        (y + quietZone) * moduleSize,
        moduleSize,
        moduleSize,
      );
    });
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Could not create QR image."));
    }, "image/png");
  });
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
