import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const SCENES = [
    { id: 0, duration: 5000, label: "5 apps problem" },
    { id: 1, duration: 3000, label: "I got tired" },
    { id: 2, duration: 4000, label: "Built Mithra" },
    { id: 3, duration: 5000, label: "One app everything" },
    { id: 4, duration: 8000, label: "Dost AI memory" },
    { id: 5, duration: 5000, label: "Journal to Dost" },
    { id: 6, duration: 5000, label: "Built solo" },
    { id: 7, duration: 5000, label: "Free to use" },
    { id: 8, duration: 5000, label: "CTA" },
];

const APP_ICONS = [
    { name: "Notion", icon: "N", color: "#ffffff", bg: "#000000" },
    { name: "Calendar", icon: "📅", color: "#4285f4", bg: "#1a1a2e" },
    { name: "Habits", icon: "🔥", color: "#ff6b35", bg: "#1a1a2e" },
    { name: "Journal", icon: "📓", color: "#a78bfa", bg: "#1a1a2e" },
    { name: "Timer", icon: "⏱️", color: "#34d399", bg: "#1a1a2e" },
];

const FEATURES = [
    { icon: "✅", label: "Tasks", sub: "Priorities & subtasks" },
    { icon: "🔥", label: "Habits", sub: "365-day heatmap" },
    { icon: "📓", label: "Journal", sub: "Mood tracking" },
    { icon: "📅", label: "Calendar", sub: "Google sync" },
    { icon: "⏱️", label: "Focus", sub: "Pomodoro timer" },
];

function Particles({ count = 40 }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.5 + 0.1,
    }));

    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {particles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: "absolute",
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: "50%",
                        background: `rgba(6, 182, 212, ${p.opacity})`,
                        animation: `float ${p.duration}s ${p.delay}s infinite ease-in-out alternate`,
                    }}
                />
            ))}
        </div>
    );
}

function GridLines() {
    return (
        <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `
        linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)
      `,
            backgroundSize: "60px 60px",
        }} />
    );
}

function GlowOrb({ x, y, size, color, opacity = 0.15 }) {
    return (
        <div style={{
            position: "absolute",
            left: `${x}%`, top: `${y}%`,
            width: size, height: size,
            borderRadius: "50%",
            background: color,
            filter: "blur(80px)",
            opacity,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
        }} />
    );
}

// SCENE 0 — 5 apps problem
function Scene0({ elapsed }) {
    const progress = elapsed / 5000;
    const showX = elapsed > 2500;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 32 }}>
            <GlowOrb x={50} y={30} size={400} color="#ef4444" opacity={0.08} />
            <div style={{
                fontSize: 28, fontWeight: 800, color: "#ffffff",
                letterSpacing: "-0.5px", textAlign: "center",
                animation: "fadeInUp 0.6s ease both",
                fontFamily: "'Space Grotesk', sans-serif",
            }}>
                You use <span style={{ color: "#ef4444" }}>5 different apps</span><br />just to manage your day
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                {APP_ICONS.map((app, i) => (
                    <div key={app.name} style={{
                        position: "relative",
                        animation: `popIn 0.4s ${i * 0.15}s ease both`,
                    }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: 20,
                            background: app.bg,
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 4, backdropFilter: "blur(10px)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            transition: "opacity 0.3s",
                            opacity: showX ? 0.3 : 1,
                        }}>
                            <span style={{ fontSize: 28 }}>{app.icon}</span>
                        </div>
                        {showX && (
                            <div style={{
                                position: "absolute", inset: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 36, color: "#ef4444", fontWeight: 900,
                                animation: "popIn 0.3s ease both",
                                textShadow: "0 0 20px rgba(239,68,68,0.8)",
                            }}>✕</div>
                        )}
                        <div style={{
                            textAlign: "center", fontSize: 10,
                            color: "rgba(255,255,255,0.4)", marginTop: 4,
                            fontFamily: "monospace",
                        }}>{app.name}</div>
                    </div>
                ))}
            </div>
            {showX && (
                <div style={{
                    fontSize: 16, color: "rgba(255,255,255,0.5)",
                    animation: "fadeInUp 0.4s ease both",
                    fontFamily: "'Space Grotesk', sans-serif",
                }}>There's a better way ↓</div>
            )}
        </div>
    );
}

// SCENE 1 — Dark moment
function Scene1({ elapsed }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
            <GlowOrb x={50} y={50} size={300} color="#06b6d4" opacity={0.12} />
            <div style={{
                fontSize: 48, animation: "pulse 1.5s infinite ease-in-out",
            }}>😮‍💨</div>
            <div style={{
                fontSize: 32, fontWeight: 800, color: "#ffffff",
                textAlign: "center", lineHeight: 1.3,
                fontFamily: "'Space Grotesk', sans-serif",
                animation: "fadeInUp 0.6s ease both",
            }}>
                I got <span style={{
                    background: "linear-gradient(135deg, #06b6d4, #a78bfa)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>tired</span> of that.
            </div>
            <div style={{
                fontSize: 18, color: "rgba(255,255,255,0.4)",
                animation: "fadeInUp 0.6s 0.3s ease both",
                fontFamily: "'Space Grotesk', sans-serif",
            }}>So I built something better.</div>
        </div>
    );
}

// SCENE 2 — Built Mithra reveal
function Scene2({ elapsed }) {
    const showSub = elapsed > 1500;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
            <GlowOrb x={50} y={40} size={500} color="#06b6d4" opacity={0.18} />
            <GlowOrb x={20} y={70} size={300} color="#a78bfa" opacity={0.1} />
            <div style={{
                width: 100, height: 100, borderRadius: 28,
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 48, boxShadow: "0 0 60px rgba(6,182,212,0.5)",
                animation: "popIn 0.6s ease both",
            }}>⚡</div>
            <div style={{
                fontSize: 52, fontWeight: 900, letterSpacing: "-2px",
                background: "linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "fadeInUp 0.5s 0.2s ease both",
                fontFamily: "'Space Grotesk', sans-serif",
            }}>MITHRA AI</div>
            {showSub && (
                <div style={{
                    fontSize: 18, color: "rgba(255,255,255,0.6)",
                    letterSpacing: "4px", textTransform: "uppercase",
                    animation: "fadeInUp 0.4s ease both",
                    fontFamily: "monospace",
                }}>Life Operating System</div>
            )}
            <div style={{
                marginTop: 16,
                display: "flex", gap: 12,
                animation: "fadeInUp 0.5s 0.8s ease both",
            }}>
                {["React", "FastAPI", "Gemini AI", "Supabase"].map(t => (
                    <span key={t} style={{
                        padding: "4px 12px", borderRadius: 20,
                        border: "1px solid rgba(6,182,212,0.3)",
                        color: "#06b6d4", fontSize: 11,
                        background: "rgba(6,182,212,0.05)",
                        fontFamily: "monospace",
                    }}>{t}</span>
                ))}
            </div>
        </div>
    );
}

// SCENE 3 — Feature cards
function Scene3({ elapsed }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: "0 24px" }}>
            <GlowOrb x={50} y={20} size={400} color="#06b6d4" opacity={0.1} />
            <div style={{
                fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                marginBottom: 8, letterSpacing: "2px", textTransform: "uppercase",
                fontFamily: "monospace",
            }}>One app for everything</div>
            {FEATURES.map((f, i) => (
                <div key={f.label} style={{
                    width: "100%", maxWidth: 340,
                    background: "rgba(6,182,212,0.05)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    borderRadius: 16, padding: "14px 20px",
                    display: "flex", alignItems: "center", gap: 16,
                    animation: `slideInRight 0.4s ${i * 0.12}s ease both`,
                    backdropFilter: "blur(10px)",
                }}>
                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                    <div>
                        <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 16, fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "monospace" }}>{f.sub}</div>
                    </div>
                    <div style={{ marginLeft: "auto", color: "#06b6d4", fontSize: 18 }}>→</div>
                </div>
            ))}
        </div>
    );
}

// SCENE 4 — Dost AI chat
function Scene4({ elapsed }) {
    const showUser = elapsed > 400;
    const showTyping = elapsed > 1800;
    const showAI = elapsed > 3000;
    const aiText = "Based on your journals, you've been stressed about deadlines but more focused after your morning habits. Your mood peaked on Wednesday — you wrote about finishing a big feature. 🧠";
    const visibleChars = showAI ? Math.min(aiText.length, Math.floor((elapsed - 3000) / 18)) : 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "24px 20px", gap: 16 }}>
            <GlowOrb x={80} y={20} size={300} color="#a78bfa" opacity={0.12} />
            <GlowOrb x={20} y={80} size={300} color="#06b6d4" opacity={0.1} />

            <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 16px", borderRadius: 20,
                    background: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.3)",
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4", animation: "pulse 1s infinite" }} />
                    <span style={{ color: "#06b6d4", fontSize: 13, fontFamily: "monospace" }}>Dost AI — with memory</span>
                </div>
            </div>

            {showUser && (
                <div style={{ display: "flex", justifyContent: "flex-end", animation: "slideInRight 0.3s ease both" }}>
                    <div style={{
                        maxWidth: "75%", padding: "12px 16px", borderRadius: "18px 18px 4px 18px",
                        background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                        color: "#fff", fontSize: 14, fontFamily: "'Space Grotesk', sans-serif",
                        boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
                    }}>
                        How have I been feeling this week?
                    </div>
                </div>
            )}

            {showTyping && !showAI && (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeInUp 0.3s ease both" }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0,
                    }}>🤖</div>
                    <div style={{
                        padding: "12px 16px", borderRadius: "4px 18px 18px 18px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex", gap: 6, alignItems: "center",
                    }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: "#a78bfa",
                                animation: `bounce 0.8s ${i * 0.15}s infinite ease-in-out`,
                            }} />
                        ))}
                    </div>
                </div>
            )}

            {showAI && (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", animation: "fadeInUp 0.3s ease both" }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0,
                        boxShadow: "0 0 20px rgba(167,139,250,0.3)",
                    }}>🤖</div>
                    <div style={{
                        maxWidth: "80%", padding: "14px 16px", borderRadius: "4px 18px 18px 18px",
                        background: "rgba(167,139,250,0.08)",
                        border: "1px solid rgba(167,139,250,0.2)",
                        color: "rgba(255,255,255,0.9)", fontSize: 13,
                        lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                        {aiText.slice(0, visibleChars)}
                        {visibleChars < aiText.length && <span style={{ animation: "blink 0.5s infinite" }}>|</span>}
                    </div>
                </div>
            )}

            <div style={{
                marginTop: 8, textAlign: "center",
                fontSize: 11, color: "rgba(6,182,212,0.6)",
                fontFamily: "monospace", letterSpacing: "1px",
            }}>
                ✦ reads your past journals · vector search · RAG memory
            </div>
        </div>
    );
}

// SCENE 5 — Journal to Dost
function Scene5({ elapsed }) {
    const showArrow = elapsed > 2000;
    const showDost = elapsed > 3200;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, padding: "0 24px" }}>
            <GlowOrb x={50} y={50} size={400} color="#a78bfa" opacity={0.1} />
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", letterSpacing: "2px" }}>HOW IT WORKS</div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", maxWidth: 340 }}>
                <div style={{
                    width: "100%", padding: 16, borderRadius: 16,
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.25)",
                    animation: "fadeInUp 0.4s ease both",
                }}>
                    <div style={{ color: "#a78bfa", fontSize: 12, fontFamily: "monospace", marginBottom: 8 }}>📓 Your Journal · Wednesday</div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>
                        "Finally finished the sync engine feature. Feeling really proud and energized today..."
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: 10, fontFamily: "monospace" }}>mood: 8/10</span>
                        <span style={{ fontSize: 11, color: "#06b6d4", background: "rgba(6,182,212,0.1)", padding: "2px 8px", borderRadius: 10, fontFamily: "monospace" }}>proud</span>
                    </div>
                </div>

                {showArrow && (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        animation: "fadeInUp 0.4s ease both",
                    }}>
                        <div style={{ width: 2, height: 20, background: "linear-gradient(#a78bfa, #06b6d4)" }} />
                        <div style={{ color: "#06b6d4", fontSize: 20 }}>↓</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>vector embedding · semantic search</div>
                    </div>
                )}

                {showDost && (
                    <div style={{
                        width: "100%", padding: 16, borderRadius: 16,
                        background: "rgba(6,182,212,0.08)",
                        border: "1px solid rgba(6,182,212,0.25)",
                        animation: "fadeInUp 0.4s ease both",
                    }}>
                        <div style={{ color: "#06b6d4", fontSize: 12, fontFamily: "monospace", marginBottom: 8 }}>🤖 Dost AI remembers</div>
                        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>
                            "Your mood peaked Wednesday after finishing a big feature. That pattern shows deep work = high energy for you."
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// SCENE 6 — Built solo
function Scene6({ elapsed }) {
    const facts = [
        { text: "Built solo", icon: "👤", delay: 0 },
        { text: "College student", icon: "🎓", delay: 300 },
        { text: "Zero budget", icon: "₹0", delay: 600 },
        { text: "Zero team", icon: "🏗️", delay: 900 },
        { text: "100% from scratch", icon: "⚡", delay: 1200 },
    ];
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, position: "relative" }}>
            {/* Background Image - Profile */}
            <img src="/promo/profile.jpg" style={{
                position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 1, zIndex: -1
            }} alt="Profile" />
            <div style={{
                position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,8,16,0.95), rgba(6,8,16,0.4))", zIndex: -1
            }} />

            <GlowOrb x={50} y={50} size={500} color="#f59e0b" opacity={0.08} />
            <div style={{
                fontSize: 44, fontWeight: 900,
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "fadeInUp 0.5s ease both",
                fontFamily: "'Space Grotesk', sans-serif",
                textAlign: "center", lineHeight: 1.2,
            }}>The Real Story</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320, padding: "0 20px" }}>
                {facts.map((f) => (
                    <div key={f.text} style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "12px 20px", borderRadius: 14,
                        background: "rgba(245,158,11,0.06)",
                        border: "1px solid rgba(245,158,11,0.15)",
                        animation: `slideInRight 0.4s ${f.delay}ms ease both`,
                    }}>
                        <span style={{ fontSize: 24 }}>{f.icon}</span>
                        <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif" }}>{f.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// SCENE 7 — Free
function Scene7({ elapsed }) {
    const showFree = elapsed > 1500;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
            <GlowOrb x={50} y={50} size={400} color="#34d399" opacity={0.12} />
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", letterSpacing: "3px" }}>PRICING</div>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontSize: 64, fontWeight: 900, color: "rgba(255,255,255,0.2)",
                    textDecoration: "line-through",
                    fontFamily: "'Space Grotesk', sans-serif",
                    animation: "fadeInUp 0.4s ease both",
                }}>₹999/mo</div>
                {showFree && (
                    <div style={{
                        fontSize: 80, fontWeight: 900,
                        background: "linear-gradient(135deg, #34d399, #06b6d4)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        animation: "popIn 0.5s ease both",
                        fontFamily: "'Space Grotesk', sans-serif",
                        textShadow: "0 0 60px rgba(52,211,153,0.3)",
                    }}>FREE</div>
                )}
            </div>
            {showFree && (
                <div style={{
                    display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
                    animation: "fadeInUp 0.4s 0.3s ease both",
                }}>
                    {["No credit card", "No signup required", "All features included"].map(t => (
                        <div key={t} style={{
                            display: "flex", gap: 8, alignItems: "center",
                            color: "rgba(255,255,255,0.6)", fontSize: 14,
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}>
                            <span style={{ color: "#34d399" }}>✓</span> {t}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// SCENE 8 — CTA
function Scene8({ elapsed }) {
    const url = "mithra-lifeos.com";
    const visibleUrl = url.slice(0, Math.min(url.length, Math.floor(elapsed / 60)));
    const showGithub = elapsed > 2000;
    const showBio = elapsed > 3500;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
            <GlowOrb x={50} y={50} size={600} color="#06b6d4" opacity={0.15} />
            <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, animation: "pulse 1.5s infinite ease-in-out",
                boxShadow: "0 0 40px rgba(6,182,212,0.5)",
            }}>⚡</div>

            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontSize: 38, fontWeight: 900,
                    background: "linear-gradient(135deg, #ffffff, #06b6d4)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    fontFamily: "'Space Grotesk', sans-serif",
                    animation: "fadeInUp 0.5s ease both",
                }}>Try Mithra Free</div>
                <div style={{
                    marginTop: 12, padding: "10px 24px",
                    background: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.4)",
                    borderRadius: 12, fontFamily: "monospace",
                    color: "#06b6d4", fontSize: 16, letterSpacing: "0.5px",
                }}>
                    {visibleUrl}
                    {visibleUrl.length < url.length && <span style={{ animation: "blink 0.5s infinite" }}>|</span>}
                </div>
            </div>

            {showGithub && (
                <div style={{
                    display: "flex", gap: 12,
                    animation: "fadeInUp 0.4s ease both",
                }}>
                    <div style={{
                        padding: "10px 20px", borderRadius: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#ffffff", fontSize: 14,
                        fontFamily: "'Space Grotesk', sans-serif",
                        display: "flex", alignItems: "center", gap: 8,
                    }}>⭐ Star on GitHub</div>
                </div>
            )}

            {showBio && (
                <div style={{
                    fontSize: 22, fontWeight: 700,
                    color: "#06b6d4",
                    animation: "pulse 1s infinite ease-in-out",
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "1px",
                }}>👆 LINK IN BIO</div>
            )}

            <div style={{
                position: "absolute", bottom: 40,
                fontSize: 12, color: "rgba(255,255,255,0.2)",
                fontFamily: "monospace", letterSpacing: "2px",
            }}>BUILT WITH ❤️ IN INDIA 🇮🇳</div>
        </div>
    );
}

const SCENE_COMPONENTS = [Scene0, Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];

export default function PromoVideo() {
    const [currentScene, setCurrentScene] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [totalElapsed, setTotalElapsed] = useState(0);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const audioRef = useRef(null);
    const videoRef = useRef(null);

    const totalDuration = SCENES.reduce((acc, s) => acc + s.duration, 0);

    useEffect(() => {
        if (playing) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.log("Audio play failed:", e));
            }
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(e => console.log("Video play failed:", e));
            }
        } else {
            if (audioRef.current) audioRef.current.pause();
            if (videoRef.current) videoRef.current.pause();
        }
    }, [playing]);

    useEffect(() => {
        if (!playing) return;
        let sceneIndex = 0;
        let sceneStart = Date.now();
        startRef.current = Date.now();

        const tick = () => {
            const now = Date.now();
            const sceneElapsed = now - sceneStart;
            const total = now - startRef.current;
            setElapsed(sceneElapsed);
            setTotalElapsed(total);

            if (sceneElapsed >= SCENES[sceneIndex].duration) {
                if (sceneIndex < SCENES.length - 1) {
                    sceneIndex++;
                    sceneStart = Date.now();
                    setCurrentScene(sceneIndex);
                } else {
                    setPlaying(false);
                    setCurrentScene(0);
                    setElapsed(0);
                    setTotalElapsed(0);
                    return;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [playing]);

    const SceneComponent = SCENE_COMPONENTS[currentScene];
    const progressPct = (totalElapsed / totalDuration) * 100;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
      `}</style>

            {/* Assets */}
            <audio ref={audioRef} src="/promo/voiceover.mp3" preload="auto" />

            <div style={{
                width: "100vw", height: "100vh",
                background: "#060810",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                fontFamily: "'Space Grotesk', sans-serif",
                overflow: "hidden",
                position: "relative",
            }}>
                {/* Navigation Back */}
                <Link to="/" style={{
                    position: "absolute", top: 20, left: 20, zIndex: 100,
                    color: "rgba(255,255,255,0.5)", textDecoration: "none",
                    background: "rgba(255,255,255,0.05)", padding: "10px 20px", borderRadius: 8,
                    fontFamily: "monospace"
                }}>
                    ← Back to App
                </Link>

                {/* Video frame */}
                <div style={{
                    width: 390, height: 700,
                    background: "#0a0b12",
                    borderRadius: playing ? 0 : 32,
                    position: "relative", overflow: "hidden",
                    border: playing ? "none" : "1px solid rgba(6,182,212,0.2)",
                    boxShadow: "0 0 80px rgba(6,182,212,0.15)",
                    transition: "border-radius 0.3s",
                }}>
                    {/* Background Video Layer */}
                    <video
                        ref={videoRef}
                        src="/promo/demo.mov"
                        muted
                        loop
                        playsInline
                        style={{
                            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                            opacity: 0.15, zIndex: 0
                        }}
                    />

                    <GridLines />
                    <Particles count={30} />

                    {/* Scanline effect */}
                    <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
                        zIndex: 10,
                    }} />

                    {/* Scene */}
                    <div style={{ position: "relative", zIndex: 5, height: "100%" }}>
                        {playing ? (
                            <SceneComponent elapsed={elapsed} />
                        ) : (
                            <div style={{
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                height: "100%", gap: 20,
                            }}>
                                <GlowOrb x={50} y={40} size={400} color="#06b6d4" opacity={0.15} />
                                <div style={{
                                    width: 90, height: 90, borderRadius: 24,
                                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 40, boxShadow: "0 0 40px rgba(6,182,212,0.4)",
                                }}>⚡</div>
                                <div style={{
                                    fontSize: 28, fontWeight: 900, color: "#fff",
                                    letterSpacing: "-1px", textAlign: "center",
                                }}>Mithra AI</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                                    45-second video background
                                </div>
                                <div style={{
                                    display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
                                    marginTop: 8,
                                }}>
                                    {SCENES.map((s, i) => (
                                        <div key={i} style={{
                                            fontSize: 11, color: "rgba(255,255,255,0.3)",
                                            fontFamily: "monospace", display: "flex", gap: 8, alignItems: "center",
                                        }}>
                                            <span style={{ color: "#06b6d4" }}>Scene {i + 1}</span>
                                            <span>{s.label}</span>
                                            <span style={{ color: "rgba(255,255,255,0.2)" }}>{s.duration / 1000}s</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress bar */}
                    {playing && (
                        <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            height: 3, background: "rgba(255,255,255,0.1)", zIndex: 20,
                        }}>
                            <div style={{
                                height: "100%", width: `${progressPct}%`,
                                background: "linear-gradient(90deg, #06b6d4, #a78bfa)",
                                transition: "width 0.1s linear",
                            }} />
                        </div>
                    )}

                    {/* Scene indicator */}
                    {playing && (
                        <div style={{
                            position: "absolute", top: 16, right: 16, zIndex: 20,
                            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
                            padding: "4px 10px", borderRadius: 20,
                            fontSize: 10, color: "rgba(255,255,255,0.5)",
                            fontFamily: "monospace",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}>
                            {currentScene + 1}/{SCENES.length} · {SCENES[currentScene].label}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <button
                        onClick={() => {
                            setCurrentScene(0);
                            setElapsed(0);
                            setTotalElapsed(0);
                            setPlaying(true);
                        }}
                        style={{
                            padding: "12px 32px", borderRadius: 12,
                            background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                            border: "none", color: "#fff",
                            fontWeight: 700, fontSize: 15, cursor: "pointer",
                            fontFamily: "'Space Grotesk', sans-serif",
                            boxShadow: "0 4px 20px rgba(6,182,212,0.4)",
                        }}
                    >
                        ▶ Play All 45 Seconds
                    </button>
                    {playing && (
                        <button
                            onClick={() => setPlaying(false)}
                            style={{
                                padding: "12px 24px", borderRadius: 12,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#fff", fontSize: 15, cursor: "pointer",
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            ⏸ Pause
                        </button>
                    )}
                </div>

                <div style={{
                    marginTop: 16, fontSize: 12,
                    color: "rgba(255,255,255,0.2)", fontFamily: "monospace",
                    textAlign: "center",
                }}>
                    Press Play → Screen Record → Use in CapCut with your voice
                </div>
            </div>
        </>
    );
}
