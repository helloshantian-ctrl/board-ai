import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = `你是 BoardAI，一位经验丰富的企业董事会级别战略顾问。
你具备深厚的商业战略、公司治理、风险管理、财务分析和领导力发展知识。
你能够用清晰、专业、有深度的方式提供董事会级别的分析和建议。
回答时请使用中文，保持专业但易于理解的语气。`;

const SUGGESTIONS = [
  '分析我们进入东南亚市场的战略风险',
  '如何优化董事会治理结构？',
  '制定数字化转型的优先级框架',
  '评估并购目标的关键指标有哪些？',
];

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(148,163,184,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(15,23,42,0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: 'white',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  badge: {
    marginLeft: 'auto',
    padding: '4px 10px',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 20,
    fontSize: 11,
    color: '#818cf8',
    fontWeight: 600,
  },
  main: {
    width: '100%',
    maxWidth: 800,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 16px',
  },
  welcome: {
    textAlign: 'center',
    padding: '60px 0 32px',
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#f1f5f9',
    marginBottom: 8,
    letterSpacing: '-0.03em',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 1.6,
  },
  suggestions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    margin: '24px 0',
  },
  suggestionBtn: {
    background: 'rgba(30,41,59,0.8)',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s',
    lineHeight: 1.4,
  },
  messages: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  messageRow: {
    display: 'flex',
    gap: 12,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  avatarAI: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
  },
  avatarUser: {
    background: 'rgba(148,163,184,0.15)',
    color: '#94a3b8',
    fontSize: 12,
  },
  bubble: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.7,
  },
  bubbleAI: {
    background: 'rgba(30,41,59,0.9)',
    border: '1px solid rgba(148,163,184,0.08)',
    color: '#cbd5e1',
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    borderTopRightRadius: 4,
  },
  inputArea: {
    position: 'sticky',
    bottom: 0,
    padding: '16px 0 24px',
    background: 'linear-gradient(to top, #0f172a 70%, transparent)',
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    background: 'rgba(30,41,59,0.9)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 14,
    padding: '10px 10px 10px 16px',
    alignItems: 'flex-end',
    backdropFilter: 'blur(12px)',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 1.5,
    resize: 'none',
    maxHeight: 120,
    fontFamily: 'inherit',
    padding: '4px 0',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.15s',
  },
  typing: {
    display: 'flex',
    gap: 4,
    padding: '6px 4px',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#6366f1',
    animation: 'bounce 1.2s infinite',
  },
};

function TypingIndicator() {
  return (
    <div style={styles.typing}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          system: SYSTEM_PROMPT,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || '抱歉，未能获取回复。';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ 请求失败：${e.message}\n\n请确认已在 Vercel 环境变量中配置 \`ANTHROPIC_API_KEY\`。`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .suggestion-btn:hover {
          background: rgba(99,102,241,0.1) !important;
          border-color: rgba(99,102,241,0.3) !important;
          color: #c7d2fe !important;
        }
        textarea::placeholder { color: #475569; }
        .send-btn:hover { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        pre { background: rgba(0,0,0,0.3); border-radius: 6px; padding: 12px; overflow-x: auto; }
        code { font-size: 13px; }
        p { margin-bottom: 8px; }
        p:last-child { margin-bottom: 0; }
        ul, ol { padding-left: 20px; margin-bottom: 8px; }
        li { margin-bottom: 4px; }
        h1,h2,h3 { color: #f1f5f9; margin: 12px 0 6px; font-weight: 700; }
        strong { color: #e2e8f0; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.logo}>B</div>
        <div>
          <div style={styles.headerTitle}>BoardAI</div>
          <div style={styles.headerSubtitle}>Enterprise Strategy Advisor</div>
        </div>
        <div style={styles.badge}>v4.2 · Claude</div>
      </header>

      <main style={styles.main}>
        {showWelcome ? (
          <div style={styles.welcome}>
            <div style={styles.welcomeIcon}>🏛️</div>
            <div style={styles.welcomeTitle}>BoardAI Enterprise</div>
            <div style={styles.welcomeSubtitle}>
              您的专属董事会级战略顾问<br />提供深度商业洞察、治理建议与决策支持
            </div>
            <div style={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  style={styles.suggestionBtn}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.messages}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{ ...styles.messageRow, ...(m.role === 'user' ? styles.messageRowUser : {}) }}
              >
                <div style={{ ...styles.avatar, ...(m.role === 'assistant' ? styles.avatarAI : styles.avatarUser) }}>
                  {m.role === 'assistant' ? 'B' : 'You'}
                </div>
                <div style={{ ...styles.bubble, ...(m.role === 'assistant' ? styles.bubbleAI : styles.bubbleUser) }}>
                  {m.role === 'assistant' ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.messageRow}>
                <div style={{ ...styles.avatar, ...styles.avatarAI }}>B</div>
                <div style={{ ...styles.bubble, ...styles.bubbleAI }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div style={styles.inputArea}>
          <div style={styles.inputRow}>
            <textarea
              ref={textareaRef}
              rows={1}
              style={styles.textarea}
              placeholder="向 BoardAI 提问战略问题…"
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="send-btn"
              style={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
