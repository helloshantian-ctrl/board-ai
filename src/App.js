// ================================================================
//  src/App.js
//  与 Artifact "AI董事会决策系统 v4.2 企业版" 完全一致
//  唯一改动：ai() 函数的 fetch 地址改为 /api/chat（Vercel 代理）
// ================================================================
import { useState, useRef, useEffect } from "react";

function FreeTextarea({ defaultValue = "", innerRef, ...props }) {
  return <textarea ref={innerRef} defaultValue={defaultValue} {...props} />;
}

const BOARD_CONFIGS = {
  strategy: {
    label: "集团战略委员会", icon: "🧭", color: "#6366f1",
    desc: "适用于战略方向、市场布局、业务组合决策",
    directors: [
      { id: "cso",   name: "首席战略官",   icon: "🎯", color: "#6366f1", focus: "战略规划与竞争格局", style: "你是大型科技集团首席战略官，专注于长期竞争壁垒、市场格局演变、业务组合优化和战略协同。习惯以3-5年视角评估决策，关注护城河是否可持续。" },
      { id: "ceo",   name: "集团CEO",      icon: "👑", color: "#8b5cf6", focus: "全局资源分配与执行", style: "你是集团CEO，承担最终决策责任。关注战略落地可行性、组织执行力、外部环境变化和股东价值。善于在复杂约束下做最优取舍。" },
      { id: "cfo",   name: "集团CFO",      icon: "💰", color: "#10b981", focus: "财务健康与资本配置", style: "你是集团CFO，严格审查资本回报率、财务风险敞口和预算纪律。每个战略决策都必须有清晰的财务模型支撑，不接受模糊的财务假设。" },
      { id: "bd",    name: "战略投资VP",   icon: "🤝", color: "#f59e0b", focus: "外部生态与并购机会", style: "你负责战略投资和外部合作，关注行业整合机会、生态布局和外部资源引入。熟悉一级市场估值逻辑和并购整合难点。" },
      { id: "board", name: "独立董事",     icon: "⚖️", color: "#64748b", focus: "治理合规与股东利益", style: "你是经验丰富的独立董事，代表外部股东利益，关注公司治理、信息披露、ESG责任和长期声誉。会对激进方案提出审慎质疑。" },
    ]
  },
  tech: {
    label: "技术委员会", icon: "💻", color: "#3b82f6",
    desc: "适用于技术立项、架构决策、AI/基础设施投资",
    directors: [
      { id: "cto",      name: "首席技术官",  icon: "🔬", color: "#3b82f6", focus: "技术愿景与架构演进", style: "你是大型科技公司CTO，关注技术栈选择、架构可扩展性、技术债务管理和工程文化。技术决策必须兼顾短期交付和长期可维护性。" },
      { id: "arch",     name: "首席架构师",  icon: "🏗️", color: "#6366f1", focus: "系统设计与技术风险", style: "你是首席架构师，深度评估系统复杂度、集成风险、性能边界和安全合规。对'简单方案被复杂化'保持警惕。" },
      { id: "ai",       name: "AI负责人",    icon: "🤖", color: "#8b5cf6", focus: "AI能力建设与落地",   style: "你负责AI战略与产品落地，评估模型能力边界、数据飞轮效应、AI伦理合规和商业化路径。区分炒作和真实技术价值。" },
      { id: "infra",    name: "基础设施VP",  icon: "⚙️", color: "#10b981", focus: "成本效率与可靠性",   style: "你负责基础设施，关注算力成本、SLA承诺、灾备方案和规模化运维能力。成本控制是你的核心KPI。" },
      { id: "security", name: "首席安全官",  icon: "🛡️", color: "#ef4444", focus: "安全合规与风险控制", style: "你是CISO，任何决策都必须通过安全审查。关注数据安全、合规监管、供应链风险和安全事件响应能力。安全不是可以妥协的选项。" },
    ]
  },
  investment: {
    label: "投资决策委员会", icon: "💼", color: "#10b981",
    desc: "适用于大额投资、并购、战略融资决策",
    directors: [
      { id: "cic",   name: "投委会主席", icon: "🏛️", color: "#10b981", focus: "投资组合与战略协同", style: "你主持投委会，统筹考量投资标的与集团战略的协同价值、资本配置效率和投后管理资源。" },
      { id: "fa",    name: "财务顾问",   icon: "📊", color: "#6366f1", focus: "估值与交易结构",    style: "你是资深财务顾问，专注DCF建模、可比交易分析、交易条款谈判和交割风险。对过度乐观的财务假设保持高度警惕。" },
      { id: "legal", name: "法务总顾问", icon: "⚖️", color: "#f59e0b", focus: "法律尽调与合规",    style: "你是法务总顾问，负责反垄断审查、知识产权尽调、劳动法合规和跨境监管风险。任何法律不确定性都需在决策中明确标注。" },
      { id: "risk",  name: "首席风险官", icon: "🛡️", color: "#ef4444", focus: "风险敞口与情景压测", style: "你是CRO，对投资标的进行多情景压力测试，识别宏观风险、行业周期风险和整合失败风险。提供最坏情景下的风险量化。" },
      { id: "ops",   name: "整合负责人", icon: "🔧", color: "#8b5cf6", focus: "并购整合与执行落地", style: "你负责投后整合，评估文化融合难度、系统整合复杂度和人才留存风险。交易价值能否实现取决于整合执行质量。" },
    ]
  },
  compliance: {
    label: "合规与风险委员会", icon: "🏛️", color: "#f59e0b",
    desc: "适用于监管应对、合规审查、危机处置决策",
    directors: [
      { id: "cco",    name: "首席合规官",     icon: "📋", color: "#f59e0b", focus: "监管合规与政策解读", style: "你是CCO，深度理解国内外监管动态，评估合规风险敞口和整改路径。在监管不明确时采用保守解释原则。" },
      { id: "legal2", name: "法务总监",       icon: "⚖️", color: "#6366f1", focus: "法律风险与诉讼管理", style: "你是法务总监，评估潜在法律责任、诉讼风险和监管处罚规模。区分可接受的法律不确定性和必须规避的法律红线。" },
      { id: "pr",     name: "公关危机负责人", icon: "📣", color: "#ec4899", focus: "声誉管理与危机传播", style: "你负责公关和危机传播，评估事件的舆情扩散潜力、媒体响应节奏和声誉修复路径。第一时间的应对决策往往决定危机走向。" },
      { id: "gov",    name: "政府关系VP",     icon: "🌐", color: "#10b981", focus: "政策环境与政企关系", style: "你负责政府关系，理解政策制定逻辑、监管机构诉求和行业协会立场。在合规与业务发展间寻找最优解。" },
      { id: "audit",  name: "内部审计总监",   icon: "🔍", color: "#64748b", focus: "内控体系与审计发现", style: "你是内审总监，从内控视角评估决策的可审计性、执行规范性和潜在舞弊风险。关注流程合规而非仅关注结果。" },
    ]
  },
};

const TEMPLATES = [
  { cat: "战略规划", icon: "🧭", items: [
    { title: "新业务线立项评审",  board: "strategy",   topic: "是否批准立项[业务线名称]？",                      bg: "市场规模预估、竞争格局、所需投入（人力/资本）、与现有业务协同度、预期盈亏平衡时间" },
    { title: "市场退出决策",      board: "strategy",   topic: "是否退出[市场/业务]，资源转移至核心赛道？",        bg: "该业务当前营收贡献、战略价值、退出成本、客户影响、内外部舆论压力" },
    { title: "集团业务分拆上市",  board: "investment", topic: "是否推进[子公司名称]独立上市？",                   bg: "子公司当前估值、与集团协同度、上市时机窗口、对集团股价影响、监管审批路径" },
  ]},
  { cat: "技术与产品", icon: "💻", items: [
    { title: "大模型自研 vs 采购", board: "tech", topic: "核心AI大模型是自研、微调开源模型还是采购API？",        bg: "当前AI团队规模、预算上限、业务对模型的定制化需求程度、数据安全合规要求、竞争对手现状" },
    { title: "核心系统重构",       board: "tech", topic: "是否对[核心系统]进行全面重构？",                        bg: "现有系统技术债务程度、重构预估工期和成本、对业务连续性的影响、团队能力评估" },
    { title: "数据中台建设投入",   board: "tech", topic: "是否批准数据中台建设项目，预算为[X]亿？",              bg: "当前数据基础设施现状、业务方需求调研结果、建设周期预估、类似项目行业案例" },
  ]},
  { cat: "投融资并购", icon: "💼", items: [
    { title: "战略并购立项",     board: "investment", topic: "是否启动对[目标公司]的并购谈判？",                  bg: "标的估值区间、核心资产（技术/用户/团队）、整合难度评估、反垄断风险、支付方式" },
    { title: "战略融资接受条款", board: "investment", topic: "是否接受[投资方]的战略投资条款？",                  bg: "投资金额、估值、关键条款（优先清算权/一票否决权/反稀释）、投资方战略价值、替代方案" },
  ]},
  { cat: "合规与危机", icon: "🚨", items: [
    { title: "监管调查应对策略", board: "compliance", topic: "监管机构对[业务领域]启动调查，如何制定应对策略？",  bg: "调查范围、核心指控、公司实际合规情况、类似案例处罚规模、内外部顾问建议" },
    { title: "数据安全事件响应", board: "compliance", topic: "发生[规模]用户数据泄露事件，决策响应方案？",         bg: "泄露数据类型和规模、事件根因、受影响用户情况、当前媒体关注度、监管通报义务" },
  ]},
  { cat: "组织人才", icon: "👥", items: [
    { title: "高管引进决策", board: "strategy", topic: "是否引进外部[职位]，薪酬包为[金额+股权]？",              bg: "候选人背景、内部晋升候选人情况、该岗位当前痛点、薪酬包对团队公平性影响" },
    { title: "组织架构调整", board: "strategy", topic: "是否推行[组织变革方案]，涉及[N]个部门整合？",            bg: "变革动因、影响人员规模、核心骨干态度、变革窗口期选择、外部顾问建议" },
  ]},
];

const DEPTHS = [
  { key: "fast", label: "快速", rounds: 2, desc: "~3min", icon: "⚡" },
  { key: "std",  label: "标准", rounds: 3, desc: "~5min", icon: "⚖️" },
  { key: "deep", label: "深度", rounds: 5, desc: "~9min", icon: "🔍" },
];
const PHASE_LABELS = ["初始立场", "深度质询", "交叉辩论", "立场修正", "最终陈述"];

// ── API：走 /api/chat 代理，不暴露 Key ──────────────────────────
async function ai(sys, user) {
  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: sys,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!r.ok) { const t = await r.text(); throw new Error(`API ${r.status}: ${t.slice(0, 200)}`); }
  const data = await r.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}

// ── Storage：localStorage ────────────────────────────────────────
const LS = "boardai_";
function lsSave(id, val) { try { localStorage.setItem(LS + id, JSON.stringify(val)); } catch {} }
function lsLoad() {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(LS))
      .map(k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })
      .filter(Boolean).sort((a, b) => b.ts - a.ts);
  } catch { return []; }
}
function lsDel(id) { try { localStorage.removeItem(LS + id); } catch {} }

// ── Export ───────────────────────────────────────────────────────
function exportTxt(meta, report, msgs) {
  const BOM = "\uFEFF";
  const cv = v => v >= 75 ? "高" : v >= 50 ? "中" : "低";
  const lines = [
    "╔══════════════════════════════════════════════════╗",
    "║       AI BOARD INTELLIGENCE PLATFORM             ║",
    "║              企业级决策分析报告                   ║",
    "╚══════════════════════════════════════════════════╝",
    "", `报告编号：RPT-${meta.id}`, `生成时间：${new Date(meta.ts).toLocaleString("zh-CN")}`,
    `委员会：${meta.boardLabel}`, `推演深度：${meta.depthLabel}`, "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "  议题",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", meta.topic, "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "  执行摘要",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", report.recommendation, "",
    `可信度：${report.confidence}%（${cv(report.confidence)}）  共识：${report.consensus}  紧迫度：${report.urgency || "-"}`, "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "  决策理由",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", report.rationale, "",
    `核心洞察：${report.keyInsight || "-"}`, "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "  风险矩阵",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ...(report.risks || []).map((r, i) => `  ${i+1}. [${report.riskLevels?.[i] || "-"}] ${r}`), "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "  行动清单",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ...(report.actions || []).map((a, i) => `  ${i+1}. ${a}${report.owners?.[i] ? "  【" + report.owners[i] + "】" : ""}`), "",
    `异议备案：${report.dissent || "-"}`, `后续跟进：${report.followUp || "-"}`, "",
    "══════════════════════════════════════════════", "  完整讨论记录",
    "══════════════════════════════════════════════",
    ...msgs.map(m => `\n  [${PHASE_LABELS[m.phase] || "发言"} · ${m.dir.name}]\n  ${m.text}`),
    "", "  ── 报告结束 ──",
  ];
  const blob = new Blob([BOM + lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `BoardReport_${meta.id}.txt` });
  a.click();
}

// ════════════════════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView]             = useState("home");
  const [boardKey, setBoardKey]     = useState("strategy");
  const [directors, setDirectors]   = useState(BOARD_CONFIGS.strategy.directors);
  const [depth, setDepth]           = useState("fast");
  const [cmpMode, setCmpMode]       = useState(false);
  const [docs, setDocs]             = useState([]);
  const [msgs, setMsgs]             = useState([]);
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [report, setReport]         = useState(null);
  const [cmpRpt, setCmpRpt]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [loadMsg, setLoadMsg]       = useState("");
  const [history, setHistory]       = useState([]);
  const [histLoaded, setHistLoaded] = useState(false);
  const [editDir, setEditDir]       = useState(null);
  const [tmplOpen, setTmplOpen]     = useState(false);
  const [curRunId, setCurRunId]     = useState(null);

  const topicRef = useRef(null);
  const bgRef    = useRef(null);
  const planARef = useRef(null);
  const planBRef = useRef(null);
  const fileRef  = useRef(null);
  const botRef   = useRef(null);

  useEffect(() => { botRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading, report, cmpRpt]);
  useEffect(() => {
    if (view === "history" && !histLoaded) { setHistory(lsLoad()); setHistLoaded(true); }
  }, [view, histLoaded]);

  const board  = BOARD_CONFIGS[boardKey];
  const rounds = DEPTHS.find(d => d.key === depth)?.rounds || 2;
  const setBoard = k => { setBoardKey(k); setDirectors(BOARD_CONFIGS[k].directors); };

  const fillTemplate = it => {
    if (topicRef.current) topicRef.current.value = it.topic;
    if (bgRef.current)    bgRef.current.value    = it.bg;
    setBoard(it.board);
    setTmplOpen(false);
  };

  const addDoc = e => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setDocs(d => [...d, { name: file.name, content: ev.target.result.slice(0, 4000), size: (file.size / 1024).toFixed(1) + "KB" }]);
      reader.readAsText(file);
    });
    e.target.value = "";
  };

  const run = async () => {
    const topic = topicRef.current?.value?.trim() || "";
    const bg    = bgRef.current?.value?.trim()    || "";
    if (!topic) return;
    const id = Date.now().toString(); setCurRunId(id);
    setView("run"); setMsgs([]); setReport(null); setCmpRpt(null); setLoading(true);
    const docCtx = docs.length ? "\n\n" + docs.map(d => `【附件：${d.name}】\n${d.content}`).join("\n\n") : "";
    const bgFull = bg + docCtx;
    const all = []; const push = m => { all.push(m); setMsgs([...all]); };
    try {
      for (let r = 0; r < rounds; r++) {
        setPhaseIdx(r); setLoadMsg(`${PHASE_LABELS[r]} · 进行中...`);
        const prev = all.length ? "\n\n前轮摘要：\n" + all.slice(-directors.length * 2).map(m => `[${m.dir.name}]${m.text.slice(0, 120)}`).join("\n") : "";
        for (const dir of directors) {
          const sys = `你是${board.label}的${dir.name}。${dir.style}\n用中文回复，250字以内，立场鲜明，可引用附件数据。`;
          const prompt = `议题：${topic}\n背景：${bgFull || "暂无"}${prev}\n\n当前阶段：${PHASE_LABELS[r]}。${r === 0 ? "请基于职责发表初始立场和核心关切。" : r === rounds - 1 ? "请综合讨论做最终建议和表决立场。" : "请针对前轮发言提出质疑、补充或修正立场。"}`;
          push({ phase: r, dir, text: await ai(sys, prompt) });
        }
      }
      setPhaseIdx(rounds); setLoadMsg("生成决策报告...");
      const disc = all.map(m => `[${PHASE_LABELS[m.phase]}·${m.dir.name}] ${m.text}`).join("\n\n");
      const raw = await ai(
        "你是企业级董事会秘书，生成结构化决策报告，仅输出JSON，禁止其他内容。",
        `委员会：${board.label}\n议题：${topic}\n\n${disc}\n\n输出：{"recommendation":"","rationale":"","risks":[],"riskLevels":[],"actions":[],"owners":[],"dissent":"","confidence":0,"consensus":"高/中/低","keyInsight":"","urgency":"高/中/低","followUp":""}`
      );
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
      catch { parsed = { recommendation: raw, rationale: "", risks: [], riskLevels: [], actions: [], owners: [], dissent: "", confidence: 70, consensus: "中", keyInsight: "", urgency: "中", followUp: "" }; }
      setReport(parsed);
      const depthLabel = DEPTHS.find(d => d.key === depth)?.label || depth;
      const rec = { id, ts: Date.now(), topic, bg: bgFull, depth, boardKey, boardLabel: board.label, depthLabel, report: parsed, msgs: all };
      lsSave(id, rec);
      if (histLoaded) setHistory(h => [rec, ...h]);
    } catch (e) { push({ phase: 0, dir: directors[0], text: "❌ " + e.message }); }
    setLoading(false); setLoadMsg("");
  };

  const runCmp = async () => {
    const topic = topicRef.current?.value?.trim() || "";
    const bg    = bgRef.current?.value?.trim()    || "";
    const pA    = planARef.current?.value?.trim() || "";
    const pB    = planBRef.current?.value?.trim() || "";
    if (!topic || !pA || !pB) return;
    setView("run"); setMsgs([]); setReport(null); setCmpRpt(null); setLoading(true);
    const docCtx = docs.length ? "\n\n" + docs.map(d => `【附件：${d.name}】\n${d.content}`).join("\n\n") : "";
    try {
      const sys = `你是${board.label}，评估方案。仅输出JSON：{"pros":[],"cons":[],"score":0,"risk":"高/中/低","summary":""}`;
      setLoadMsg("推演方案A..."); const rA = await ai(sys, `议题：${topic}\n方案：${pA}\n背景：${bg + docCtx || "暂无"}`);
      setLoadMsg("推演方案B..."); const rB = await ai(sys, `议题：${topic}\n方案：${pB}\n背景：${bg + docCtx || "暂无"}`);
      setLoadMsg("综合对比...");
      const rC = await ai(
        `你是首席战略顾问，综合两方案给建议。仅输出JSON：{"winner":"A或B或平局","reason":"","recommendation":"","confidence":0,"condition":"","nextStep":""}`,
        `议题：${topic}\nA：${rA}\nB：${rB}`
      );
      const p = t => { try { return JSON.parse(t.replace(/```json|```/g, "").trim()); } catch { return {}; } };
      setCmpRpt({ a: p(rA), b: p(rB), c: p(rC) });
    } catch (e) { setMsgs([{ phase: 0, dir: directors[0], text: "❌ " + e.message }]); }
    setLoading(false); setLoadMsg("");
  };

  // ── Styles ──────────────────────────────────────────────────────
  const C = { bg: "#0a0a14", card: "rgba(255,255,255,0.035)", border: "rgba(255,255,255,0.08)", muted: "#475569", text: "#e2e8f0", sub: "#94a3b8" };
  const card  = (x = {}) => ({ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 18, ...x });
  const sec   = (c = "#6366f1", x = {}) => ({ background: c + "0d", border: `1px solid ${c}28`, borderRadius: 11, padding: 14, ...x });
  const btn   = (on, c = "#6366f1", x = {}) => ({ padding: "8px 16px", borderRadius: 8, border: on ? "none" : `1px solid ${C.border}`, background: on ? `linear-gradient(135deg,${c},${c}cc)` : C.card, color: on ? "#fff" : C.sub, cursor: "pointer", fontWeight: 600, fontSize: 13, ...x });
  const iStyle = (x = {}) => ({ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6, ...x });
  const tag   = (c, t) => <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: c + "20", color: c, fontWeight: 700 }}>{t}</span>;
  const cc    = v => v >= 75 ? "#10b981" : v >= 50 ? "#f59e0b" : "#ef4444";

  // ── Nav ─────────────────────────────────────────────────────────
  const Nav = () => (
    <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 18px", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 2, position: "sticky", top: 0, zIndex: 99, backdropFilter: "blur(12px)" }}>
      <div onClick={() => setView("home")} style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 14, padding: "12px 0", cursor: "pointer" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
        <span style={{ fontWeight: 900, fontSize: 13, color: "#a5b4fc" }}>BoardAI</span>
        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>Enterprise</span>
      </div>
      {[["home","决策台"],["history","记录"],["settings","配置"]].map(([v, lb]) => (
        <button key={v} onClick={() => setView(v)} style={{ padding: "12px 11px", border: "none", background: "none", color: view === v ? "#a5b4fc" : C.muted, cursor: "pointer", fontSize: 12, fontWeight: view === v ? 700 : 500, borderBottom: view === v ? "2px solid #6366f1" : "2px solid transparent", marginBottom: -1 }}>{lb}</button>
      ))}
      {view === "run" && <button onClick={() => setView("home")} style={{ ...btn(false, "#6366f1", { marginLeft: "auto", padding: "5px 12px", fontSize: 11 }) }}>← 返回</button>}
    </div>
  );

  // ── Home ────────────────────────────────────────────────────────
  const HomeView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", padding: "20px 0 4px" }}>
        <div style={{ fontSize: 30, marginBottom: 5 }}>🏛️</div>
        <h1 style={{ fontSize: 19, fontWeight: 900, margin: 0, background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Board Intelligence Platform</h1>
        <p style={{ color: C.muted, marginTop: 4, fontSize: 11 }}>企业级 · 行业专属 · 多委员会 · 正式报告导出</p>
      </div>
      <div>
        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>选择委员会</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {Object.entries(BOARD_CONFIGS).map(([k, v]) => (
            <button key={k} onClick={() => setBoard(k)} style={{ ...btn(boardKey === k, v.color, { textAlign: "left", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 3 }) }}>
              <span style={{ fontSize: 15 }}>{v.icon} <span style={{ fontSize: 13, fontWeight: 700 }}>{v.label}</span></span>
              <span style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>{v.desc}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
          {directors.map(d => <span key={d.id} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 6, background: d.color + "18", color: d.color, fontWeight: 600 }}>{d.icon} {d.name}</span>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setCmpMode(false)} style={btn(!cmpMode)}>单方案推演</button>
        <button onClick={() => setCmpMode(true)}  style={btn(cmpMode, "#8b5cf6")}>⚖️ A/B对比分析</button>
      </div>
      <div style={card()}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 10, color: C.sub, fontWeight: 700 }}>决策议题 *</label>
              <button onClick={() => setTmplOpen(o => !o)} style={{ ...btn(tmplOpen, "#6366f1", { padding: "3px 10px", fontSize: 10 }) }}>📚 模板库</button>
            </div>
            {tmplOpen && (
              <div style={{ ...card({ padding: 10, marginBottom: 10, maxHeight: 260, overflowY: "auto" }) }}>
                {TEMPLATES.map(cat => (
                  <div key={cat.cat} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 5 }}>{cat.icon} {cat.cat}</div>
                    {cat.items.map(it => (
                      <div key={it.title} onClick={() => fillTemplate(it)} style={{ padding: "7px 10px", borderRadius: 8, marginBottom: 3, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", cursor: "pointer" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc" }}>{it.title}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{it.topic}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <FreeTextarea innerRef={topicRef} placeholder="例如：是否批准大模型自研立项？是否启动对某公司并购谈判？" style={{ ...iStyle({ minHeight: 68, resize: "vertical" }) }} />
          </div>
          {cmpMode && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["A","#6366f1",planARef],["B","#8b5cf6",planBRef]].map(([l, c, ref]) => (
                <div key={l}>
                  <label style={{ fontSize: 10, color: c, fontWeight: 700, display: "block", marginBottom: 5 }}>方案 {l}</label>
                  <FreeTextarea innerRef={ref} placeholder={`详细描述方案${l}...`} style={{ ...iStyle({ minHeight: 68, resize: "vertical" }) }} />
                </div>
              ))}
            </div>
          )}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 10, color: C.sub, fontWeight: 700 }}>背景信息</label>
              <button onClick={() => fileRef.current?.click()} style={{ ...btn(docs.length > 0, "#10b981", { padding: "3px 10px", fontSize: 10 }) }}>
                📎 上传文件{docs.length > 0 ? ` (${docs.length})` : ""}
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".txt,.md,.csv" multiple style={{ display: "none" }} onChange={addDoc} />
            {docs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                {docs.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 7, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 11 }}>
                    <span style={{ color: "#6ee7b7" }}>📄 {d.name}</span>
                    <span style={{ color: C.muted }}>{d.size}</span>
                    <button onClick={() => setDocs(x => x.filter((_, j) => j !== i))} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <FreeTextarea innerRef={bgRef} placeholder="公司背景、财务数据、竞争情况、已知约束条件..." style={{ ...iStyle({ minHeight: 52, resize: "vertical" }) }} />
          </div>
          {!cmpMode && (
            <div>
              <label style={{ fontSize: 10, color: C.sub, fontWeight: 700, display: "block", marginBottom: 6 }}>推演深度</label>
              <div style={{ display: "flex", gap: 7 }}>
                {DEPTHS.map(d => (
                  <button key={d.key} onClick={() => setDepth(d.key)} style={{ ...btn(depth === d.key, "#6366f1", { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "9px 0" }) }}>
                    <span style={{ fontSize: 14 }}>{d.icon}</span>
                    <span style={{ fontSize: 12 }}>{d.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={cmpMode ? runCmp : run} style={{ ...btn(true, "#6366f1", { padding: "12px 0", fontSize: 14, width: "100%" }) }}>
            {cmpMode ? "⚖️ 启动对比推演" : "🚀 启动委员会推演"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Run ─────────────────────────────────────────────────────────
  const RunView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ ...sec(board.color, { display: "flex", gap: 10, alignItems: "flex-start" }) }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: board.color, fontWeight: 700, marginBottom: 3 }}>{board.icon} {board.label}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{topicRef.current?.value || ""}</div>
          {docs.length > 0 && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>📎 {docs.map(d => d.name).join(", ")}</div>}
        </div>
        {(report || cmpRpt) && (
          <button onClick={() => { if (report) exportTxt({ id: curRunId, ts: Date.now(), topic: topicRef.current?.value || "", boardLabel: board.label, depthLabel: DEPTHS.find(d => d.key === depth)?.label }, report, msgs); }}
            style={{ ...btn(true, "#10b981", { padding: "6px 12px", fontSize: 11, whiteSpace: "nowrap" }) }}>📤 导出报告</button>
        )}
      </div>
      {!cmpMode && (
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: rounds }, (_, i) => (
            <div key={i} style={{ flex: 1, padding: "5px 0", borderRadius: 6, textAlign: "center", fontSize: 9, fontWeight: 700, background: i <= phaseIdx ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.02)", border: `1px solid ${i <= phaseIdx ? "rgba(99,102,241,0.35)" : C.border}`, color: i <= phaseIdx ? "#a5b4fc" : "#374151" }}>
              {i < phaseIdx ? "✓" : i === phaseIdx && loading ? "⟳" : i + 1} {PHASE_LABELS[i]}
            </div>
          ))}
        </div>
      )}
      {msgs.map((m, i) => {
        const d = directors.find(x => x.id === m.dir.id) || m.dir;
        return (
          <div key={i} style={{ ...card({ borderLeft: `3px solid ${d.color}`, padding: 13 }) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <span style={{ fontSize: 15 }}>{d.icon}</span>
              <span style={{ fontWeight: 700, color: d.color, fontSize: 12 }}>{d.name}</span>
              {tag(d.color, PHASE_LABELS[m.phase] || "发言")}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: "#cbd5e1" }}>{m.text}</div>
          </div>
        );
      })}
      {loading && (
        <div style={{ ...card({ display: "flex", alignItems: "center", gap: 10, padding: 13 }) }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: "pulse 1s infinite" }} />
          <span style={{ fontSize: 12, color: C.muted }}>{loadMsg}</span>
        </div>
      )}
      {report && !cmpMode && (
        <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.28)", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#a5b4fc" }}>委员会决策报告</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
              {report.urgency && <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: C.muted }}>紧迫度</div>{tag(report.urgency === "高" ? "#ef4444" : report.urgency === "中" ? "#f59e0b" : "#10b981", report.urgency)}</div>}
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: C.muted }}>共识</div><div style={{ fontWeight: 700, fontSize: 12, color: report.consensus === "高" ? "#10b981" : report.consensus === "中" ? "#f59e0b" : "#ef4444" }}>{report.consensus}</div></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: cc(report.confidence), lineHeight: 1 }}>{report.confidence}%</div>
                <div style={{ fontSize: 9, color: C.muted }}>可信度</div>
                <div style={{ marginTop: 3, height: 3, width: 56, borderRadius: 2, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ height: "100%", width: report.confidence + "%", background: cc(report.confidence), borderRadius: 2 }} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={sec("#10b981")}><div style={{ fontSize: 9, color: "#10b981", fontWeight: 700, marginBottom: 5 }}>✅ 推荐决策</div><div style={{ fontSize: 14, fontWeight: 700 }}>{report.recommendation}</div></div>
            <div style={card({ padding: 13 })}><div style={{ fontSize: 9, color: C.sub, fontWeight: 700, marginBottom: 5 }}>📝 决策理由</div><div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8 }}>{report.rationale}</div></div>
            {report.keyInsight && <div style={sec("#f59e0b")}><div style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700, marginBottom: 5 }}>💡 核心洞察</div><div style={{ fontSize: 13, color: "#fcd34d" }}>{report.keyInsight}</div></div>}
            <div style={sec("#ef4444")}>
              <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, marginBottom: 8 }}>⚠️ 风险矩阵</div>
              {(report.risks || []).map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                  {report.riskLevels?.[i] && tag(report.riskLevels[i] === "高" ? "#ef4444" : report.riskLevels[i] === "中" ? "#f59e0b" : "#10b981", report.riskLevels[i])}
                  <span style={{ fontSize: 12, color: "#fca5a5" }}>{r}</span>
                </div>
              ))}
            </div>
            <div style={sec("#3b82f6")}>
              <div style={{ fontSize: 9, color: "#3b82f6", fontWeight: 700, marginBottom: 8 }}>🚀 行动清单</div>
              {(report.actions || []).map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#60a5fa", minWidth: 14 }}>{i + 1}.</span>
                  <span style={{ fontSize: 12, color: "#93c5fd", flex: 1 }}>{a}</span>
                  {report.owners?.[i] && <span style={{ fontSize: 10, color: C.muted }}>{report.owners[i]}</span>}
                </div>
              ))}
            </div>
            {report.dissent  && <div style={sec("#f59e0b")}><div style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700, marginBottom: 5 }}>🗣️ 异议备案</div><div style={{ fontSize: 12, color: "#fcd34d" }}>{report.dissent}</div></div>}
            {report.followUp && <div style={card({ padding: 11 })}><div style={{ fontSize: 9, color: C.sub, fontWeight: 700, marginBottom: 4 }}>📌 后续跟进</div><div style={{ fontSize: 12, color: "#cbd5e1" }}>{report.followUp}</div></div>}
          </div>
        </div>
      )}
      {cmpRpt && cmpMode && (
        <div style={card()}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#a5b4fc", marginBottom: 14 }}>⚖️ 方案对比分析报告</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[["A","#6366f1",cmpRpt.a],["B","#8b5cf6",cmpRpt.b]].map(([l, c, d]) => (
              <div key={l} style={sec(c)}>
                <div style={{ fontWeight: 800, color: c, fontSize: 13, marginBottom: 8 }}>方案 {l}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: c, marginBottom: 2 }}>{d?.score ?? "—"}<span style={{ fontSize: 10, color: C.muted }}>/100</span></div>
                {d?.risk && <div style={{ marginBottom: 7 }}>{tag(d.risk === "高" ? "#ef4444" : d.risk === "中" ? "#f59e0b" : "#10b981", "风险" + d.risk)}</div>}
                {(d?.pros || []).map((p, i) => <div key={i} style={{ fontSize: 11, color: "#86efac", marginBottom: 2 }}>✓ {p}</div>)}
                {(d?.cons || []).map((p, i) => <div key={i} style={{ fontSize: 11, color: "#fca5a5", marginBottom: 2 }}>✗ {p}</div>)}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 7 }}>{d?.summary}</div>
              </div>
            ))}
          </div>
          {cmpRpt.c && (
            <div style={sec("#10b981")}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: "#10b981", fontSize: 13 }}>推荐方案 {cmpRpt.c.winner}</span>
                <span style={{ fontSize: 10, color: C.muted }}>可信度 {cmpRpt.c.confidence}%</span>
              </div>
              <div style={{ fontSize: 12, color: "#86efac", marginBottom: 5 }}>{cmpRpt.c.reason}</div>
              <div style={{ fontSize: 12, color: C.text, marginBottom: 5 }}>{cmpRpt.c.recommendation}</div>
              {cmpRpt.c.condition && <div style={{ fontSize: 11, color: C.muted }}>⚡ 前置条件：{cmpRpt.c.condition}</div>}
              {cmpRpt.c.nextStep  && <div style={{ fontSize: 11, color: "#a7f3d0", marginTop: 4 }}>📌 下一步：{cmpRpt.c.nextStep}</div>}
            </div>
          )}
        </div>
      )}
      <div ref={botRef} />
    </div>
  );

  // ── History ─────────────────────────────────────────────────────
  const HistView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#a5b4fc" }}>🗂️ 决策档案库</div>
      {histLoaded && history.length === 0 && <div style={{ ...card(), color: C.muted, textAlign: "center", padding: 40, fontSize: 13 }}>暂无记录</div>}
      {history.map(rec => (
        <div key={rec.id} style={card()}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>{rec.topic}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
                {rec.boardLabel && tag("#6366f1", rec.boardLabel)}
                {DEPTHS.find(d => d.key === rec.depth) && tag("#3b82f6", DEPTHS.find(d => d.key === rec.depth).label)}
                {rec.report?.consensus && tag(rec.report.consensus === "高" ? "#10b981" : rec.report.consensus === "中" ? "#f59e0b" : "#ef4444", "共识" + rec.report.consensus)}
                {rec.report?.confidence && tag(cc(rec.report.confidence), rec.report.confidence + "%")}
              </div>
              {rec.report?.recommendation && <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>💡 {rec.report.recommendation}</div>}
              <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>
                {new Date(rec.ts).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })} · #{rec.id.slice(-6)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {rec.report && <button onClick={() => exportTxt(rec, rec.report, rec.msgs || [])} style={{ ...btn(true, "#10b981", { padding: "5px 10px", fontSize: 10 }) }}>导出</button>}
              <button onClick={() => { lsDel(rec.id); setHistory(h => h.filter(r => r.id !== rec.id)); }} style={{ ...btn(false, "#ef4444", { padding: "5px 10px", fontSize: 10, color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }) }}>删除</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Settings ────────────────────────────────────────────────────
  const SettView = () => {
    const [localDirs, setLocalDirs] = useState(directors);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#a5b4fc" }}>⚙️ 委员会角色配置</div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(BOARD_CONFIGS).map(([k, v]) => (
              <button key={k} onClick={() => { setBoard(k); setEditDir(null); }} style={{ ...btn(boardKey === k, v.color, { padding: "4px 10px", fontSize: 10 }) }}>{v.icon} {v.label.slice(0, 5)}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 10, color: C.muted }}>{board.icon} {board.label} · {board.desc}</div>
        {localDirs.map((d, i) => (
          <div key={d.id} style={{ ...card({ borderLeft: `3px solid ${d.color}` }) }}>
            {editDir === i ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr", gap: 7 }}>
                  <div><label style={{ fontSize: 9, color: C.sub, display: "block", marginBottom: 3 }}>图标</label>
                    <input defaultValue={d.icon} onChange={e => setLocalDirs(x => x.map((y, j) => j === i ? { ...y, icon: e.target.value } : y))} style={{ ...iStyle({ textAlign: "center", fontSize: 17 }) }} /></div>
                  <div><label style={{ fontSize: 9, color: C.sub, display: "block", marginBottom: 3 }}>名称</label>
                    <input defaultValue={d.name} onChange={e => setLocalDirs(x => x.map((y, j) => j === i ? { ...y, name: e.target.value } : y))} style={iStyle()} /></div>
                  <div><label style={{ fontSize: 9, color: C.sub, display: "block", marginBottom: 3 }}>专注领域</label>
                    <input defaultValue={d.focus} onChange={e => setLocalDirs(x => x.map((y, j) => j === i ? { ...y, focus: e.target.value } : y))} style={iStyle()} /></div>
                </div>
                <div><label style={{ fontSize: 9, color: C.sub, display: "block", marginBottom: 3 }}>决策风格</label>
                  <textarea defaultValue={d.style} onChange={e => setLocalDirs(x => x.map((y, j) => j === i ? { ...y, style: e.target.value } : y))} style={{ ...iStyle({ minHeight: 60, resize: "vertical" }) }} /></div>
                <button onClick={() => { setDirectors(localDirs); setEditDir(null); }} style={{ ...btn(true, "#10b981", { padding: "7px 0", width: "100%" }) }}>✓ 保存</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 19 }}>{d.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: d.color, fontSize: 12 }}>{d.name}</div><div style={{ fontSize: 10, color: C.muted }}>{d.focus}</div></div>
                <button onClick={() => setEditDir(i)} style={{ ...btn(false, "#6366f1", { padding: "4px 11px", fontSize: 10 }) }}>编辑</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${C.bg} 0%,#111827 55%,#0f172a 100%)`, color: C.text, fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 13px 48px" }}>
        {view === "home"     && <HomeView />}
        {view === "run"      && <RunView />}
        {view === "history"  && <HistView />}
        {view === "settings" && <SettView />}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}} textarea:focus,input:focus{border-color:rgba(99,102,241,.45)!important;box-shadow:0 0 0 2px rgba(99,102,241,.1)} button:active{filter:brightness(.88)}`}</style>
    </div>
  );
}
