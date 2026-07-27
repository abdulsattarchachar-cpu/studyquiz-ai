// Simple helper to call Groq's OpenAI-compatible chat completions endpoint.
export async function callGroq(messages, options = {}) {
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
