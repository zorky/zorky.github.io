import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const PRODUITS_DEFAUT = [
  { id: "livretA1",      label: "Livret A (1)",                        color: "#3B82F6", type: "livret",   capital: 22950, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "livretA2",      label: "Livret A (2)",                        color: "#93C5FD", type: "livret",   capital: 22950, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "ldd1",          label: "LDD (1)",                             color: "#F59E0B", type: "livret",   capital: 12000, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "ldd2",          label: "LDD (2)",                             color: "#FCD34D", type: "livret",   capital: 12000, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "cel",           label: "CEL",                                 color: "#F472B6", type: "cel",      capital: 11578, versement: 0,  taux: 1.5, prelevement: 17.2, actif: true },
  { id: "assuranceVie1", label: "Assurance vie (1) — Mutavie/Macif",  color: "#10B981", type: "av_euro",  capital: 62753, versement: 30, taux: 2.5, prelevement: 17.2, actif: true },
  { id: "assuranceVie2", label: "Assurance vie (2) — BNP Multiplacements 2", color: "#6EE7B7", type: "av_mixte", capital: 6900, versement: 29, prelevement: 17.2, actif: true, taux: 2.5, euroRatio: 59.89, tauxUC: 5.0, ucRatio: 40.11 },
  { id: "perp",          label: "PERP",                                color: "#C084FC", type: "perp",     capital: 11301, versement: 29.55,  taux: 2.0, prelevement: 17.2, actif: true },
];

const TRANCHES_IR = [
  { label: "0 % (non imposable)", value: 0 },
  { label: "11 %",                value: 11 },
  { label: "30 %",                value: 30 },
  { label: "41 %",                value: 41 },
  { label: "45 %",                value: 45 },
];

function fmt(n) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
function fmtPct(n) { return n.toFixed(2) + " %"; }

function calculer(capital, versement, tauxAnnuel, prelevementPct, nAns) {
  const tauxNet = tauxAnnuel * (1 - prelevementPct / 100);
  const nMois = nAns * 12;
  const tm = (1 + tauxNet / 100) ** (1 / 12) - 1;
  const values = [];
  let w = capital;
  for (let k = 0; k <= nMois; k++) {
    if (k % 12 === 0) values.push(w);
    w = (1 + tm) * w + versement;
  }
  return values;
}

function calculerUC(capital, versement, tauxAnnuel, nAns) {
  const nMois = nAns * 12;
  const tm = (1 + tauxAnnuel / 100) ** (1 / 12) - 1;
  const values = [];
  let w = capital;
  for (let k = 0; k <= nMois; k++) {
    if (k % 12 === 0) values.push(w);
    w = (1 + tm) * w + versement;
  }
  return values;
}

function calculerMixte(p, nAns) {
  const vE = calculer(p.capital * (p.euroRatio / 100), p.versement * (p.euroRatio / 100), p.taux, p.prelevement, nAns);
  const vU = calculerUC(p.capital * (p.ucRatio / 100), p.versement * (p.ucRatio / 100), p.tauxUC, nAns);
  return vE.map((v, i) => v + vU[i]);
}

function calculerProduit(p, nAns) {
  if (p.type === "av_mixte") return calculerMixte(p, nAns);
  return calculer(p.capital, p.versement, p.taux, p.prelevement, nAns);
}

function enEurosConstants(v, an, inf) { return v / (1 + inf / 100) ** an; }

// ─── Calcul fiscal au rachat ────────────────────────────────────────────────
function simulerRachat(p, montantRachat, capitalFinal, totalVerse, anciennete, trancheIR) {
  const gainsTotal = Math.max(0, capitalFinal - totalVerse);
  // Quote-part de gains dans le rachat
  const gainsRachat = montantRachat * (gainsTotal / capitalFinal);

  if (p.type === "livret") {
    // Livrets A / LDD : exonérés totalement
    return { gainsRachat: 0, ps: 0, ir: 0, net: montantRachat, detail: "Exonéré (Livret A / LDD)" };
  }

  if (p.type === "cel") {
    // CEL : PS déjà pris annuellement, IR 12.8% (PFU) sur gains
    const ir = gainsRachat * 0.128;
    return { gainsRachat, ps: 0, ir, net: montantRachat - ir, detail: "PS pris annuellement · IR PFU 12,8% sur gains" };
  }

  if (p.type === "av_euro" || p.type === "av_mixte") {
    // PS déjà pris annuellement sur la partie euros
    // Pour av_mixte : PS sur la partie UC uniquement (différés)
    let psRachat = 0;
    if (p.type === "av_mixte") {
      const gainsUC = gainsRachat * (p.ucRatio / 100);
      psRachat = gainsUC * 0.172;
    }
    // IR selon ancienneté
    let tauxIR, abattement = 0;
    if (anciennete >= 8) {
      tauxIR = 0.075;
      abattement = 4600; // abattement annuel (célibataire)
    } else {
      tauxIR = 0.128;
    }
    const gainsApresAbatt = Math.max(0, gainsRachat - abattement);
    const ir = gainsApresAbatt * tauxIR;
    const net = montantRachat - psRachat - ir;
    const detail = anciennete >= 8
      ? `Contrat ≥ 8 ans · Abattement 4 600 € · IR ${(tauxIR * 100).toFixed(1)}% · ${p.type === "av_mixte" ? "PS UC différés 17,2%" : "PS déjà pris"}`
      : `Contrat < 8 ans · PFU IR 12,8% · ${p.type === "av_mixte" ? "PS UC différés 17,2%" : "PS déjà pris"}`;
    return { gainsRachat, ps: psRachat, ir, net, detail };
  }

  if (p.type === "perp") {
    // Sortie en capital : IR selon tranche + CSG/CRDS 8.3% (non déductible)
    const csg = gainsRachat * 0.083;
    const ir  = gainsRachat * (trancheIR / 100);
    const net = montantRachat - csg - ir;
    return { gainsRachat, ps: csg, ir, net, detail: `PERP · IR tranche ${trancheIR}% + CSG/CRDS 8,3% sur gains` };
  }

  return { gainsRachat: 0, ps: 0, ir: 0, net: montantRachat, detail: "" };
}

// ─── Export CSV ─────────────────────────────────────────────────────────────
function exportCSV(actifs, nAns, inflation) {
  const header = ["Produit", "Type", "Total versé (€)", "Capital final (€)", "Euros constants (€)", "Intérêts nets (€)", "Taux net (%)", "Rendement (%)"];
  const rows = actifs.map((p) => {
    const totalVerse = p.capital + p.versement * nAns * 12;
    const final      = calculerProduit(p, nAns).at(-1);
    const finalConst = enEurosConstants(final, nAns, inflation);
    const interets   = final - totalVerse;
    const tauxNet    = p.type === "av_mixte"
      ? `${(p.taux * 0.828).toFixed(3)} euros / ${p.tauxUC} UC`
      : (p.taux * (1 - p.prelevement / 100)).toFixed(3);
    return [
      `"${p.label.split(" — ")[0]}"`,
      p.type,
      totalVerse.toFixed(2),
      final.toFixed(2),
      finalConst.toFixed(2),
      interets.toFixed(2),
      tauxNet,
      (interets / totalVerse * 100).toFixed(1),
    ];
  });
  // Ligne total
  const totaux = actifs.reduce((acc, p) => {
    const tv = p.capital + p.versement * nAns * 12;
    const f  = calculerProduit(p, nAns).at(-1);
    return { verse: acc.verse + tv, final: acc.final + f, finalConst: acc.finalConst + enEurosConstants(f, nAns, inflation) };
  }, { verse: 0, final: 0, finalConst: 0 });
  const ti = totaux.final - totaux.verse;
  rows.push([`"TOTAL (${actifs.length} produits)"`, "", totaux.verse.toFixed(2), totaux.final.toFixed(2), totaux.finalConst.toFixed(2), ti.toFixed(2), "", (ti / totaux.verse * 100).toFixed(1)]);

  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM pour Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `epargne_simulation_${nAns}ans.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Composants UI ──────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, unit = "" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", fontFamily: "monospace" }}>
          {unit === "€" ? value.toLocaleString("fr-FR") + " €" : value + unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#6366F1" }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, inflation }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", fontSize: 12, maxWidth: 300 }}>
      <div style={{ color: "#94A3B8", marginBottom: 6, fontFamily: "monospace" }}>Année {label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontFamily: "monospace", marginBottom: 2, opacity: p.name.endsWith("(€ const.)") ? 0.7 : 1 }}>
          {p.name} : {p.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
        </div>
      ))}
      {inflation > 0 && <div style={{ color: "#64748B", fontSize: 10, marginTop: 6, fontFamily: "monospace" }}>Pointillés = euros constants ({inflation}%/an)</div>}
    </div>
  );
};

const FISCAL_BADGE = {
  exo:   { label: "exonéré",          bg: "#14532d", color: "#34D399", border: "#166534" },
  ps:    { label: "PS 17,2%/an",      bg: "#431407", color: "#FB923C", border: "#7c2d12" },
  mixte: { label: "Euro+UC",          bg: "#1e1b4b", color: "#A5B4FC", border: "#3730a3" },
  perp:  { label: "PERP — bloqué",    bg: "#2d1b69", color: "#C084FC", border: "#6d28d9" },
};

function BtnAction({ onClick, children, color = "#6366F1" }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 18px", borderRadius: 20, fontSize: 12, fontFamily: "monospace",
      cursor: "pointer", border: `1px solid ${color}`,
      background: color + "22", color, transition: "background 0.15s",
    }}>{children}</button>
  );
}

// ─── Panneau Simulation de rachat ───────────────────────────────────────────
function PanneauRachat({ produits, nAns }) {
  const produitsRachatables = produits.filter((p) => p.actif);
  const [produitId, setProduitId] = useState(produitsRachatables[0]?.id || "");
  const [pctRachat, setPctRachat] = useState(100);
  const [anciennete, setAnciennete] = useState(8);
  const [trancheIR, setTrancheIR] = useState(30);

  const p = produitsRachatables.find((x) => x.id === produitId);
  if (!p) return null;

  const capitalFinal = calculerProduit(p, nAns).at(-1);
  const totalVerse   = p.capital + p.versement * nAns * 12;
  const montantRachat = capitalFinal * (pctRachat / 100);
  const result = simulerRachat(p, montantRachat, capitalFinal, totalVerse, anciennete, trancheIR);

  const isAV   = p.type === "av_euro" || p.type === "av_mixte";
  const isPERP = p.type === "perp";
  const isCEL  = p.type === "cel";

  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: "20px 24px" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#E2E8F0", fontFamily: "monospace" }}>
        💸 Simulation de rachat
      </h2>

      {/* Sélecteur produit */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace", marginBottom: 6 }}>Produit</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {produitsRachatables.map((x) => (
            <button key={x.id} onClick={() => setProduitId(x.id)} style={{
              padding: "4px 12px", borderRadius: 16, fontSize: 11, fontFamily: "monospace",
              cursor: "pointer", border: `1px solid ${produitId === x.id ? x.color : "#334155"}`,
              background: produitId === x.id ? x.color + "22" : "transparent",
              color: produitId === x.id ? x.color : "#64748B",
            }}>{x.label.split(" — ")[0]}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        <div>
          {/* Montant rachat */}
          <Slider label="Montant racheté" value={pctRachat} min={1} max={100} step={1}
            onChange={setPctRachat} unit=" %" />
          <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", marginTop: -8, marginBottom: 12 }}>
            = {fmt(montantRachat)} sur {fmt(capitalFinal)} de capital final
          </div>

          {/* Ancienneté (AV uniquement) */}
          {isAV && (
            <Slider label="Ancienneté du contrat" value={anciennete} min={0} max={30} step={1}
              onChange={setAnciennete} unit=" ans" />
          )}

          {/* Tranche IR (PERP + CEL) */}
          {(isPERP || isCEL) && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace", marginBottom: 6 }}>Tranche marginale IR</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TRANCHES_IR.map((t) => (
                  <button key={t.value} onClick={() => setTrancheIR(t.value)} style={{
                    padding: "3px 10px", borderRadius: 14, fontSize: 11, fontFamily: "monospace",
                    cursor: "pointer", border: `1px solid ${trancheIR === t.value ? "#818CF8" : "#334155"}`,
                    background: trancheIR === t.value ? "#818CF822" : "transparent",
                    color: trancheIR === t.value ? "#818CF8" : "#64748B",
                  }}>{t.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Résultat */}
        <div style={{ background: "#0F172A", borderRadius: 10, padding: "16px 18px", alignSelf: "start" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", marginBottom: 12 }}>{result.detail}</div>

          {[
            { label: "Montant brut racheté",  value: montantRachat,        color: "#E2E8F0" },
            { label: "Quote-part gains",       value: result.gainsRachat,   color: "#94A3B8" },
            { label: isPERP ? "CSG/CRDS 8,3%" : "Prélèvements sociaux UC", value: result.ps, color: "#FB923C", hide: result.ps === 0 },
            { label: "Impôt sur le revenu",    value: result.ir,            color: "#F87171", hide: result.ir === 0 },
            { label: "Net encaissé",           value: result.net,           color: "#34D399", large: true },
          ].filter((r) => !r.hide).map((r) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "6px 0",
              borderTop: r.large ? "1px solid #334155" : "none",
              marginTop: r.large ? 6 : 0,
            }}>
              <span style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>{r.label}</span>
              <span style={{ fontSize: r.large ? 15 : 13, fontWeight: r.large ? 700 : 400, color: r.color, fontFamily: "monospace" }}>
                {r.value < 0 ? "−" : r.label === "Net encaissé" ? "" : "−"}{fmt(Math.abs(r.value))}
              </span>
            </div>
          ))}

          {result.net > 0 && (
            <div style={{ marginTop: 10, fontSize: 11, color: "#64748B", fontFamily: "monospace", textAlign: "right" }}>
              Taux de prélèvement effectif : <span style={{ color: "#818CF8" }}>
                {(((montantRachat - result.net) / montantRachat) * 100).toFixed(1)} %
              </span>
            </div>
          )}

          {p.type === "perp" && (
            <div style={{ marginTop: 10, fontSize: 10, color: "#C084FC", fontFamily: "monospace", background: "#2d1b6922", borderRadius: 6, padding: "6px 8px" }}>
              ⚠ Sortie anticipée possible uniquement sur cas exceptionnels (invalidité, fin de droits chômage…)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App principale ──────────────────────────────────────────────────────────
export default function App() {
  const [produits, setProduits]         = useState(PRODUITS_DEFAUT);
  const [nAns, setNAns]                 = useState(10);
  const [inflation, setInflation]       = useState(2.0);
  const [graphType, setGraphType]       = useState("line");
  const [showConstant, setShowConstant] = useState(true);
  const [showRachat, setShowRachat]     = useState(false);

  const updateProduit = (id, champ, valeur) =>
    setProduits((prev) => prev.map((p) => (p.id === id ? { ...p, [champ]: valeur } : p)));

  const actifs = produits.filter((p) => p.actif);

  const data = useMemo(() => {
    const rows = [];
    for (let an = 0; an <= nAns; an++) rows.push({ an });
    actifs.forEach((p) => {
      const vals = calculerProduit(p, nAns);
      vals.forEach((v, i) => {
        rows[i][p.label] = Math.round(v);
        if (showConstant && inflation > 0)
          rows[i][p.label + " (€ const.)"] = Math.round(enEurosConstants(v, i, inflation));
      });
    });
    return rows;
  }, [produits, nAns, inflation, showConstant]);

  const barData = useMemo(() => actifs.map((p) => {
    const final = calculerProduit(p, nAns).at(-1);
    const tv    = p.capital + p.versement * nAns * 12;
    return { label: p.label.split(" — ")[0], "Capital versé": Math.round(tv), "Intérêts nets": Math.round(final - tv) };
  }), [produits, nAns]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Titre */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", background: "linear-gradient(90deg, #6366F1, #818CF8, #38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
          Simulateur d'épargne
        </h1>
        <p style={{ color: "#64748B", fontSize: 13, marginTop: 4, fontFamily: "monospace" }}>
          Intérêts composés · prélèvements sociaux · inflation · simulation de rachat
        </p>
      </div>

      {/* Paramètres globaux */}
      <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: "16px 24px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        <Slider label="Durée de simulation" value={nAns}      min={1}  max={30} step={1}   onChange={setNAns}      unit=" ans" />
        <Slider label="Inflation annuelle"  value={inflation} min={0}  max={10} step={0.1} onChange={setInflation} unit=" %" />
      </div>

      {/* Cartes produits */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 24 }}>
        {produits.map((p) => {
          const badge = (p.type === "livret" && p.prelevement === 0) ? FISCAL_BADGE.exo
                      : p.type === "av_mixte" ? FISCAL_BADGE.mixte
                      : p.type === "perp"     ? FISCAL_BADGE.perp
                      : FISCAL_BADGE.ps;
          return (
            <div key={p.id} style={{ background: "#1E293B", border: `1px solid ${p.actif ? p.color + "55" : "#334155"}`, borderRadius: 12, padding: "16px 18px", opacity: p.actif ? 1 : 0.45, transition: "opacity 0.2s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: p.color, lineHeight: 1.3 }}>{p.label}</span>
                </div>
                <button onClick={() => updateProduit(p.id, "actif", !p.actif)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, border: `1px solid ${p.actif ? p.color : "#475569"}`, background: p.actif ? p.color + "22" : "transparent", color: p.actif ? p.color : "#64748B", cursor: "pointer", fontFamily: "monospace", flexShrink: 0 }}>
                  {p.actif ? "actif" : "off"}
                </button>
              </div>
              <div style={{ display: "inline-block", fontSize: 10, padding: "2px 8px", borderRadius: 10, marginBottom: 12, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontFamily: "monospace" }}>
                {badge.label}
              </div>
              <Slider label="Capital initial"   value={p.capital}   min={0}   max={200000} step={50}  onChange={(v) => updateProduit(p.id, "capital", v)}   unit="€" />
              <Slider label="Versement mensuel" value={p.versement} min={0}   max={1000}   step={1}   onChange={(v) => updateProduit(p.id, "versement", v)} unit="€" />
              {p.type === "av_mixte" ? (
                <>
                  <div style={{ fontSize: 11, color: "#10B981", fontFamily: "monospace", marginBottom: 6, borderTop: "1px solid #334155", paddingTop: 8 }}>Fonds euros — {p.euroRatio.toFixed(2)} %</div>
                  <Slider label="Taux brut euros" value={p.taux}      min={0.1} max={10}  step={0.1}  onChange={(v) => updateProduit(p.id, "taux", v)}      unit=" %" />
                  <Slider label="Part euros (%)"  value={p.euroRatio} min={0}   max={100} step={0.01} onChange={(v) => updateProduit(p.id, "euroRatio", v)} unit=" %" />
                  <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", marginBottom: 10 }}>
                    PS 17,2%/an → net : <span style={{ color: "#818CF8" }}>{(p.taux * 0.828).toFixed(3)} %</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#A5B4FC", fontFamily: "monospace", marginBottom: 6, borderTop: "1px solid #334155", paddingTop: 8 }}>UC — {p.ucRatio.toFixed(2)} %</div>
                  <Slider label="Rendement UC attendu" value={p.tauxUC}  min={-10} max={20}  step={0.1}  onChange={(v) => updateProduit(p.id, "tauxUC", v)}  unit=" %" />
                  <Slider label="Part UC (%)"          value={p.ucRatio} min={0}   max={100} step={0.01} onChange={(v) => updateProduit(p.id, "ucRatio", v)} unit=" %" />
                  <div style={{ fontSize: 10, color: "#64748B", fontFamily: "monospace" }}>⚠ PS UC différés au rachat</div>
                </>
              ) : (
                <>
                  <Slider label="Taux brut annuel" value={p.taux} min={0.1} max={10} step={0.1} onChange={(v) => updateProduit(p.id, "taux", v)} unit=" %" />
                  {p.prelevement > 0 && (
                    <>
                      <Slider label="Prélèv. sociaux" value={p.prelevement} min={0} max={30} step={0.1} onChange={(v) => updateProduit(p.id, "prelevement", v)} unit=" %" />
                      <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", marginTop: -4 }}>
                        Taux net : <span style={{ color: "#818CF8" }}>{(p.taux * (1 - p.prelevement / 100)).toFixed(3)} %</span>
                      </div>
                    </>
                  )}
                  {p.type === "perp" && (
                    <div style={{ fontSize: 10, color: "#C084FC", fontFamily: "monospace", marginTop: 8, background: "#2d1b6922", borderRadius: 6, padding: "6px 8px", border: "1px solid #6d28d944" }}>
                      ⚠ Capital bloqué jusqu'à la retraite.<br />Sortie IR + CSG 8,3% sur rente ou capital.
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Contrôles graphe + exports */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        {[["line", "📈 Courbes"], ["bar", "📊 Barres"]].map(([t, lbl]) => (
          <BtnAction key={t} onClick={() => setGraphType(t)} color={graphType === t ? "#818CF8" : "#475569"}>{lbl}</BtnAction>
        ))}
        {graphType === "line" && (
          <BtnAction onClick={() => setShowConstant(!showConstant)} color={showConstant ? "#F59E0B" : "#475569"}>
            {showConstant ? "✓" : "○"} Euros constants
          </BtnAction>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <BtnAction onClick={() => setShowRachat((v) => !v)} color="#F472B6">
            {showRachat ? "✕ Fermer rachat" : "💸 Simuler un rachat"}
          </BtnAction>
          <BtnAction onClick={() => exportCSV(actifs, nAns, inflation)} color="#34D399">
            ⬇ Export CSV
          </BtnAction>
          <BtnAction onClick={() => window.print()} color="#38BDF8">
            🖨 Imprimer / PDF
          </BtnAction>
        </div>
      </div>

      {/* Panneau rachat */}
      {showRachat && (
        <div style={{ marginBottom: 20 }}>
          <PanneauRachat produits={actifs} nAns={nAns} />
        </div>
      )}

      {/* Graphe */}
      <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: "20px 10px 10px", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={320}>
          {graphType === "line" ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="an" tickFormatter={(v) => `${v}a`} tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }} />
              <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`} tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }} />
              <Tooltip content={<CustomTooltip inflation={showConstant ? inflation : 0} />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace", color: "#94A3B8" }} />
              {actifs.flatMap((p) => [
                <Line key={p.id} type="monotone" dataKey={p.label} stroke={p.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />,
                ...(showConstant && inflation > 0 ? [<Line key={p.id + "_c"} type="monotone" dataKey={p.label + " (€ const.)"} stroke={p.color} strokeWidth={1.5} strokeDasharray="4 3" dot={false} opacity={0.5} />] : [])
              ])}
            </LineChart>
          ) : (
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`} tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }} />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", fontFamily: "monospace", fontSize: 12 }} formatter={(v) => v.toLocaleString("fr-FR") + " €"} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace" }} />
              <Bar dataKey="Capital versé" stackId="a" fill="#334155" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Intérêts nets" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Tableau récap */}
      <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "monospace" }}>
          <thead>
            <tr style={{ background: "#0F172A" }}>
              {["Produit", "Total versé", "Capital final", "Euros constants", "Intérêts nets", "Taux net", "Rendement"].map((h, i) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: i === 0 ? "left" : "right", color: h === "Euros constants" ? "#F59E0B" : "#64748B", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actifs.map((p, i) => {
              const totalVerse = p.capital + p.versement * nAns * 12;
              const final      = calculerProduit(p, nAns).at(-1);
              const finalConst = enEurosConstants(final, nAns, inflation);
              const interets   = final - totalVerse;
              const gainReel   = finalConst - totalVerse;
              const tauxNetAff = p.type === "av_mixte"
                ? `${(p.taux * 0.828).toFixed(2)}% e / ${p.tauxUC}% UC`
                : p.prelevement > 0 ? `${(p.taux * (1 - p.prelevement / 100)).toFixed(3)} %` : `${p.taux} %`;
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #334155", background: i % 2 === 0 ? "transparent" : "#0F172A22" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ color: p.color, fontWeight: 700 }}>{p.label.split(" — ")[0]}</span>
                      {p.type === "av_mixte" && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "#1e1b4b", color: "#A5B4FC", border: "1px solid #3730a3" }}>Euro+UC</span>}
                      {p.type === "perp"     && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "#2d1b69", color: "#C084FC", border: "1px solid #6d28d9" }}>PERP</span>}
                      {p.prelevement > 0 && !["av_mixte","perp"].includes(p.type) && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "#431407", color: "#FB923C", border: "1px solid #7c2d12" }}>PS</span>}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#CBD5E1" }}>{fmt(totalVerse)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#E2E8F0", fontWeight: 700 }}>{fmt(final)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <div style={{ color: gainReel >= 0 ? "#F59E0B" : "#F87171", fontWeight: 600 }}>{fmt(finalConst)}</div>
                    <div style={{ fontSize: 10, color: gainReel >= 0 ? "#64748B" : "#F87171" }}>{gainReel >= 0 ? `+${fmt(gainReel)}` : fmt(gainReel)}</div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#34D399" }}>+{fmt(interets)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: p.prelevement > 0 ? "#FB923C" : "#34D399", fontSize: 11 }}>{tauxNetAff}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#818CF8" }}>+{(interets / totalVerse * 100).toFixed(1)} %</td>
                </tr>
              );
            })}
            {(() => {
              const t = actifs.reduce((a, p) => {
                const tv = p.capital + p.versement * nAns * 12;
                const f  = calculerProduit(p, nAns).at(-1);
                return { verse: a.verse + tv, final: a.final + f, finalConst: a.finalConst + enEurosConstants(f, nAns, inflation) };
              }, { verse: 0, final: 0, finalConst: 0 });
              const ti = t.final - t.verse;
              return (
                <tr style={{ borderTop: "2px solid #6366F1", background: "#1a1f35" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#E2E8F0", fontSize: 13 }}>∑ Total ({actifs.length} produits)</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "#E2E8F0", fontWeight: 700 }}>{fmt(t.verse)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>{fmt(t.final)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#F59E0B", fontSize: 14 }}>{fmt(t.finalConst)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#34D399", fontSize: 14 }}>+{fmt(ti)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "#64748B" }}>—</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#818CF8", fontSize: 14 }}>+{(ti / t.verse * 100).toFixed(1)} %</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#34D399", fontFamily: "monospace" }}>● exonéré — Livret A, LDD</span>
        <span style={{ fontSize: 11, color: "#FB923C", fontFamily: "monospace" }}>● PS 17,2%/an — CEL, AV euros, PERP</span>
        <span style={{ fontSize: 11, color: "#A5B4FC", fontFamily: "monospace" }}>● Euro+UC — PS euros annuels, PS UC au rachat</span>
        <span style={{ fontSize: 11, color: "#C084FC", fontFamily: "monospace" }}>● PERP — bloqué, sortie IR+CSG retraite</span>
        {inflation > 0 && <span style={{ fontSize: 11, color: "#F59E0B", fontFamily: "monospace" }}>● euros constants — inflation {inflation}%/an</span>}
      </div>

      {/* CSS print */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          button, .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
