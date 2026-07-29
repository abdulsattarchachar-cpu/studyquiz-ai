// AI helper — supports both Groq (cloud, free tier) and Ollama (local, no API key).
// Switch providers via the AI_PROVIDER env var: "groq" (default) or "ollama".

const PROVIDER = (process.env.AI_PROVIDER || "groq").toLowerCase();

async function callGroqAPI(messages, options) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing. Add it to your .env.local file. Get a free key at https://console.groq.com/keys"
    );
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || "llama-3.3-70b-versatile",
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.max_tokens ?? 1500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callOllamaAPI(messages, options) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || options.ollamaModel || "llama3.1";

  let res;
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.4,
          num_predict: options.max_tokens ?? 1500,
        },
      }),
    });
  } catch (err) {
    throw new Error(
      `Could not reach Ollama at ${baseUrl}. Make sure Ollama is running locally ("ollama serve") and the model is pulled ("ollama pull ${model}"). Original error: ${err.message}`
    );
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.message?.content?.trim() || "";
}

export async function callGroq(messages, options = {}) {
  if (PROVIDER === "ollama") {
    return callOllamaAPI(messages, options);
  }
  return callGroqAPI(messages, options);
}

// --- Vision (image understanding) — used by the AI Math Tutor's "upload a photo" mode ---
// NOTE: vision-capable model availability changes over time on both Groq and Ollama.
// Override the defaults below via GROQ_VISION_MODEL / OLLAMA_VISION_MODEL env vars if needed.

async function callGroqVisionAPI(prompt, imageBase64, options) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env.local file.");
  }
  const model = process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 1500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Groq vision error (${res.status}): ${errText}. The configured vision model ("${model}") may no longer be available — check https://console.groq.com/docs/models and set GROQ_VISION_MODEL to a current vision-capable model.`
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callOllamaVisionAPI(prompt, imageBase64, options) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_VISION_MODEL || "llava";

  let res;
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt, images: [imageBase64] }],
        stream: false,
        options: {
          temperature: options.temperature ?? 0.3,
          num_predict: options.max_tokens ?? 1500,
        },
      }),
    });
  } catch (err) {
    throw new Error(
      `Could not reach Ollama at ${baseUrl} for vision. Make sure a vision model is pulled ("ollama pull ${model}"). Original error: ${err.message}`
    );
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama vision error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.message?.content?.trim() || "";
}

export async function callVision(prompt, imageBase64, options = {}) {
  if (PROVIDER === "ollama") {
    return callOllamaVisionAPI(prompt, imageBase64, options);
  }
  return callGroqVisionAPI(prompt, imageBase64, options);
}

export function jsonSafeParse(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
