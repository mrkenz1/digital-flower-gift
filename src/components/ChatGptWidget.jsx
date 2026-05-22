import { AnimatePresence, motion } from "framer-motion";
import { SendHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STARTER_MESSAGES = [
  {
    role: "assistant",
    text:
      "Сайн уу. Би энэ цэцгийн ертөнцийн жижиг AI туслах. Цэцгийн утга, QR, хөгжим, зурвас гээд асууж болно.",
  },
];

// GitHub Pages cannot safely store API keys. Set this to your backend URL:
// VITE_CHAT_API_URL=https://your-backend.vercel.app/api/chat
const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL || "";

function getLocalReply(message) {
  const text = message.toLowerCase();

  if (text.includes("api") || text.includes("chatgpt") || text.includes("үнэгүй") || text.includes("holbo")) {
    return "Жинхэнэ ChatGPT API-г frontend дээр шууд хийхгүй. API key ил харагдах учраас backend/serverless endpoint хэрэгтэй. Одоо код нь endpoint байвал OpenAI API руу холбогдохоор бэлэн болсон.";
  }

  if (text.includes("сарнай") || text.includes("rose")) {
    return "Сарнай нь хайр, үнэнч сэтгэл, гүн мэдрэмжийг илэрхийлдэг. Цэцгэн дээр дарвал тайлбар нь нээгдэнэ.";
  }

  if (text.includes("алтанзул") || text.includes("tulip")) {
    return "Алтанзул нь зөөлөн хайр, нандин дотно мэдрэмжийг илэрхийлдэг. Доорх сонголтоор фокус хийж, цэцгэн дээр дарж дэлгэрэнгүйг нь уншаарай.";
  }

  if (text.includes("лили") || text.includes("lily")) {
    return "Лили нь эрхэмсэг гоо сайхан, хүндлэл, цэвэр мэдрэмжийн бэлгэдэл. Ягаан дэлбээ, ногоон иштэй хэсгийг дарж мэдээллийг нь нээж болно.";
  }

  if (text.includes("qr")) {
    return "Доод талын QR товчийг дарвал live link-ийн QR гарна. Тэндээс QR зургаа татаж авч болно.";
  }

  if (text.includes("зурвас") || text.includes("message")) {
    return "Зурвас товчийг дарвал урт захиа modal дээр нээгдэнэ. Текст нь дотроо scroll хийж уншигдана.";
  }

  if (text.includes("дуу") || text.includes("music") || text.includes("хөгжим")) {
    return "Баруун дээд талын хөгжимний товчоор дуугаа play, pause, mute хийж болно.";
  }

  return "Ойлголоо. Одоогоор endpoint тохируулаагүй үед би demo горимоор цэцэг, QR, хөгжим, зурвасын тухай товч тусална.";
}

async function requestChatReply(messages) {
  if (!CHAT_API_URL) {
    throw new Error("Chat API endpoint is not configured.");
  }

  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "AI API request failed.");
  }

  if (!data?.reply) {
    throw new Error("AI API response did not include a reply.");
  }

  return data.reply;
}

function OpenAiMark() {
  return (
    <svg className="openai-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5907 8.3829 14.6108 7.2144a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChatGptWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(STARTER_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const userMessage = { role: "user", text: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setIsLoading(true);

    try {
      const reply = await requestChatReply(nextMessages);
      setMessages((current) => [...current, { role: "assistant", text: reply }]);
    } catch (error) {
      const fallbackReply = CHAT_API_URL
        ? `API алдаа гарлаа: ${error instanceof Error ? error.message : "дахин оролдоорой."}`
        : getLocalReply(trimmed);

      setMessages((current) => [...current, { role: "assistant", text: fallbackReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      <div className="button-container">
        <button
          type="button"
          className="brutalist-button openai button-1 ai-launch-button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-label="AI chatbot"
        >
          <div className="openai-logo">
            <OpenAiMark />
          </div>
          <div className="button-text">
            <span>Ask</span>
            <span>AI Guide</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            className="ai-chat-panel"
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-label="AI chatbot panel"
          >
            <header className="ai-chat-header">
              <div>
                <span>Flower AI</span>
                <strong>Chat guide</strong>
                <small>{CHAT_API_URL ? "OpenAI API ready" : "Demo mode"}</small>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close AI chat">
                <X size={17} />
              </button>
            </header>

            <div ref={scrollRef} className="ai-chat-messages" aria-live="polite">
              {messages.map((message, index) => (
                <p key={`${message.role}-${index}`} className={`ai-chat-bubble ${message.role}`}>
                  {message.text}
                </p>
              ))}
              {isLoading && <p className="ai-chat-bubble assistant thinking">AI бодож байна...</p>}
            </div>

            <div className="ai-chat-prompts">
              {["Сарнай", "QR", "Зурвас"].map((prompt) => (
                <button key={prompt} type="button" onClick={() => setDraft(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <form className="ai-chat-form" onSubmit={sendMessage}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Асуух зүйлээ бич..."
                aria-label="AI chat message"
                disabled={isLoading}
              />
              <button type="submit" aria-label="Send message" disabled={isLoading}>
                <SendHorizontal size={17} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatGptWidget;
