import { useState, useRef } from "react";

// ── CONSTANTS ─────────────────────────────────────────────
const WHATSAPP_NUMBER = "972556873811";
const PRODUCT_NAME = "צלחות יווניות לשבירה";
const LANDING_URL = "https://opa-plates.vercel.app/";
const PRICE = "₪280 לארגז";

const IMAGE_PROMPTS = [
  { id: "shatter1", label: "שבירה דרמטית", prompt: "Greek taverna white ceramic plate shattering dramatically on dark stone floor, shards flying, dust explosion, cinematic dramatic lighting, Mediterranean atmosphere, high contrast black background, photorealistic" },
  { id: "shatter2", label: "שברים יווניים", prompt: "Broken white Greek plate pieces scattered on elegant dark marble floor, golden candlelight ambiance, Mediterranean taverna night, artistic overhead shot, luxury aesthetic" },
  { id: "event1", label: "אווירת טברנה", prompt: "Authentic Greek taverna interior night celebration, white plates being smashed, joyful crowd, warm golden lights, blue and white Greek decor, festive Mediterranean atmosphere" },
  { id: "opa1", label: "OPA! מסיבה", prompt: "Jewish bar mitzvah celebration with Greek plate breaking tradition, people cheering OPA, white plates flying, confetti, elegant event hall, warm festive lights, joyful moment" },
  { id: "stack1", label: "ארגז צלחות", prompt: "Stack of pristine white Greek ceramic plates for breaking, elegant product photography, blue and white colors, Mediterranean style, soft studio lighting, white background" },
  { id: "hero1", label: "רגע השבירה", prompt: "Slow motion frozen moment of Greek plate breaking mid-air, perfect shards, dramatic studio lighting, black background, high speed photography aesthetic, white ceramic fragments" },
];

const POST_TYPES = [
  { id: "marketplace", label: "Facebook Marketplace", icon: "🛒", color: "#1877F2" },
  { id: "group_barmitz", label: "קבוצת בר/בת מצווה", icon: "👨‍👩‍👧", color: "#E91E63" },
  { id: "instagram", label: "אינסטגרם + האשטאגים", icon: "📸", color: "#C13584" },
  { id: "organizer", label: "DM למארגנת אירועים", icon: "💼", color: "#9C27B0" },
  { id: "story", label: "סטורי אינסטגרם", icon: "⭕", color: "#FF5722" },
  { id: "reel", label: "קפשן לריל", icon: "🎬", color: "#212121" },
];

const PLATFORMS = [
  { id: "facebook", label: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/create/item", icon: "🛒", color: "#1877F2" },
  { id: "instagram", label: "אינסטגרם", url: "https://www.instagram.com/", icon: "📸", color: "#C13584" },
  { id: "whatsapp", label: "וואטסאפ", url: `https://wa.me/?text=`, icon: "💬", color: "#25D366" },
];

const STEPS = [
  { id: "images", icon: "🎨", title: "שלב 1: תמונות AI", desc: "צור תמונות מקצועיות בלחיצה", done: false },
  { id: "content", icon: "✍️", title: "שלב 2: תוכן שיווקי", desc: "צור פוסטים, קפשנים, האשטאגים", done: false },
  { id: "publish", icon: "📢", title: "שלב 3: פרסום", desc: "פרסם לפלטפורמות השונות", done: false },
  { id: "outreach", icon: "🤝", title: "שלב 4: פנייה ישירה", desc: "מארגנות אירועים ולקוחות", done: false },
];

// ── HELPERS ───────────────────────────────────────────────
function buildImageUrl(prompt, w = 1024, h = 1024) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;
}

async function generateWithClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ── STYLES ────────────────────────────────────────────────
const S = {
  bg: "#0A0E1A",
  card: "#111827",
  cardHover: "#1a2234",
  border: "#1e2d45",
  gold: "#D4A843",
  goldLight: "#F0C84A",
  blue: "#3B82F6",
  green: "#22C55E",
  red: "#EF4444",
  purple: "#A855F7",
  text: "#F1F5F9",
  muted: "#64748B",
  white: "#FFFFFF",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${S.bg}; color: ${S.text}; font-family: 'Heebo', sans-serif; direction: rtl; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${S.gold}40; border-radius: 2px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 ${S.gold}40} 50%{box-shadow:0 0 0 8px ${S.gold}00} }
  .fade { animation: fadeIn 0.3s ease; }
  .tab-btn:hover { color: ${S.gold} !important; background: ${S.border} !important; }
  .card-hover:hover { border-color: ${S.gold}60 !important; transform: translateY(-1px); transition: all 0.2s; }
  .btn-hover:hover { opacity: 0.85; transform: scale(1.02); transition: all 0.15s; }
  textarea:focus, input:focus { outline: none; border-color: ${S.gold}80 !important; }
`;

// ── MAIN APP ──────────────────────────────────────────────
export default function OpaMarketing() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [completedSteps, setCompletedSteps] = useState([]);

  // Images state
  const [selectedPrompt, setSelectedPrompt] = useState(IMAGE_PROMPTS[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageCount, setImageCount] = useState(1);

  // Content state
  const [selectedPostType, setSelectedPostType] = useState(POST_TYPES[0]);
  const [generatedText, setGeneratedText] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [copied, setCopied] = useState(false);

  const TABS = [
    { id: "dashboard", label: "ראשי", icon: "🏠" },
    { id: "images", label: "תמונות AI", icon: "🎨" },
    { id: "content", label: "תוכן", icon: "✍️" },
    { id: "publish", label: "פרסום", icon: "📢" },
    { id: "outreach", label: "פנייה", icon: "🤝" },
  ];

  // ── IMAGE GENERATION ───────────────────────────────────
  async function generateImages() {
    setLoadingImage(true);
    setGeneratedImages([]);
    const prompt = customPrompt || selectedPrompt.prompt;
    const label = selectedPrompt.label || "מותאם אישית";
    const imgs = [];
    for (let i = 0; i < imageCount; i++) {
      // delay between requests to avoid rate limiting
      if (i > 0) await new Promise(r => setTimeout(r, 800));
      imgs.push({
        url: buildImageUrl(prompt),
        id: Date.now() + i,
        prompt: label,
        loaded: false,
        error: false,
      });
      setGeneratedImages([...imgs]);
    }
    setLoadingImage(false);
    if (!completedSteps.includes("images")) setCompletedSteps(p => [...p, "images"]);
  }

  function downloadImage(url, name) {
    window.open(url, "_blank");
  }

  // ── CONTENT GENERATION ────────────────────────────────
  async function generateContent() {
    setLoadingText(true);
    setGeneratedText("");
    const system = `אתה מומחה שיווק ישראלי מנוסה. כתוב תוכן שיווקי אפקטיבי, ישיר, ומושך בעברית. המוצר: ${PRODUCT_NAME}. מחיר: ${PRICE}. קישור: ${LANDING_URL}. כתוב בסגנון חי וכיפי, לא תאגידי.`;

    const prompts = {
      marketplace: `כתוב מודעת מכירה ל-Facebook Marketplace לצלחות שבירה יווניות. כלול: כותרת מושכת, תיאור חוויה, יתרונות, מחיר, קריאה לפעולה עם הלינק. עד 100 מילים.`,
      group_barmitz: `כתוב פוסט לקבוצת פייסבוק של הורים לבר/בת מצווה. מספר סיפור על החוויה, לא מכירתי. כלול קריאה לפעולה עם הלינק בתגובות. עד 80 מילים.`,
      instagram: `כתוב קפשן לאינסטגרם לתמונה של צלחת שבורה. קצר, עם אימוג'ים, קריאה לפעולה. אחרי הקפשן: 20 האשטאגים הכי רלוונטיים בעברית ואנגלית.`,
      organizer: `כתוב DM קצר למארגנת אירועים פרטית. הצע שיתוף פעולה: תספק לה את הצלחות בהנחה מיוחדת. ידידותי, לא מכירתי, מכבד את זמנה. עד 50 מילים.`,
      story: `כתוב 4 גרסאות טקסט קצר לסטורי (כל אחד עד 6 מילים + אימוג'ים). אנרגטי, בוהק. ממוספר.`,
      reel: `כתוב קפשן לריל של שבירת צלחת יוונית. כולל האשטאגים. כיפי ומושך.`,
    };

    const text = await generateWithClaude(system, prompts[selectedPostType.id]);
    setGeneratedText(text);
    setLoadingText(false);
    if (!completedSteps.includes("content")) setCompletedSteps(p => [...p, "content"]);
  }

  function copyText() {
    navigator.clipboard?.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareToWhatsApp() {
    const msg = encodeURIComponent(generatedText);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <div style={{ background: S.bg, minHeight: "100vh", fontFamily: "'Heebo', sans-serif", direction: "rtl" }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{ background: S.card, borderBottom: `1px solid ${S.border}`, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: S.gold, letterSpacing: 1 }}>OPA! מנהל שיווק</div>
          <div style={{ fontSize: 11, color: S.muted, marginTop: 1 }}>צלחות יווניות לשבירה</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: progress === 100 ? S.green : S.gold, fontFamily: "'Cinzel', serif" }}>{progress}%</div>
          <div style={{ fontSize: 10, color: S.muted }}>התקדמות</div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ height: 3, background: S.border }}>
        <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`, transition: "width 0.5s" }} />
      </div>

      {/* TABS */}
      <div style={{ display: "flex", background: S.card, borderBottom: `1px solid ${S.border}`, overflowX: "auto", position: "sticky", top: 53, zIndex: 40 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className="tab-btn"
            style={{ flex: 1, padding: "11px 6px", border: "none", background: "transparent", color: activeTab === t.id ? S.gold : S.muted, fontWeight: activeTab === t.id ? 700 : 400, fontSize: 12, cursor: "pointer", borderBottom: `2px solid ${activeTab === t.id ? S.gold : "transparent"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "'Heebo', sans-serif", whiteSpace: "nowrap", transition: "all 0.15s" }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto" }}>

        {/* ═══ DASHBOARD ═══ */}
        {activeTab === "dashboard" && (
          <div className="fade">
            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg, ${S.card}, #1a1f35)`, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${S.gold}30`, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏛️</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: S.gold, marginBottom: 6 }}>מנהל שיווק OPA!</div>
              <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.7 }}>
                בנה את נוכחותך השיווקית צעד אחר צעד.<br />
                כל פעולה מתבצעת בלחיצה אחת.
              </div>
              <a href={`https://opa-plates.vercel.app/`} target="_blank" rel="noreferrer"
                style={{ display: "inline-block", marginTop: 12, background: S.gold, color: "#0A0E1A", borderRadius: 20, padding: "6px 18px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                🔗 דף הנחיתה
              </a>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: S.muted, marginBottom: 10, fontWeight: 600 }}>מסלול השיווק</div>
              {STEPS.map((step, i) => {
                const done = completedSteps.includes(step.id);
                const tab = step.id === "images" ? "images" : step.id === "content" ? "content" : step.id === "publish" ? "publish" : "outreach";
                return (
                  <div key={step.id} onClick={() => setActiveTab(tab)}
                    className="card-hover"
                    style={{ background: S.card, borderRadius: 12, padding: "14px 16px", marginBottom: 8, border: `1px solid ${done ? S.gold + "50" : S.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: done ? S.gold + "20" : S.border, border: `2px solid ${done ? S.gold : S.muted + "40"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {done ? "✓" : step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: done ? S.gold : S.text }}>{step.title}</div>
                      <div style={{ fontSize: 12, color: S.muted }}>{step.desc}</div>
                    </div>
                    <div style={{ fontSize: 14, color: S.muted }}>←</div>
                  </div>
                );
              })}
            </div>

            {/* Quick links */}
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 10, fontWeight: 600 }}>קישורים מהירים לפרסום</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/create/item", icon: "🛒", color: "#1877F2" },
                { label: "Facebook Groups", url: "https://www.facebook.com/groups/", icon: "👥", color: "#1877F2" },
                { label: "Instagram", url: "https://www.instagram.com/", icon: "📸", color: "#C13584" },
                { label: "Yad2", url: "https://www.yad2.co.il/", icon: "📋", color: "#E91E63" },
              ].map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: "12px", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{link.icon}</span>
                  <span style={{ fontSize: 12, color: S.text, fontWeight: 500 }}>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ═══ IMAGES ═══ */}
        {activeTab === "images" && (
          <div className="fade">
            <div style={{ fontSize: 14, color: S.muted, marginBottom: 16, lineHeight: 1.7 }}>
              בחר סגנון ולחץ "צור תמונות" — AI יייצר תמונות מקצועיות תוך שניות.
            </div>

            {/* Preset prompts */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 8 }}>בחר סגנון תמונה:</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {IMAGE_PROMPTS.map(p => (
                  <div key={p.id} onClick={() => { setSelectedPrompt(p); setCustomPrompt(""); }}
                    className="card-hover"
                    style={{ background: selectedPrompt.id === p.id ? S.gold + "20" : S.card, border: `2px solid ${selectedPrompt.id === p.id ? S.gold : S.border}`, borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center", fontSize: 12, color: selectedPrompt.id === p.id ? S.gold : S.text, fontWeight: selectedPrompt.id === p.id ? 700 : 400 }}>
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom prompt */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: S.muted, marginBottom:6 }}>או כתוב פרומפט משלך (באנגלית לתוצאות טובות יותר):</div>
              <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={3}
                placeholder="Greek plate shattering, dramatic lighting..."
                style={{ width: "100%", background: S.card, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "10px 12px", color: S.text, fontSize: 13, fontFamily: "'Heebo', sans-serif", resize: "vertical", direction: "ltr" }} />
            </div>

            {/* Count */}
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 12, color: S.muted }}>כמות תמונות:</div>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setImageCount(n)}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${imageCount === n ? S.gold : S.border}`, background: imageCount === n ? S.gold + "20" : "transparent", color: imageCount === n ? S.gold : S.muted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  {n}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button onClick={generateImages} disabled={loadingImage} className="btn-hover"
              style={{ width: "100%", background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, color: "#0A0E1A", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              {loadingImage ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span> : "🎨"}
              {loadingImage ? "מייצר תמונות..." : "צור תמונות עכשיו"}
            </button>

            {/* Generated images */}
            {generatedImages.length > 0 && (
              <div>
                <div style={{ fontSize: 13, color: S.gold, fontWeight: 600, marginBottom: 12 }}>✨ התמונות מוכנות — לחץ להורדה:</div>
                <div style={{ display: "grid", gridTemplateColumns: generatedImages.length === 1 ? "1fr" : "1fr 1fr", gap: 10 }}>
                  {generatedImages.map((img, i) => (
                    <div key={img.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${S.border}` }}>
                      <div style={{ position: "relative", width: "100%", height: generatedImages.length === 1 ? 300 : 160, background: "#1a2234", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!img.loaded && !img.error && (
                          <div style={{ textAlign: "center", color: "#D4A843" }}>
                            <div style={{ fontSize: 28, animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</div>
                            <div style={{ fontSize: 11, marginTop: 6 }}>יוצר תמונה...</div>
                          </div>
                        )}
                        {img.error && (
                          <div style={{ textAlign: "center", color: "#64748B", fontSize: 12 }}>❌ שגיאה — נסה שוב</div>
                        )}
                        <img src={img.url} alt={img.prompt}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: img.loaded ? "block" : "none", position: "absolute", top: 0, left: 0 }}
                          onLoad={() => setGeneratedImages(prev => prev.map(x => x.id === img.id ? {...x, loaded: true} : x))}
                          onError={(e) => {
                            // retry once with new seed
                            if (!e.target.dataset.retried) {
                              e.target.dataset.retried = "1";
                              e.target.src = buildImageUrl(img.prompt === "מותאם אישית" ? (customPrompt || selectedPrompt.prompt) : selectedPrompt.prompt);
                            } else {
                              setGeneratedImages(prev => prev.map(x => x.id === img.id ? {...x, error: true} : x));
                            }
                          }}
                        />
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "20px 10px 10px", display: "flex", gap: 6, justifyContent: "center" }}>
                        <button onClick={() => downloadImage(img.url, img.prompt)} className="btn-hover"
                          style={{ background: S.gold, color: "#0A0E1A", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          🔍 פתח
                        </button>
                        <button onClick={() => window.open(img.url, "_blank")} className="btn-hover"
                          style={{ background: "rgba(255,255,255,0.2)", color: S.white, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                          🔍 הגדל
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={generateImages} className="btn-hover"
                  style={{ width: "100%", marginTop: 10, background: "transparent", border: `1px solid ${S.gold}`, color: S.gold, borderRadius: 10, padding: 10, fontSize: 13, cursor: "pointer" }}>
                  🔄 צור גרסאות חדשות
                </button>
              </div>
            )}

            {/* Tips */}
            <div style={{ background: S.gold + "12", border: `1px solid ${S.gold}25`, borderRadius: 10, padding: "12px 14px", marginTop: 16, fontSize: 12, color: S.gold, lineHeight: 1.8 }}>
              💡 <strong>טיפ:</strong> הורד 3-4 תמונות שונות — השתמש בכל אחת בפלטפורמה אחרת לגיוון.
            </div>
          </div>
        )}

        {/* ═══ CONTENT ═══ */}
        {activeTab === "content" && (
          <div className="fade">
            <div style={{ fontSize: 14, color: S.muted, marginBottom: 16, lineHeight: 1.7 }}>
              בחר סוג פוסט ולחץ "צור תוכן" — AI יכתוב לך טקסט מוכן לפרסום.
            </div>

            {/* Post type selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {POST_TYPES.map(pt => (
                  <div key={pt.id} onClick={() => setSelectedPostType(pt)}
                    className="card-hover"
                    style={{ background: selectedPostType.id === pt.id ? pt.color + "20" : S.card, border: `2px solid ${selectedPostType.id === pt.id ? pt.color : S.border}`, borderRadius: 12, padding: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{pt.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: selectedPostType.id === pt.id ? 700 : 400, color: selectedPostType.id === pt.id ? pt.color : S.text }}>{pt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button onClick={generateContent} disabled={loadingText} className="btn-hover"
              style={{ width: "100%", background: `linear-gradient(135deg, #3B82F6, #6366F1)`, color: S.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              {loadingText ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span> : "✍️"}
              {loadingText ? "כותב..." : `צור ${selectedPostType.label}`}
            </button>

            {/* Generated content */}
            {generatedText && !loadingText && (
              <div className="fade" style={{ background: S.card, borderRadius: 12, border: `1px solid ${S.gold}40`, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.gold }}>✨ תוכן מוכן לפרסום</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={copyText} className="btn-hover"
                      style={{ background: copied ? S.green : S.gold, color: "#0A0E1A", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
                      {copied ? "✓ הועתק" : "העתק"}
                    </button>
                    <button onClick={shareToWhatsApp} className="btn-hover"
                      style={{ background: "#25D366", color: S.white, border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
                      💬 WA
                    </button>
                    <button onClick={generateContent} className="btn-hover"
                      style={{ background: "transparent", border: `1px solid ${S.border}`, color: S.muted, borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                      🔄
                    </button>
                  </div>
                </div>
                <div style={{ padding: "14px", fontSize: 14, color: S.text, lineHeight: 2, whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto" }}>
                  {generatedText}
                </div>
              </div>
            )}

            {!generatedText && !loadingText && (
              <div style={{ textAlign: "center", padding: 30, color: S.muted, fontSize: 13 }}>
                בחר סוג פוסט ולחץ על הכפתור 👆
              </div>
            )}
          </div>
        )}

        {/* ═══ PUBLISH ═══ */}
        {activeTab === "publish" && (
          <div className="fade">
            <div style={{ fontSize: 14, color: S.muted, marginBottom: 16, lineHeight: 1.7 }}>
              לחץ על פלטפורמה — תיפתח ישירות עם הכל מוכן. העתק את התוכן מהלשונית "תוכן" לפני שתפרסם.
            </div>

            {/* Main platforms */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 10, fontWeight: 600 }}>פרסום ישיר</div>
              {[
                { label: "Facebook Marketplace", sub: "הכי אפקטיבי לקונים פרטיים", url: "https://www.facebook.com/marketplace/create/item", icon: "🛒", color: "#1877F2" },
                { label: "יד2 — ציוד לאירועים", sub: "קהל נוסף חשוב", url: "https://www.yad2.co.il/post-item", icon: "📋", color: "#E91E63" },
                { label: "Instagram Reels", sub: "הגיע ויראלי בחינם", url: "https://www.instagram.com/", icon: "🎬", color: "#C13584" },
              ].map(p => (
                <a key={p.label} href={p.url} target="_blank" rel="noreferrer"
                  className="card-hover"
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, textDecoration: "none", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: p.color + "20", border: `1px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: S.muted }}>{p.sub}</div>
                  </div>
                  <span style={{ fontSize: 18, color: S.muted }}>←</span>
                </a>
              ))}
            </div>

            {/* Facebook groups */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 10, fontWeight: 600 }}>קבוצות פייסבוק — פרסם כל אחת בנפרד</div>
              {[
                { label: "חיפוש: בר מצווה ישראל", url: "https://www.facebook.com/search/groups?q=%D7%91%D7%A8%20%D7%9E%D7%A6%D7%95%D7%95%D7%94", icon: "🎺" },
                { label: "חיפוש: בת מצווה ישראל", url: "https://www.facebook.com/search/groups?q=%D7%91%D7%AA%20%D7%9E%D7%A6%D7%95%D7%95%D7%94", icon: "👑" },
                { label: "חיפוש: ארגון חתונות", url: "https://www.facebook.com/search/groups?q=%D7%97%D7%AA%D7%95%D7%A0%D7%94%20%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D", icon: "💍" },
                { label: "חיפוש: מסיבות ואירועים", url: "https://www.facebook.com/search/groups?q=%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D+%D7%95%D7%9E%D7%A1%D7%99%D7%91%D7%95%D7%AA", icon: "🎉" },
              ].map(g => (
                <a key={g.label} href={g.url} target="_blank" rel="noreferrer"
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <span style={{ fontSize: 13, color: S.text }}>{g.label}</span>
                  <span style={{ marginRight: "auto", fontSize: 12, color: "#1877F2", fontWeight: 600 }}>חפש ←</span>
                </a>
              ))}
            </div>

            {/* Tips */}
            <div style={{ background: S.gold + "12", border: `1px solid ${S.gold}25`, borderRadius: 10, padding: "14px", fontSize: 12, color: S.gold, lineHeight: 1.9 }}>
              <strong>💡 טיפ:</strong> רענן את המודעה ב-Marketplace כל יומיים — מחק ופרסם מחדש. זה שומר אותך בראש התוצאות בחינם.
            </div>
          </div>
        )}

        {/* ═══ OUTREACH ═══ */}
        {activeTab === "outreach" && (
          <div className="fade">
            <div style={{ fontSize: 14, color: S.muted, marginBottom: 16, lineHeight: 1.7 }}>
              מארגנות אירועים הן הכפולות שלך — כל לקוחה שלהן היא לקוחה פוטנציאלית שלך.
            </div>

            {/* Search organizers */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 10 }}>🔍 מצא מארגנות אירועים</div>
              {[
                { label: "מארגנת אירועים — אינסטגרם", url: "https://www.instagram.com/explore/search/keyword/?q=%D7%9E%D7%90%D7%A8%D7%92%D7%A0%D7%AA+%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D", icon: "📸", color: "#C13584" },
                { label: "מפיקת בר מצווה — אינסטגרם", url: "https://www.instagram.com/explore/search/keyword/?q=%D7%9E%D7%A4%D7%99%D7%A7%D7%AA+%D7%91%D7%A8+%D7%9E%D7%A6%D7%95%D7%95%D7%94", icon: "🎺", color: "#E91E63" },
                { label: "מארגנת אירועים — פייסבוק", url: "https://www.facebook.com/search/people?q=%D7%9E%D7%90%D7%A8%D7%92%D7%A0%D7%AA+%D7%90%D7%99%D7%A8%D7%95%D7%A2%D7%99%D7%9D", icon: "👥", color: "#1877F2" },
              ].map(o => (
                <a key={o.label} href={o.url} target="_blank" rel="noreferrer"
                  className="card-hover"
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: "14px", marginBottom: 8, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{o.icon}</span>
                  <span style={{ fontSize: 13, color: S.text, flex: 1 }}>{o.label}</span>
                  <span style={{ fontSize: 12, color: o.color, fontWeight: 600 }}>חפש ←</span>
                </a>
              ))}
            </div>

            {/* DM template */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 10 }}>📝 הודעת DM מוכנה</div>
              <div style={{ background: S.card, borderRadius: 12, border: `1px solid ${S.border}`, padding: "14px", marginBottom: 10, fontSize: 13, color: S.text, lineHeight: 1.9, whiteSpace: "pre-line" }}>
                {`שלום!
אני מייבא צלחות שבירה יווניות אמיתיות — ${PRICE}.
חשבתי שיכול לעניין את הלקוחות שלך לאירועים.

אשמח לשלוח דוגמא ופרטים 🙂
${LANDING_URL}`}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  navigator.clipboard?.writeText(`שלום!\nאני מייבא צלחות שבירה יווניות אמיתיות — ${PRICE}.\nחשבתי שיכול לעניין את הלקוחות שלך לאירועים.\n\nאשמח לשלוח דוגמא ופרטים 🙂\n${LANDING_URL}`);
                  setCopied(true); setTimeout(() => setCopied(false), 2000);
                }} className="btn-hover"
                  style={{ flex: 1, background: S.gold, color: "#0A0E1A", border: "none", borderRadius: 10, padding: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  {copied ? "✓ הועתק" : "📋 העתק הודעה"}
                </button>
                <button onClick={generateContent} className="btn-hover"
                  style={{ flex: 1, background: "transparent", border: `1px solid ${S.blue}`, color: S.blue, borderRadius: 10, padding: 10, fontSize: 13, cursor: "pointer" }}
                  onClickCapture={() => { setSelectedPostType(POST_TYPES[3]); setActiveTab("content"); }}>
                  ✍️ צור גרסה AI
                </button>
              </div>
            </div>

            {/* Canva tip */}
            <div style={{ background: "#7B1FA220", border: `1px solid #7B1FA250`, borderRadius: 12, padding: "14px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#CE93D8", marginBottom: 6 }}>🎨 ליצירת וידאו — Kling AI (חינם)</div>
              <div style={{ fontSize: 12, color: S.muted, lineHeight: 1.7 }}>העלה תמונה של הצלחת השבורה ו-Kling יהפוך אותה לוידאו מרשים.</div>
              <a href="https://klingai.com" target="_blank" rel="noreferrer"
                style={{ display: "inline-block", marginTop: 8, background: "#7B1FA2", color: S.white, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                כנס ל-Kling AI ←
              </a>
            </div>

            <div style={{ background: S.gold + "12", border: `1px solid ${S.gold}25`, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: S.gold, lineHeight: 1.9 }}>
              💡 <strong>טיפ:</strong> שלח ל-10 מארגנות ביום. אחת שתשתף שווה יותר מ-100 פוסטים.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
