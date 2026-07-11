import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// prelevement : taux prélèvements sociaux (0 = exonéré, 17.2 = CEL/AV)
const PRODUITS_DEFAUT = [
  { id: "livretA1",      label: "Livret A (1)",      color: "#3B82F6", capital: 22950, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "livretA2",      label: "Livret A (2)",      color: "#93C5FD", capital: 22950, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "ldd1",          label: "LDD (1)",           color: "#F59E0B", capital: 12000, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "ldd2",          label: "LDD (2)",           color: "#FCD34D", capital: 12000, versement: 0,  taux: 1.5, prelevement: 0,    actif: true },
  { id: "assuranceVie1", label: "Assurance vie (1)", color: "#10B981", capital: 62753, versement: 30, taux: 2.0, prelevement: 17.2, actif: true },
  { id: "assuranceVie2", label: "Assurance vie (2)", color: "#6EE7B7", capital: 6900,  versement: 29, taux: 2.0, prelevement: 17.2, actif: true },
  { id: "cel",           label: "CEL",               color: "#F472B6", capital: 11578, versement: 0,  taux: 1.5, prelevement: 17.2, actif: true },
];

function fmt(n) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function calculer(capital, versement, tauxAnnuel, prelevementPct, nAns) {
  const tauxNet = tauxAnnuel * (1 - prelevementPct / 100);
  const nMois = nAns * 12;
  const tauxMensuel = (1 + tauxNet / 100) ** (1 / 12) - 1;
  const values = [];
  let w = capital;
  for (let k = 0; k <= nMois; k++) {
    if (k % 12 === 0) values.push(w);
    w = (1 + tauxMensuel) * w + versement;
  }
  return values;
}

function enEurosConstants(valeur, annee, inflationPct) {
  return valeur / (1 + inflationPct / 100) ** annee;
}

function Slider({ label, value, min, max, step, onChange, unit = "" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", fontFamily: "monospace" }}>
          {typeof value === "number" && unit === "€"
            ? value.toLocaleString("fr-FR") + " €"
            : value + unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#6366F1" }}
      />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, inflation }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0F172A", border: "1px solid #334155",
      borderRadius: 8, padding: "10px 14px", fontSize: 12, maxWidth: 280
    }}>
      <div style={{ color: "#94A3B8", marginBottom: 6, fontFamily: "monospace" }}>Année {label}</div>
      {payload.map((p) => {
        const isConstant = p.name.endsWith("(€ const.)");
        return (
          <div key={p.name} style={{ color: p.color, fontFamily: "monospace", marginBottom: 2, opacity: isConstant ? 0.7 : 1 }}>
            {p.name} : {p.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </div>
        );
      })}
      {inflation > 0 && (
        <div style={{ color: "#64748B", fontSize: 10, marginTop: 6, fontFamily: "monospace" }}>
          Courbes pointillées = euros constants (inflation {inflation}%/an)
        </div>
      )}
    </div>
  );
};

const BADGE = {
  exo: { label: "exonéré",     bg: "#14532d", color: "#34D399", border: "#166534" },
  ps:  { label: "prél. 17,2%", bg: "#431407", color: "#FB923C", border: "#7c2d12" },
};

export default function App() {
  const [produits, setProduits]         = useState(PRODUITS_DEFAUT);
  const [nAns, setNAns]                 = useState(10);
  const [inflation, setInflation]       = useState(2.0);
  const [graphType, setGraphType]       = useState("line");
  const [showConstant, setShowConstant] = useState(true);

  const updateProduit = (id, champ, valeur) =>
    setProduits((prev) => prev.map((p) => (p.id === id ? { ...p, [champ]: valeur } : p)));

  const actifs = produits.filter((p) => p.actif);

  const data = useMemo(() => {
    const rows = [];
    for (let an = 0; an <= nAns; an++) rows.push({ an });
    actifs.forEach((p) => {
      const vals = calculer(p.capital, p.versement, p.taux, p.prelevement, nAns);
      vals.forEach((v, i) => {
        rows[i][p.label] = Math.round(v);
        if (showConstant && inflation > 0)
          rows[i][p.label + " (€ const.)"] = Math.round(enEurosConstants(v, i, inflation));
      });
    });
    return rows;
  }, [produits, nAns, inflation, showConstant]);

  const barData = useMemo(() => {
    return actifs.map((p) => {
      const final      = calculer(p.capital, p.versement, p.taux, p.prelevement, nAns).at(-1);
      const totalVerse = p.capital + p.versement * nAns * 12;
      return {
        label: p.label,
        color: p.color,
        "Capital versé":  Math.round(totalVerse),
        "Intérêts nets":  Math.round(final - totalVerse),
      };
    });
  }, [produits, nAns]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",
      color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif", padding: "24px 20px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Titre */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px",
          background: "linear-gradient(90deg, #6366F1, #818CF8, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0
        }}>Simulateur d'épargne</h1>
        <p style={{ color: "#64748B", fontSize: 13, marginTop: 4, fontFamily: "monospace" }}>
          Intérêts composés · taux annuel · prélèvements sociaux · inflation
        </p>
      </div>

      {/* Paramètres globaux */}
      <div style={{
        background: "#1E293B", border: "1px solid #334155",
        borderRadius: 12, padding: "16px 24px", marginBottom: 20,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px"
      }}>
        <Slider label="Durée de simulation" value={nAns}      min={1}  max={30} step={1}   onChange={setNAns}      unit=" ans" />
        <Slider label="Inflation annuelle"  value={inflation} min={0}  max={10} step={0.1} onChange={setInflation} unit=" %" />
      </div>

      {/* Cartes produits */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginBottom: 24 }}>
        {produits.map((p) => {
          const badge = p.prelevement === 0 ? BADGE.exo : BADGE.ps;
          return (
            <div key={p.id} style={{
              background: "#1E293B",
              border: `1px solid ${p.actif ? p.color + "55" : "#334155"}`,
              borderRadius: 12, padding: "16px 18px",
              opacity: p.actif ? 1 : 0.45, transition: "opacity 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: p.color }}>{p.label}</span>
                </div>
                <button
                  onClick={() => updateProduit(p.id, "actif", !p.actif)}
                  style={{
                    fontSize: 10, padding: "2px 7px", borderRadius: 20,
                    border: `1px solid ${p.actif ? p.color : "#475569"}`,
                    background: p.actif ? p.color + "22" : "transparent",
                    color: p.actif ? p.color : "#64748B",
                    cursor: "pointer", fontFamily: "monospace"
                  }}
                >{p.actif ? "actif" : "off"}</button>
              </div>

              <div style={{
                display: "inline-block", fontSize: 10, padding: "2px 8px", borderRadius: 10, marginBottom: 12,
                background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontFamily: "monospace"
              }}>
                {badge.label}
              </div>

              <Slider label="Capital initial"   value={p.capital}    min={0}   max={200000} step={50}  onChange={(v) => updateProduit(p.id, "capital", v)}    unit="€" />
              <Slider label="Versement mensuel" value={p.versement}  min={0}   max={1000}   step={1}   onChange={(v) => updateProduit(p.id, "versement", v)}  unit="€" />
              <Slider label="Taux brut annuel"  value={p.taux}       min={0.1} max={10}     step={0.1} onChange={(v) => updateProduit(p.id, "taux", v)}       unit=" %" />
              {p.prelevement > 0 && (
                <>
                  <Slider label="Prélèv. sociaux" value={p.prelevement} min={0} max={30} step={0.1}
                    onChange={(v) => updateProduit(p.id, "prelevement", v)} unit=" %" />
                  <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", marginTop: -4 }}>
                    Taux net : <span style={{ color: "#818CF8" }}>
                      {(p.taux * (1 - p.prelevement / 100)).toFixed(3)} %
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Contrôles graphe */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        {[["line", "📈 Courbes"], ["bar", "📊 Barres"]].map(([t, lbl]) => (
          <button key={t} onClick={() => setGraphType(t)} style={{
            padding: "5px 16px", borderRadius: 20, fontSize: 12, fontFamily: "monospace", cursor: "pointer",
            border: `1px solid ${graphType === t ? "#6366F1" : "#334155"}`,
            background: graphType === t ? "#6366F122" : "transparent",
            color: graphType === t ? "#818CF8" : "#64748B",
          }}>{lbl}</button>
        ))}
        {graphType === "line" && (
          <button onClick={() => setShowConstant(!showConstant)} style={{
            padding: "5px 16px", borderRadius: 20, fontSize: 12, fontFamily: "monospace", cursor: "pointer",
            border: `1px solid ${showConstant ? "#F59E0B" : "#334155"}`,
            background: showConstant ? "#F59E0B22" : "transparent",
            color: showConstant ? "#F59E0B" : "#64748B",
          }}>
            {showConstant ? "✓" : "○"} Euros constants (inflation)
          </button>
        )}
      </div>

      {/* Graphe */}
      <div style={{
        background: "#1E293B", border: "1px solid #334155",
        borderRadius: 12, padding: "20px 10px 10px", marginBottom: 20
      }}>
        <ResponsiveContainer width="100%" height={320}>
          {graphType === "line" ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="an"
                tickFormatter={(v) => `${v}a`}
                tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`}
                tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
              />
              <Tooltip content={<CustomTooltip inflation={showConstant ? inflation : 0} />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace", color: "#94A3B8" }} />
              {actifs.flatMap((p) => [
                <Line key={p.id} type="monotone" dataKey={p.label}
                  stroke={p.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />,
                ...(showConstant && inflation > 0 ? [
                  <Line key={p.id + "_c"} type="monotone" dataKey={p.label + " (€ const.)"}
                    stroke={p.color} strokeWidth={1.5} strokeDasharray="4 3"
                    dot={false} activeDot={{ r: 3 }} opacity={0.55} />
                ] : [])
              ])}
            </LineChart>
          ) : (
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="label"
                tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }}
                angle={-30} textAnchor="end" interval={0}
              />
              <YAxis
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`}
                tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
              />
              <Tooltip
                contentStyle={{ background: "#0F172A", border: "1px solid #334155", fontFamily: "monospace", fontSize: 12 }}
                formatter={(v) => v.toLocaleString("fr-FR") + " €"}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace", color: "#94A3B8" }} />
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
              <th style={{ padding: "10px 14px", textAlign: "left",  color: "#64748B", fontWeight: 500 }}>Produit</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Total versé</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Capital final</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: "#F59E0B", fontWeight: 500 }}>Euros constants</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Intérêts nets</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Taux net</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Rendement</th>
            </tr>
          </thead>
          <tbody>
            {actifs.map((p, i) => {
              const totalVerse = p.capital + p.versement * nAns * 12;
              const final      = calculer(p.capital, p.versement, p.taux, p.prelevement, nAns).at(-1);
              const finalConst = enEurosConstants(final, nAns, inflation);
              const interets   = final - totalVerse;
              const tauxNet    = p.taux * (1 - p.prelevement / 100);
              const gainReel   = finalConst - totalVerse;
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #334155", background: i % 2 === 0 ? "transparent" : "#0F172A22" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ color: p.color, fontWeight: 700 }}>{p.label}</span>
                      {p.prelevement > 0 && (
                        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "#431407", color: "#FB923C", border: "1px solid #7c2d12" }}>PS</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#CBD5E1" }}>{fmt(totalVerse)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#E2E8F0", fontWeight: 700 }}>{fmt(final)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <div style={{ color: gainReel >= 0 ? "#F59E0B" : "#F87171", fontWeight: 600 }}>{fmt(finalConst)}</div>
                    <div style={{ fontSize: 10, color: gainReel >= 0 ? "#64748B" : "#F87171" }}>
                      {gainReel >= 0 ? `+${fmt(gainReel)}` : fmt(gainReel)}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#34D399" }}>+{fmt(interets)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: p.prelevement > 0 ? "#FB923C" : "#34D399" }}>
                    {tauxNet.toFixed(3)} %
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#818CF8" }}>+{(interets / totalVerse * 100).toFixed(1)} %</td>
                </tr>
              );
            })}
            {/* Ligne total */}
            {(() => {
              const totaux = actifs.reduce((acc, p) => {
                const totalVerse = p.capital + p.versement * nAns * 12;
                const final      = calculer(p.capital, p.versement, p.taux, p.prelevement, nAns).at(-1);
                const finalConst = enEurosConstants(final, nAns, inflation);
                return { verse: acc.verse + totalVerse, final: acc.final + final, finalConst: acc.finalConst + finalConst };
              }, { verse: 0, final: 0, finalConst: 0 });
              const totalInterets = totaux.final - totaux.verse;
              return (
                <tr style={{ borderTop: "2px solid #6366F1", background: "#1a1f35" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#E2E8F0", fontSize: 13 }}>
                    ∑ Total ({actifs.length} produit{actifs.length > 1 ? "s" : ""})
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "#E2E8F0", fontWeight: 700 }}>{fmt(totaux.verse)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>{fmt(totaux.final)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#F59E0B", fontSize: 14 }}>{fmt(totaux.finalConst)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#34D399", fontSize: 14 }}>+{fmt(totalInterets)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "#64748B" }}>—</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#818CF8", fontSize: 14 }}>
                    +{(totalInterets / totaux.verse * 100).toFixed(1)} %
                  </td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div style={{ marginTop: 12, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#34D399", fontFamily: "monospace" }}>● exonéré — Livret A, LDD</span>
        <span style={{ fontSize: 11, color: "#FB923C", fontFamily: "monospace" }}>● PS 17,2% — CEL, assurance vie</span>
        {inflation > 0 && <span style={{ fontSize: 11, color: "#F59E0B", fontFamily: "monospace" }}>● euros constants — pouvoir d'achat réel à inflation {inflation}%/an</span>}
      </div>
    </div>
  );
}
