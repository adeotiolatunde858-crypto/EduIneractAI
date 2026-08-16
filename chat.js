/**
 * EduInteractAI chat widget backend — Vercel serverless function
 * -----------------------------------------------------------------
 * Deploys as a single free-tier Vercel function at:
 *   https://<your-project>.vercel.app/api/chat
 *
 * The widget's browser code calls THIS endpoint. This function is the
 * only place your Anthropic API key ever exists, it lives in Vercel's
 * environment variables, never in code, never in the browser.
 *
 * SETUP (see README-deploy.md for the full walkthrough):
 * 1. Push this folder to a GitHub repo (or drag-drop into Vercel).
 * 2. Import the repo in vercel.com, it auto-detects /api/chat.js.
 * 3. In Vercel: Project Settings -> Environment Variables, add
 *    ANTHROPIC_API_KEY = <your real key from console.anthropic.com>
 * 4. Deploy. Your endpoint is https://<project>.vercel.app/api/chat
 * 5. In the widget file, set EAI_ENDPOINT to that full URL.
 * 6. Update ALLOWED_ORIGIN below to your real site domain before
 *    going live, this stops other sites from using your API key
 *    through your endpoint.
 */

const ALLOWED_ORIGIN = "https://www.eduinteractai.org"; // <-- change if your live domain differs

const SYSTEM_PROMPT = `
You are the EduInteractAI Digital Hub website assistant. Answer briefly
and warmly, in EduInteractAI's voice: professional, warm, direct,
practical, proudly African. Never use the word "guarantee" about
grades, exam results, income, or publication. Never invent prices,
availability, or delivery times you are not given here. If you do not
know something, say so and point the visitor to WhatsApp
(09133456330) or olatundeadeoti858@gmail.com.

Verified facts you may use:
- EduInteractAI Digital Hub Ltd, RC 1908292, Oyo State, Nigeria.
- Founder: Adeoti Olatunde Micheal, M.Sc. | M.Phil. | Ph.D. Candidate,
  doctoral tuberculosis researcher and bioinformatician.
- Two product tracks: Track A (university-level Microbiology and
  Bioinformatics) and Track B (JAMB, Post-UTME, and NECO Biology).
- Store: om3ga.selar.com, digital products delivered as instant
  downloads after payment.
- We never guarantee grades, exam outcomes, admission, or research
  results.
`;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

    if (messages.length === 0) {
      res.status(400).json({ error: "no_messages" });
      return;
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content }))
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Anthropic API error:", errText);
      res.status(502).json({ error: "upstream_error" });
      return;
    }

    const data = await upstream.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    const reply = textBlock ? textBlock.text : "Sorry, I couldn't generate a reply.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat proxy error:", err);
    res.status(500).json({ error: "server_error" });
  }
};
