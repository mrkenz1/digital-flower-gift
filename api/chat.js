const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5-mini";
const MAX_MESSAGE_LENGTH = 1400;
const MAX_HISTORY_ITEMS = 10;

const SYSTEM_PROMPT = `
You are a warm Mongolian AI guide inside a premium digital flower gift website.
Reply in Mongolian unless the user clearly asks for another language.
Keep answers short, kind, useful, and emotionally gentle.
You can explain the rose, tulip, lily, QR code, music button, password gate, and the message modal.
Do not claim you can change the website by yourself. If the user asks for code changes, tell them to ask the site creator.
`;

function setCorsHeaders(response) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .slice(-MAX_HISTORY_ITEMS)
    .map((message) => ({
      role: message.role,
      text: String(message.text || "").slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.text.trim().length > 0);
}

function buildConversationPrompt(messages) {
  const transcript = messages
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.text}`)
    .join("\n");

  return `Conversation so far:\n${transcript}\n\nReply to the latest user message.`;
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const textParts = [];

  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join("\n").trim();
}

export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
    return;
  }

  try {
    const messages = normalizeMessages(request.body?.messages);

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      response.status(400).json({ error: "A latest user message is required." });
      return;
    }

    const openAiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions: SYSTEM_PROMPT,
        input: buildConversationPrompt(messages),
        max_output_tokens: 420,
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: data?.error?.message || "OpenAI API request failed.",
      });
      return;
    }

    const reply = extractOutputText(data);

    response.status(200).json({
      reply: reply || "Уучлаарай, одоогоор хариу гарсангүй. Дахин оролдоорой.",
    });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
}
