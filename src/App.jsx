import React, { useState, useEffect } from "react";
import {
  MapPin, Users, Mic, ShieldAlert, ClipboardList, Phone, Clock,
  CheckCircle2, Home, Search, Navigation2, WifiOff, Building2, Hospital, BadgeCheck, ExternalLink,
  LocateFixed, ArrowLeft, CircleAlert, Siren, Circle, Send, AlertTriangle, Navigation, MessageSquare,
  ThumbsUp, ThumbsDown, Flag, Lock, Eye, ChevronRight, X, RefreshCw, Sun, Moon
} from "lucide-react";

// ---------- Design tokens ----------
const LIGHT = {
  navy: "#1B2A4A",
  navyLight: "#2B3D63",
  bg: "#F4F6F5",
  card: "#FFFFFF",
  ink: "#1B2330",
  sub: "#5B6472",
  line: "#E4E7E6",
  safe: "#2F9E6E",
  safeBg: "#E5F5EE",
  moderate: "#D19A2E",
  moderateBg: "#FBF1DD",
  higher: "#D9772F",
  higherBg: "#FBEADC",
  high: "#D64550",
  highBg: "#FBE3E4",
};

const DARK = {
  navy: "#0F1830",
  navyLight: "#1B2A4A",
  bg: "#12161C",
  card: "#1A1F28",
  ink: "#EDEFF2",
  sub: "#9AA3AF",
  line: "#2A2F3A",
  safe: "#3FBE86",
  safeBg: "#16302A",
  moderate: "#E3B24C",
  moderateBg: "#332A14",
  higher: "#E5904F",
  higherBg: "#38230F",
  high: "#E8636D",
  highBg: "#3A171A",
};

// Reassigned by SafeSphere() on theme toggle. Every other component in this
// file reads C.xxx at render time, so mutating this binding re-themes them all.
let C = LIGHT;

function getLevelMeta() {
  return {
    safe: { label: "Low risk / community verified", color: C.safe, bg: C.safeBg },
    moderate: { label: "Moderate risk", color: C.moderate, bg: C.moderateBg },
    higher: { label: "Higher risk", color: C.higher, bg: C.higherBg },
    high: { label: "High risk", color: C.high, bg: C.highBg },
  };
}

const TIME_SLOTS = ["2 PM", "7 PM", "9 PM", "11 PM", "1 AM"];

const ZONES = [
  {
    id: "z1", name: "Campus Main Gate",
    byTime: {
      "2 PM": { level: "safe", score: 88, reasons: ["High footfall", "Security post staffed", "No reports this week"] },
      "7 PM": { level: "safe", score: 81, reasons: ["Well-lit approach", "Regular campus patrol"] },
      "9 PM": { level: "moderate", score: 64, reasons: ["Footfall drops after evening classes", "1 minor report this month"] },
      "11 PM": { level: "higher", score: 47, reasons: ["Low activity", "Gate lighting partial"] },
      "1 AM": { level: "high", score: 28, reasons: ["Very low footfall", "No live security presence reported"] },
    },
  },
  {
    id: "z2", name: "Metro Station Road",
    byTime: {
      "2 PM": { level: "safe", score: 84, reasons: ["Frequent trains", "Busy commercial frontage"] },
      "7 PM": { level: "moderate", score: 66, reasons: ["Peak crowd thinning out", "2 lighting complaints, unresolved"] },
      "9 PM": { level: "higher", score: 51, reasons: ["Train frequency drops", "3 reports in last 30 days"] },
      "11 PM": { level: "higher", score: 45, reasons: ["Sparse crowd", "Last-mile stretch poorly lit"] },
      "1 AM": { level: "high", score: 22, reasons: ["No trains running", "Isolated stretch, no reports of intervention"] },
    },
  },
  {
    id: "z3", name: "Sector 12 Market",
    byTime: {
      "2 PM": { level: "safe", score: 90, reasons: ["Shops open, high footfall"] },
      "7 PM": { level: "safe", score: 85, reasons: ["Evening market rush", "Good street lighting"] },
      "9 PM": { level: "safe", score: 77, reasons: ["Late-closing shops keep street active"] },
      "11 PM": { level: "moderate", score: 60, reasons: ["Most shops shut", "Footfall reduced but not empty"] },
      "1 AM": { level: "higher", score: 43, reasons: ["Market fully closed", "Occasional loitering reported"] },
    },
  },
  {
    id: "z4", name: "Riverside Path",
    byTime: {
      "2 PM": { level: "moderate", score: 62, reasons: ["Isolated even by day", "Limited passerby traffic"] },
      "7 PM": { level: "higher", score: 49, reasons: ["Low visibility", "1 harassment report last month"] },
      "9 PM": { level: "high", score: 33, reasons: ["No lighting", "Very low footfall"] },
      "11 PM": { level: "high", score: 20, reasons: ["Deserted", "No nearby resources within 1 km"] },
      "1 AM": { level: "high", score: 15, reasons: ["Deserted", "Community advises avoiding entirely"] },
    },
  },
  {
    id: "z5", name: "College Back Gate",
    byTime: {
      "2 PM": { level: "safe", score: 80, reasons: ["Used for deliveries, moderate footfall"] },
      "7 PM": { level: "safe", score: 74, reasons: ["Still in regular use"] },
      "9 PM": { level: "higher", score: 46, reasons: ["Gate traffic drops sharply", "Unlit stretch behind gym"] },
      "11 PM": { level: "high", score: 30, reasons: ["Effectively unused after 9 PM", "2 stalking-pattern reports this term"] },
      "1 AM": { level: "high", score: 18, reasons: ["Gate normally locked", "No legitimate reason to be present"] },
    },
  },
  {
    id: "z6", name: "Bus Stand Junction",
    byTime: {
      "2 PM": { level: "moderate", score: 68, reasons: ["Congested but chaotic", "Pickpocketing reports"] },
      "7 PM": { level: "moderate", score: 63, reasons: ["Heavy commuter traffic"] },
      "9 PM": { level: "higher", score: 52, reasons: ["Buses less frequent", "Poorly marked waiting areas"] },
      "11 PM": { level: "higher", score: 44, reasons: ["Last buses departing", "Reduced lighting near platform 3"] },
      "1 AM": { level: "high", score: 26, reasons: ["No buses running", "Isolated waiting benches"] },
    },
  },
];

const RESOURCES = [
  { name: "Police Station", distance: "700 m", icon: ShieldAlert },
  { name: "Campus Security", distance: "400 m", icon: Navigation },
  { name: "Hospital", distance: "1.2 km", icon: MapPin },
  { name: "Metro Station", distance: "900 m", icon: MapPin },
];

const CATEGORIES = ["Harassment", "Stalking", "Poor lighting", "Unsafe transport", "Suspicious activity", "Infrastructure issue", "Positive safety info"];

const REPORT_STEPS = ["Submitted", "Acknowledged", "Assigned", "Under review", "Action taken", "Resolved"];

// ---------- Privacy redaction (client-side, deterministic) ----------
function redact(text) {
  let out = text;
  out = out.replace(/(\+?\d{1,3}[-.\s]?)?\d{10}\b/g, "[PHONE REDACTED]");
  out = out.replace(/\d{1,4}[,]?\s+[A-Za-z]+(\s[A-Za-z]+)?\s+(street|st|road|rd|sector|lane|colony|block)\b/gi, "[ADDRESS REDACTED]");
  return out;
}

function todayStr() {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ---------- Small UI atoms ----------
function LevelChip({ level, score }) {
  const m = getLevelMeta()[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: m.bg, color: m.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}{typeof score === "number" ? ` · ${score}/100` : ""}
    </span>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

// ---------- Main App ----------
export default function SafeSphere() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  C = theme === "light" ? LIGHT : DARK;

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [tab, setTab] = useState("map");
  const [timeIdx, setTimeIdx] = useState(1);
  const time = TIME_SLOTS[timeIdx];

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: C.bg, fontFamily: "Inter, sans-serif", color: C.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <style>{`
        .ss-field::placeholder { color: ${C.sub}; opacity: 1; }
        .ss-field option { background-color: ${C.card}; color: ${C.ink}; }
      `}</style>

      <aside className="hidden md:flex flex-col w-56 shrink-0 p-4 gap-1" style={{ backgroundColor: C.navy }}>
        <div className="px-2 pb-5 pt-2">
          <div className="text-white text-xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>SafeSphere</div>
          <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>Know. Protect. Report. Follow up.</div>
        </div>
        <button
          onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
          className="mx-2 mb-3 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
          style={{ color: "rgba(255,255,255,0.75)", backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
        <NavItem icon={MapPin} label="Safety map" active={tab === "map"} onClick={() => setTab("map")} />
        <NavItem icon={Home} label="Safe Haven" active={tab === "haven"} onClick={() => setTab("haven")} />
        <NavItem icon={Users} label="Community" active={tab === "community"} onClick={() => setTab("community")} />
        <NavItem icon={Mic} label="SafeSpeak" active={tab === "safespeak"} onClick={() => setTab("safespeak")} />
        <NavItem icon={ShieldAlert} label="SOS" active={tab === "sos"} onClick={() => setTab("sos")} />
        <NavItem icon={ClipboardList} label="My reports" active={tab === "reports"} onClick={() => setTab("reports")} />
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-around py-2 border-t" style={{ backgroundColor: C.navy, borderColor: C.navyLight }}>
        {[["map", MapPin], ["community", Users], ["safespeak", Mic], ["sos", ShieldAlert], ["reports", ClipboardList]].map(([id, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className="p-2 rounded-lg" style={{ color: tab === id ? "#fff" : "rgba(255,255,255,0.55)" }}>
            <Icon size={20} />
          </button>
        ))}
      </div>

      <main className="flex-1 p-5 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto w-full">
        {tab === "map" && <MapTab timeIdx={timeIdx} setTimeIdx={setTimeIdx} time={time} />}
        {tab === "haven" && <SafeHavenTab />}
        {tab === "community" && <CommunityTab />}
        {tab === "safespeak" && <SafeSpeakTab onSubmitToAuthority={(incident) => window.__addReport?.(incident)} />}
        {tab === "sos" && <SOSTab />}
        {tab === "reports" && <ReportsTab />}
      </main>
    </div>
  );
}


// ---------- Safe Haven ----------
const HAVENS = [
  { id: 1, name: "Police Assistance Point", type: "Official", distance: "850 m", walk: "10 min", availability: "24/7", assistance: "Police support", verified: "Officially Verified", verifiedDate: "2 Sep 2026", icon: Siren },
  { id: 2, name: "Campus Security Office", type: "Institution", distance: "1.2 km", walk: "15 min", availability: "8 AM – 8 PM", assistance: "Campus security and women cell", verified: "Institution Verified", verifiedDate: "30 Aug 2026", icon: Building2 },
  { id: 3, name: "Riverside Clinic (Partner)", type: "Partner", distance: "1.8 km", walk: "22 min", availability: "Unknown", assistance: "Medical assistance", verified: "Partner Verified", verifiedDate: "14 Jul 2026", icon: Hospital },
];

function SafeHavenTab() {
  const [screen, setScreen] = useState("home");
  const [radius, setRadius] = useState(500);
  const [offline, setOffline] = useState(false);
  const [scenario, setScenario] = useState("found");
  const [selected, setSelected] = useState(HAVENS[0]);
  const [admin, setAdmin] = useState(false);

  const search = () => {
    setScreen("searching");
    setTimeout(() => setScreen(scenario === "found" ? "found" : "none"), 700);
  };

  if (admin) return <SafeHavenAdmin onBack={() => setAdmin(false)} />;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Safe Haven</h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>Find a verified place where you can go for immediate human assistance.</p>
        </div>
        <button onClick={() => setAdmin(true)} className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: C.card, color: C.sub, border: `1px solid ${C.line}` }}>Admin console</button>
      </div>

      <div className="mt-5 rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Need somewhere to go?</div>
            <div className="text-xs mt-1" style={{ color: C.sub }}>Search verified assistance points near your current location.</div>
          </div>
          <button onClick={() => setOffline(!offline)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: offline ? C.moderateBg : C.bg, color: C.ink, border: `1px solid ${C.line}` }}>
            {offline ? <WifiOff size={14} /> : <LocateFixed size={14} />} {offline ? "Offline mode on" : "Location ready"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <button onClick={search} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: C.navy }}><Search size={17} /> Find Safe Haven</button>
          <button onClick={() => setScreen("help")} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: C.bg, color: C.ink, border: `1px solid ${C.line}` }}><Phone size={17} /> Contact Help</button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs" style={{color:C.sub}}>Demo scenario: <button onClick={()=>setScenario("found")} className="px-2 py-1 rounded-md" style={{backgroundColor:scenario==="found"?C.safeBg:C.bg,color:scenario==="found"?C.safe:C.sub}}>Safe Haven found</button><button onClick={()=>setScenario("none")} className="px-2 py-1 rounded-md" style={{backgroundColor:scenario==="none"?C.moderateBg:C.bg,color:C.sub}}>None nearby</button></div>
      </div>

      {offline && <div className="mt-3 rounded-xl p-3 flex gap-2 text-xs" style={{ backgroundColor: C.moderateBg, color: C.sub }}><WifiOff size={15} className="shrink-0" /><div><b style={{ color: C.ink }}>NO INTERNET CONNECTION</b><br/>Showing previously synchronised safety information. Last sync: 16 Sep 2026, 6:20 PM. Live availability may be different.</div></div>}

      {screen === "searching" && <SafeHavenSearching radius={radius} setRadius={setRadius} />}
      {screen === "found" && <SafeHavenFound haven={selected} offline={offline} onBack={() => setScreen("home")} onRoute={() => setScreen("route")} />}
      {screen === "none" && <SafeHavenNone onBack={() => setScreen("home")} onRetry={() => { setScenario("found"); setScreen("home"); }} />}
      {screen === "route" && <SafeHavenRoute haven={selected} offline={offline} onBack={() => setScreen("found")} onNavigate={() => setScreen("navigating")} />}
      {screen === "navigating" && <SafeHavenNavigating haven={selected} offline={offline} onBack={() => setScreen("route")} />}
      {screen === "help" && <SafeHavenHelp onBack={() => setScreen("home")} />}

      {screen === "home" && (
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2 font-semibold text-sm"><BadgeCheck size={16} style={{ color: C.safe }} /> What counts as a Safe Haven?</div>
            <p className="text-xs mt-2" style={{ color: C.sub }}>A verified assistance point such as a police assistance point, government support centre, hospital, campus security office or participating organisation with a defined assistance role.</p>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2 font-semibold text-sm"><CircleAlert size={16} style={{ color: C.moderate }} /> Important</div>
            <p className="text-xs mt-2" style={{ color: C.sub }}>A Safe Haven is not a guarantee that a place is completely safe. Route suggestions are lower-risk options based on available safety information.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SafeHavenSearching({ radius, setRadius }) {
  return <div className="mt-5 rounded-xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
    <div className="flex items-center gap-2 font-semibold"><Search size={17} /> Searching nearby</div>
    <p className="text-sm mt-2" style={{ color: C.sub }}>Safe Haven search expands progressively from 500 m to 1 km to 2 km.</p>
    <div className="flex gap-2 mt-4">
      {[500,1000,2000].map(r => <button key={r} onClick={() => setRadius(r)} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ backgroundColor: radius===r ? C.navy : C.bg, color: radius===r ? "#fff" : C.sub }}>{r >= 1000 ? `${r/1000} km` : `${r} m`}</button>)}
    </div>
    <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.bg }}><div className="h-full rounded-full" style={{ width: radius===500?"33%":radius===1000?"66%":"100%", backgroundColor: C.safe }} /></div>
  </div>;
}

function SafeHavenFound({ haven, offline, onBack, onRoute }) {
  const Icon = haven.icon;
  return <div className="mt-5 rounded-xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
    <button onClick={onBack} className="flex items-center gap-1 text-xs mb-4" style={{ color: C.sub }}><ArrowLeft size={14}/> Back</button>
    <div className="flex gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.safeBg, color: C.safe }}><Icon size={21}/></div>
      <div className="flex-1"><div className="font-semibold">{haven.name}</div><div className="text-xs mt-1" style={{ color: C.sub }}>{haven.type} · {haven.distance} · {haven.walk}</div></div>
      <BadgeCheck size={20} style={{ color: C.safe }} />
    </div>
    <div className="grid sm:grid-cols-3 gap-2 mt-4">
      <Info label="Verification" value={haven.verified} />
      <Info label="Assistance" value={haven.assistance} />
      <Info label="Availability" value={haven.availability} />
    </div>
    <div className="mt-3 text-xs" style={{ color: C.sub }}>Last verified: {haven.verifiedDate}{offline ? " · From cached safety data" : ""}</div>
    <button onClick={onRoute} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: C.navy }}><Navigation2 size={17}/> Show lower-risk route</button>
  </div>;
}
function Info({label,value}) { return <div className="rounded-lg p-3" style={{backgroundColor:C.bg}}><div className="text-[11px]" style={{color:C.sub}}>{label}</div><div className="text-xs font-semibold mt-1">{value}</div></div>; }
function SafeHavenRoute({ haven, offline, onBack, onNavigate }) { return <div className="mt-5 rounded-xl p-5" style={{backgroundColor:C.card,border:`1px solid ${C.line}`}}><button onClick={onBack} className="flex items-center gap-1 text-xs" style={{color:C.sub}}><ArrowLeft size={14}/> Back</button><h2 className="text-lg font-bold mt-4">Route to {haven.name}</h2><div className="grid sm:grid-cols-2 gap-3 mt-4"><div className="rounded-xl p-4" style={{backgroundColor:C.bg}}><div className="text-xs" style={{color:C.sub}}>Recommended</div><div className="text-xl font-bold mt-1">9 min</div><div className="text-xs mt-1">Lower reported risk based on available information</div></div><div className="rounded-xl p-4" style={{backgroundColor:C.bg}}><div className="text-xs" style={{color:C.sub}}>Alternative</div><div className="text-xl font-bold mt-1">6 min</div><div className="text-xs mt-1">Higher reported risk based on available information</div></div></div>{offline&&<div className="mt-3 text-xs p-3 rounded-lg" style={{backgroundColor:C.moderateBg,color:C.sub}}><WifiOff size={14} className="inline mr-1"/> Route uses previously synchronised map and safety data.</div>}<button onClick={onNavigate} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{backgroundColor:C.navy}}><Navigation2 size={17}/> Start navigation</button><p className="text-[11px] mt-3" style={{color:C.sub}}>This is not a guarantee of safety. Conditions can change and route information may be incomplete.</p></div>; }
function SafeHavenNavigating({ haven, offline, onBack }) { return <div className="mt-5 rounded-xl p-5" style={{backgroundColor:C.card,border:`1px solid ${C.line}`}}><button onClick={onBack} className="flex items-center gap-1 text-xs" style={{color:C.sub}}><ArrowLeft size={14}/> Back</button><div className="mt-5 rounded-2xl p-6 text-center" style={{backgroundColor:C.bg}}><Navigation2 size={34} style={{color:C.safe,margin:"0 auto"}}/><div className="font-bold mt-3">Go to {haven.name}</div><div className="text-sm mt-1" style={{color:C.sub}}>About 850 m · 10 min</div>{offline&&<div className="text-xs mt-3" style={{color:C.moderate}}>Offline navigation using cached information</div>}<div className="mt-5 h-32 rounded-xl flex items-center justify-center" style={{backgroundColor:C.card,border:`1px dashed ${C.line}`}}><span className="text-xs" style={{color:C.sub}}>Map / route preview</span></div></div></div>; }
function SafeHavenNone({ onBack, onRetry }) { return <div className="mt-5 rounded-xl p-5" style={{backgroundColor:C.card,border:`1px solid ${C.line}`}}><CircleAlert size={28} style={{color:C.moderate}}/><h2 className="text-lg font-bold mt-3">No verified Safe Haven found nearby</h2><p className="text-sm mt-1" style={{color:C.sub}}>The current area does not have a verified assistance point in the available search data.</p><div className="grid sm:grid-cols-3 gap-2 mt-4"><button className="p-3 rounded-lg text-xs font-semibold text-white" style={{backgroundColor:C.navy}}>Contact Help</button><button className="p-3 rounded-lg text-xs font-semibold" style={{backgroundColor:C.bg,border:`1px solid ${C.line}`}}>Share temporary location</button><button onClick={onRetry} className="p-3 rounded-lg text-xs font-semibold" style={{backgroundColor:C.bg,border:`1px solid ${C.line}`}}>Expand search</button></div><button onClick={onBack} className="mt-3 text-xs" style={{color:C.sub}}>Back</button></div>; }
function SafeHavenHelp({ onBack }) { return <div className="mt-5 rounded-xl p-5" style={{backgroundColor:C.card,border:`1px solid ${C.line}`}}><button onClick={onBack} className="flex items-center gap-1 text-xs" style={{color:C.sub}}><ArrowLeft size={14}/> Back</button><h2 className="text-lg font-bold mt-4">Contact Help</h2><div className="grid sm:grid-cols-2 gap-3 mt-4"><button className="p-4 rounded-xl text-left" style={{backgroundColor:C.highBg,border:`1px solid ${C.line}`}}><div className="font-semibold flex gap-2"><Siren size={17}/> Emergency services</div><div className="text-xs mt-1" style={{color:C.sub}}>Call 112 for emergency assistance</div></button><button className="p-4 rounded-xl text-left" style={{backgroundColor:C.bg,border:`1px solid ${C.line}`}}><div className="font-semibold flex gap-2"><Phone size={17}/> Trusted contact</div><div className="text-xs mt-1" style={{color:C.sub}}>Use your configured emergency contact</div></button></div></div>; }
function SafeHavenAdmin({ onBack }) { const [havens,setHavens]=useState(HAVENS.map(h=>({...h,status:"Verified"}))); return <div><button onClick={onBack} className="flex items-center gap-1 text-xs" style={{color:C.sub}}><ArrowLeft size={14}/> Back to Safe Haven</button><h1 className="text-2xl font-bold mt-4" style={{fontFamily:"Sora, sans-serif"}}>Safe Haven admin</h1><p className="text-sm mt-1" style={{color:C.sub}}>Manage verification, availability and re-verification status.</p><div className="mt-5 space-y-3">{havens.map((h,i)=>{const Icon=h.icon;return <div key={h.id} className="rounded-xl p-4" style={{backgroundColor:C.card,border:`1px solid ${C.line}`}}><div className="flex justify-between gap-3"><div className="flex gap-3"><Icon size={19} style={{color:C.safe}}/><div><div className="font-semibold text-sm">{h.name}</div><div className="text-xs mt-1" style={{color:C.sub}}>{h.verified} · Last verified {h.verifiedDate} · Availability {h.availability}</div></div></div><span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor:C.safeBg,color:C.safe}}>{h.status}</span></div><div className="flex gap-2 mt-3"><button onClick={()=>setHavens(havens.map((x,j)=>j===i?{...x,status:"Re-verification needed"}:x))} className="text-xs px-3 py-1.5 rounded-lg" style={{backgroundColor:C.bg,border:`1px solid ${C.line}`}}>Mark for re-verification</button><button onClick={()=>setHavens(havens.map((x,j)=>j===i?{...x,status:"Availability unknown"}:x))} className="text-xs px-3 py-1.5 rounded-lg" style={{backgroundColor:C.moderateBg,border:`1px solid ${C.line}`}}>Mark availability unknown</button></div></div>})}</div></div>; }

// ---------- Map Tab ----------
function MapTab({ timeIdx, setTimeIdx, time }) {
  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Safety map</h1>
      <p className="text-sm mt-1" style={{ color: C.sub }}>
        Community reports, lighting, footfall, and nearby resources — not a guarantee of safety, and it changes through the day.
      </p>

      <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold flex items-center gap-1.5"><Clock size={15} /> Time of day</span>
          <span className="text-sm font-semibold" style={{ color: C.navy }}>{time}</span>
        </div>
        <input
          type="range" min={0} max={TIME_SLOTS.length - 1} step={1} value={timeIdx}
          onChange={(e) => setTimeIdx(Number(e.target.value))}
          className="w-full accent-current"
          style={{ accentColor: C.navy }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: C.sub }}>
          {TIME_SLOTS.map((t) => <span key={t}>{t}</span>)}
        </div>
        <p className="text-xs mt-3" style={{ color: C.sub }}>Safety conditions may change with time — this reflects recent, time-of-day patterns, not a live prediction.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {ZONES.map((z) => {
          const d = z.byTime[time];
          return (
            <div key={z.id} className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{z.name}</div>
                  <div className="mt-1.5"><LevelChip level={d.level} score={d.score} /></div>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {d.reasons.map((r, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: C.sub }}>
                    <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: C.sub }} />{r}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Community Tab ----------
function CommunityTab() {
  const [posts, setPosts] = useState([
    { id: 1, category: "Poor lighting", text: "Streetlight near Gate 3 has been broken for two weeks.", up: 14, down: 0, verified: true },
    { id: 2, category: "Positive safety info", text: "This stretch near the market has good lighting and high footfall even after 9 PM.", up: 9, down: 1, verified: true },
    { id: 3, category: "Harassment", text: "Repeated catcalling reported near the metro exit around evening rush hour.", up: 21, down: 2, verified: false },
  ]);
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [preview, setPreview] = useState(false);

  const publicText = redact(draft);

  function submit() {
    if (!draft.trim()) return;
    setPosts([{ id: Date.now(), category, text: redact(draft), up: 0, down: 0, verified: false }, ...posts]);
    setDraft("");
    setPreview(false);
  }

  function vote(id, dir) {
    setPosts(posts.map((p) => p.id === id ? { ...p, up: dir === "up" ? p.up + 1 : p.up, down: dir === "down" ? p.down + 1 : p.down } : p));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Community</h1>
      <p className="text-sm mt-1" style={{ color: C.sub }}>Location-based reports and safety notes from people nearby.</p>

      <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <div className="flex gap-2 flex-wrap mb-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: category === c ? C.navy : C.bg, color: category === c ? "#fff" : C.sub, border: `1px solid ${category === c ? C.navy : C.line}` }}>
              {c}
            </button>
          ))}
        </div>
        <textarea
          value={draft} onChange={(e) => { setDraft(e.target.value); setPreview(false); }}
          placeholder="Share something the community should know — e.g. a broken streetlight, a route with good lighting, a repeated pattern you've noticed."
          className="w-full text-sm rounded-lg p-3 outline-none resize-none ss-field"
          style={{ border: `1px solid ${C.line}`, minHeight: 80, backgroundColor: C.card, color: C.ink }}
        />
        {draft.trim() && (
          <div className="mt-2 flex items-start gap-2 text-xs rounded-lg p-2.5" style={{ backgroundColor: C.bg, color: C.sub }}>
            <Lock size={14} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold" style={{ color: C.ink }}>What the community will see (phone numbers and addresses auto-redacted):</div>
              <div className="mt-1">{publicText}</div>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-3">
          <button onClick={submit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: C.navy }}>
            <Send size={14} /> Post
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: C.bg, color: C.navy }}>{p.category}</span>
              {p.verified && <span className="text-xs flex items-center gap-1" style={{ color: C.safe }}><CheckCircle2 size={13} /> Community verified</span>}
            </div>
            <p className="text-sm mt-2">{p.text}</p>
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => vote(p.id, "up")} className="flex items-center gap-1 text-xs" style={{ color: C.sub }}><ThumbsUp size={14} /> {p.up}</button>
              <button onClick={() => vote(p.id, "down")} className="flex items-center gap-1 text-xs" style={{ color: C.sub }}><ThumbsDown size={14} /> {p.down}</button>
              <button className="flex items-center gap-1 text-xs ml-auto" style={{ color: C.sub }}><Flag size={13} /> Report</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- SafeSpeak Tab ----------
function SafeSpeakTab() {
  const [input, setInput] = useState("");
  const [structured, setStructured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function structure() {
    if (!input.trim()) return;
    setLoading(true); setError(""); setMessage(""); setStructured(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an incident-structuring assistant inside a women's safety app called SafeSphere. Convert the user's free-text description into structured fields. Use cautious, non-accusatory language (e.g. "Potential stalking pattern reported", not "This person committed stalking"). Never assert that a crime definitely occurred. Respond with ONLY a raw JSON object, no markdown fences, no preamble, with exactly these keys: incidentType (string), frequency (string), timeOfDay (string), location (string), severity (one of "Low","Medium","High"), evidence (string, say "Not provided" if none mentioned), cautionNote (one short sentence noting this is a preliminary structuring, not a legal determination).

User's description: "${input}"`,
          }],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).map((b) => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setStructured(parsed);
    } catch (e) {
      setError("Couldn't reach the structuring service — you can fill this in manually below instead.");
      setStructured({ incidentType: "", frequency: "", timeOfDay: "", location: "", severity: "Medium", evidence: "Not provided", cautionNote: "This is a preliminary structuring, not a legal determination." });
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, val) {
    setStructured({ ...structured, [key]: val });
  }

  function act(action) {
    if (action === "authority") {
      const id = "SF-" + Math.floor(10000 + Math.random() * 89999);
      window.__reports = window.__reports || [];
      const steps = REPORT_STEPS.map((s, i) => ({ label: s, done: i === 0, date: i === 0 ? todayStr() : null }));
      window.__reports.push({ id, ...structured, steps, followUpsUsed: 0 });
      window.dispatchEvent(new Event("safesphere-reports-updated"));
      setMessage(`Submitted to authority. Incident ID ${id} — track progress under "My reports."`);
    } else if (action === "publish") {
      setMessage("Published as an anonymized community report, with sensitive details filtered out.");
    } else if (action === "notify") {
      setMessage("Trusted contact notified with a summary of this incident.");
    } else if (action === "save") {
      setMessage("Saved privately. Nothing has been shared.");
    } else {
      setMessage("No action taken — this stays as a private draft.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>SafeSpeak</h1>
      <p className="text-sm mt-1" style={{ color: C.sub }}>Describe what happened in your own words — SafeSpeak structures it for you, without deciding anything on your behalf.</p>

      <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "A man has been following me from the metro station every evening for the last three days."'
          className="w-full text-sm rounded-lg p-3 outline-none resize-none ss-field"
          style={{ border: `1px solid ${C.line}`, minHeight: 90, backgroundColor: C.card, color: C.ink }}
        />
        <div className="flex justify-end mt-3">
          <button onClick={structure} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: C.navy }}>
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Mic size={14} />}
            {loading ? "Structuring…" : "Structure this"}
          </button>
        </div>
        {error && <p className="text-xs mt-2" style={{ color: C.high }}>{error}</p>}
      </div>

      {structured && (
        <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Structured incident — review and edit</span>
            <span className="text-xs flex items-center gap-1" style={{ color: C.sub }}><Eye size={13} /> You control what happens next</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Incident type" value={structured.incidentType} onChange={(v) => updateField("incidentType", v)} />
            <Field label="Frequency" value={structured.frequency} onChange={(v) => updateField("frequency", v)} />
            <Field label="Time of day" value={structured.timeOfDay} onChange={(v) => updateField("timeOfDay", v)} />
            <Field label="Location" value={structured.location} onChange={(v) => updateField("location", v)} />
            <div>
              <label className="text-xs font-semibold" style={{ color: C.sub }}>Severity</label>
              <select value={structured.severity} onChange={(e) => updateField("severity", e.target.value)}
                className="w-full text-sm rounded-lg p-2 mt-1 outline-none ss-field" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card, color: C.ink }}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <Field label="Evidence" value={structured.evidence} onChange={(v) => updateField("evidence", v)} />
          </div>
          <p className="text-xs mt-3 italic" style={{ color: C.sub }}>{structured.cautionNote}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <ActionBtn onClick={() => act("save")} label="Save privately" />
            <ActionBtn onClick={() => act("publish")} label="Publish anonymized report" />
            <ActionBtn onClick={() => act("notify")} label="Notify trusted contact" />
            <ActionBtn onClick={() => act("authority")} label="Submit to authority" primary />
            <ActionBtn onClick={() => act("none")} label="Take no action yet" />
          </div>
          {message && <p className="text-xs mt-3 font-medium" style={{ color: C.safe }}>{message}</p>}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold" style={{ color: C.sub }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm rounded-lg p-2 mt-1 outline-none ss-field" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card, color: C.ink }} />
    </div>
  );
}

function ActionBtn({ label, onClick, primary }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={primary ? { backgroundColor: C.navy, color: "#fff" } : { backgroundColor: C.bg, color: C.ink, border: `1px solid ${C.line}` }}>
      {label}
    </button>
  );
}

// ---------- SOS Tab ----------
function SOSTab() {
  const [phrase, setPhrase] = useState("Code Blue");
  const [gesture, setGesture] = useState("Shake phone");
  const [contact, setContact] = useState("Priya — +91 98XXXXXXXX");
  const [stage, setStage] = useState("idle"); // idle -> confirm -> protocol

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>Personalized SOS</h1>
      <p className="text-sm mt-1" style={{ color: C.sub }}>You define the trigger. SafeSphere never guesses whether something happened — it responds to what you set up.</p>

      <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <div className="font-semibold text-sm mb-3">Your trigger</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold" style={{ color: C.sub }}>Phrase</label>
            <select value={phrase} onChange={(e) => setPhrase(e.target.value)} className="w-full text-sm rounded-lg p-2 mt-1 ss-field" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card, color: C.ink }}>
              <option>Code Blue</option><option>Help Now</option><option>Red Alert</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.sub }}>Gesture</label>
            <select value={gesture} onChange={(e) => setGesture(e.target.value)} className="w-full text-sm rounded-lg p-2 mt-1 ss-field" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card, color: C.ink }}>
              <option>Shake phone</option><option>Long press power button</option><option>Triple tap screen</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold" style={{ color: C.sub }}>Trusted contact</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} className="w-full text-sm rounded-lg p-2 mt-1 ss-field" style={{ border: `1px solid ${C.line}`, backgroundColor: C.card, color: C.ink }} />
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: C.sub }}>Trigger set: <strong>{phrase}</strong> + <strong>{gesture}</strong></p>
      </div>

      {stage === "idle" && (
        <button onClick={() => setStage("confirm")} className="mt-4 w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2" style={{ backgroundColor: C.high }}>
          <AlertTriangle size={16} /> Simulate trigger activation
        </button>
      )}

      {stage === "confirm" && (
        <div className="mt-4 rounded-xl p-5 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="font-semibold">Trigger detected. Are you safe?</div>
          <p className="text-xs mt-1" style={{ color: C.sub }}>If there's no response shortly, we move to the safety protocol automatically.</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => setStage("idle")} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: C.safeBg, color: C.safe }}>Yes, I'm safe</button>
            <button onClick={() => setStage("protocol")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: C.high }}>No — need help</button>
          </div>
        </div>
      )}

      {stage === "protocol" && (
        <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: C.high }}><ShieldAlert size={16} /> Safety protocol active</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 size={15} style={{ color: C.safe }} /> {contact} notified with your last known location</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={15} style={{ color: C.safe }} /> Live location sharing active for 15 minutes</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={15} style={{ color: C.safe }} /> Nearby resources below</li>
          </ul>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {RESOURCES.map((r) => (
              <div key={r.name} className="flex items-center gap-2 text-xs rounded-lg p-2" style={{ backgroundColor: C.bg }}>
                <r.icon size={14} style={{ color: C.navy }} /> {r.name} <span className="ml-auto font-semibold">{r.distance}</span>
              </div>
            ))}
          </div>
          <a href="tel:112" className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: C.navy }}>
            <Phone size={14} /> Call emergency number
          </a>
          <button onClick={() => setStage("idle")} className="w-full mt-2 text-xs" style={{ color: C.sub }}>Reset demo</button>
        </div>
      )}
    </div>
  );
}

// ---------- Reports / Accountability Tab ----------
function ReportsTab() {
  const [, forceRender] = useState(0);
  React.useEffect(() => {
    const handler = () => forceRender((n) => n + 1);
    window.addEventListener("safesphere-reports-updated", handler);
    return () => window.removeEventListener("safesphere-reports-updated", handler);
  }, []);
  const reports = window.__reports || [];

  function advance(id) {
    const r = reports.find((x) => x.id === id);
    const next = r.steps.findIndex((s) => !s.done);
    if (next !== -1) {
      r.steps[next].done = true;
      r.steps[next].date = todayStr();
      forceRender((n) => n + 1);
    }
  }

  function followUp(id) {
    const r = reports.find((x) => x.id === id);
    if (r.followUpsUsed < 3) {
      r.followUpsUsed += 1;
      forceRender((n) => n + 1);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora, sans-serif" }}>My reports</h1>
      <p className="text-sm mt-1" style={{ color: C.sub }}>SafeSphere doesn't stop at "submitted" — track what happens after.</p>

      {reports.length === 0 && (
        <div className="mt-6 rounded-xl p-6 text-center text-sm" style={{ backgroundColor: C.card, border: `1px dashed ${C.line}`, color: C.sub }}>
          No reports yet. Submit one from SafeSpeak to see it tracked here.
        </div>
      )}

      <div className="mt-5 space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">{r.id}</div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: C.bg, color: C.sub }}>{r.severity} severity</span>
            </div>
            <p className="text-xs mt-1" style={{ color: C.sub }}>{r.incidentType} · {r.location}</p>

            <div className="mt-3 space-y-1.5">
              {r.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {s.done ? <CheckCircle2 size={16} style={{ color: C.safe }} /> : <Circle size={16} style={{ color: C.line }} />}
                  <span style={{ color: s.done ? C.ink : C.sub }}>{s.label}</span>
                  {s.date && <span className="text-xs ml-auto" style={{ color: C.sub }}>{s.date}</span>}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => advance(r.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: C.navy }}>
                <ChevronRight size={13} /> Simulate authority update
              </button>
              <button onClick={() => followUp(r.id)} disabled={r.followUpsUsed >= 3}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                style={{ backgroundColor: C.bg, color: C.ink, border: `1px solid ${C.line}` }}>
                <MessageSquare size={13} /> Request update ({3 - r.followUpsUsed} left)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}