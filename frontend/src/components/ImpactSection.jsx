import React from "react";

export default function ImpactSection() {
  return (
    <section
      id="oque-e"
      style={{
        background: "#fff",
        color: "#111",
        padding: "64px 0 56px 0",
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 32px #000a",
        position: "relative",
        zIndex: 2,
        scrollMarginTop: "100px", // Adiciona margem para o scroll não cobrir com o header
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
        <h2 style={{
          fontSize: "2.8em",
          fontWeight: 900,
          marginBottom: 24,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#111",
          textShadow: "none"
        }}>
          A Connect Conf 2025
        </h2>
        <p style={{ fontSize: "1.5em", marginBottom: 32, lineHeight: 1.5 }}>
          é mais do que uma conferência – é um chamado para aqueles que se acham {" "}
          <span className="impact impact-black">fora do padrão</span>, esquecidos ou desacreditados.<br />
          Onde <span className="impact impact-black">filhos improváveis</span>, de todos os cantos,
          se reúnem para viver o <span className="impact impact-black">extraordinário de Deus</span>.
        </p>
        <p style={{ fontWeight: 700, fontSize: "1.3em", marginBottom: 24, color: "#111", textShadow: "none" }}>
          E se Deus quisesse usar <span className="impact impact-black">justamente você?</span>
        </p>
        <p style={{ fontSize: "1.15em", marginBottom: 24, lineHeight: 1.6 }}>
          <span className="impact impact-black">Sim</span>, mesmo sem credenciais, mesmo sendo rejeitado, desacreditado, esquecido.<br />
          <span className="impact impact-black">Sim</span> para os que erraram, os que desistiram, os que já nem se veem mais como opção.<br />
          <span className="impact impact-black">Sim</span> para os que ouviram: <span className="impact impact-black">"Você não é capaz"</span>, mas continuam com o coração disponível.<br />
          <span className="impact impact-black">Sim</span>, porque Deus sempre usou os <span className="impact impact-black">improváveis</span>. Deus ainda usa os <span className="impact impact-black">improváveis</span>.
        </p>
        <p style={{ fontWeight: 700, fontSize: "1.2em", margin: "32px 0 24px 0", color: "#111", textShadow: "none" }}>
          E talvez… esse <span className="impact impact-black">improvável</span> seja você.
        </p>
        <p style={{ fontSize: "1.15em", marginBottom: 24, lineHeight: 1.6 }}>
          Vai ter <span className="impact impact-black">palavra profética</span>, preletores que carregam o Céu,
          momentos marcantes de adoração e experiências que vão quebrar seus padrões.<br />
          Você vai viver o que não conseguiria explicar.
        </p>
        <p style={{ marginTop: 32, fontWeight: 900, fontSize: "1.5em", color: "#111", textShadow: "none", letterSpacing: 1 }}>
          É um convite para você, <span className="impact impact-black">o improvável</span>.
        </p>
      </div>
    </section>
  );
} 