

import { useEffect, useState } from "react";

export default function App() {
  const [article, setArticle] = useState("");
  const [summary, setSummary] = useState("");
  const [factCheck, setFactCheck] = useState("");
  const [loading, setLoading] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState("");

  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("groq_api_key");
    if (saved) setApiKey(saved);
  }, []);

  function saveKey() {
    if (!tempKey.trim()) return;
    localStorage.setItem("groq_api_key", tempKey.trim());
    setApiKey(tempKey.trim());
    setTempKey("");
    setShowKeyModal(false);
  }

  async function analyzeArticle() {
    if (!article.trim()) return;

    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }

    setLoading(true);
    setSummary("");
    setFactCheck("");
    setError("");

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content:
                  "You are a professional climate journalist and fact-checker. Be neutral, careful and concise.",
              },
              {
                role: "user",
                content: `
Analyze the following climate or environmental news article.

Return your answer in this exact format:

SUMMARY:
- bullet points

FACT CHECK:
For each main claim:
- Claim:
- Assessment: (well-supported / questionable / potentially misleading)
- Short explanation

ARTICLE:
${article}
`,
              },
            ],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Groq request failed");
      }

      const text = data.choices[0].message.content;

      const summaryMatch = text.match(/SUMMARY:([\s\S]*?)FACT CHECK:/i);
      const factMatch = text.match(/FACT CHECK:([\s\S]*)/i);

      setSummary(summaryMatch ? summaryMatch[1].trim() : "");
      setFactCheck(factMatch ? factMatch[1].trim() : "");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  function parseFactChecks(text) {
    if (!text) return [];

    const blocks = text.split(/- Claim:/i).slice(1);

    return blocks.map((block) => {
      const claimMatch = block.match(/^(.*?)(- Assessment:|$)/s);
      const assessmentMatch = block.match(/- Assessment:\s*(.*)/i);
      const explanationMatch = block.match(/- Short explanation:\s*(.*)/is);

      return {
        claim: claimMatch?.[1]?.trim() || "",
        assessment: assessmentMatch?.[1]?.trim() || "",
        explanation: explanationMatch?.[1]?.trim() || "",
      };
    });
  }

  function getAssessmentStyle(a) {
    const val = a.toLowerCase();

    if (val.includes("well")) {
      return {
        badge: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
        emoji: "✅",
      };
    }

    if (val.includes("question")) {
      return {
        badge: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
        emoji: "⚠️",
      };
    }

    return {
      badge: "bg-red-400/20 text-red-300 border-red-400/40",
      emoji: "❌",
    };
  }

  const facts = parseFactChecks(factCheck);

  const well = facts.filter((f) =>
    f.assessment.toLowerCase().includes("well")
  ).length;

  const questionable = facts.filter((f) =>
    f.assessment.toLowerCase().includes("question")
  ).length;

  const misleading = facts.length - well - questionable;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 ">

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md text-white shadow-2xl">
            <h2 className="text-lg font-semibold mb-3 text-red-300">
              API Error
            </h2>

            <p className="text-sm text-white/80 whitespace-pre-wrap">
              {error}
            </p>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md text-white shadow-2xl">
            <h2 className="text-lg font-semibold mb-3">
              Add your Groq API key
            </h2>

            <input
              type="password"
              placeholder="gsk_..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full rounded-lg bg-white/20 border border-white/30 p-2 outline-none placeholder-white/60"
            />

            <p className="text-xs mt-2 text-white/70">
              Stored locally in your browser only.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-sm text-white/80"
              >
                Cancel
              </button>

              <button
                onClick={saveKey}
                className="px-4 py-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-white font-medium"
              >
                Save key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="w-full max-w-5xl rounded-3xl p-8 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] text-white space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-wide">
            Climate News – AI Summarizer & Fact Checker
          </h1>

          <button
            onClick={() => setShowKeyModal(true)}
            className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {apiKey ? "Change API key" : "Add API key"}
          </button>
        </div>

        <textarea
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          placeholder="Paste a climate or environmental news article..."
          className="w-full h-56 rounded-xl bg-white/10 border border-white/20 p-4 outline-none placeholder-white/60 resize-none"
        />

        <button
          onClick={analyzeArticle}
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Analyze article"}
        </button>

        {(summary || facts.length > 0) && (
          <div className="space-y-6 pt-4">

            {/* SUMMARY */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
              <h2 className="font-semibold mb-3 text-emerald-300">
                🌍 Article Summary
              </h2>

              <div className="text-sm whitespace-pre-line text-white/90">
                {summary}
              </div>
            </div>

            {/* FACTS */}
            <div className="grid md:grid-cols-2 gap-6">
              {facts.map((item, i) => {
                const style = getAssessmentStyle(item.assessment);

                return (
                  <div
                    key={i}
                    className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${style.badge}`}
                      >
                        {style.emoji} {item.assessment}
                      </span>

                      <span className="text-xs text-white/40">
                        Claim #{i + 1}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-sky-200 mb-1">
                        🧾 Claim
                      </p>
                      <p className="text-sm text-white/90">
                        {item.claim}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-200 mb-1">
                        🔍 Explanation
                      </p>
                      <p className="text-sm text-white/80">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONCLUSION */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-yellow-400/10 border border-white/20 rounded-2xl p-5">
              <h2 className="font-semibold mb-3 text-emerald-300">
                📌 Overall conclusion
              </h2>

              <ul className="text-sm space-y-2 text-white/90">
                <li>
                  ✅ <span className="text-emerald-300">{well}</span> claims are well supported.
                </li>
                <li>
                  ⚠️ <span className="text-yellow-300">{questionable}</span> claims need additional verification.
                </li>
                <li>
                  ❌ <span className="text-red-300">{misleading}</span> claims may be misleading.
                </li>
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}