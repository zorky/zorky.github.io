import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PRODUITS_DEFAUT = [
  {
    id: "livretA1",
    label: "Livret A (1)",
    color: "#3B82F6",
    capital: 22950,
    versement: 0,
    taux: 1.5,
    actif: true,
  },
  {
    id: "livretA2",
    label: "Livret A (2)",
    color: "#93C5FD",
    capital: 22950,
    versement: 0,
    taux: 1.5,
    actif: true,
  },
  {
    id: "ldd1",
    label: "LDD (1)",
    color: "#F59E0B",
    capital: 12000,
    versement: 0,
    taux: 1.5,
    actif: true,
  },
  {
    id: "ldd2",
    label: "LDD (2)",
    color: "#FCD34D",
    capital: 12000,
    versement: 0,
    taux: 1.5,
    actif: true,
  },
  {
    id: "assuranceVie1",
    label: "Assurance vie (1)",
    color: "#10B981",
    capital: 62753,
    versement: 30,
    taux: 2.0,
    actif: true,
  },
  {
    id: "assuranceVie2",
    label: "Assurance vie (2)",
    color: "#6EE7B7",
    capital: 6900,
    versement: 29,
    taux: 2.0,
    actif: true,
  },
];

function fmt(n) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function calculer(capital, versement, tauxAnnuel, nAns) {
  const nMois = nAns * 12;
  const tauxMensuel = (1 + tauxAnnuel / 100) ** (1 / 12) - 1;
  const values = [];
  let w = capital;
  for (let k = 0; k <= nMois; k++) {
    if (k % 12 === 0) values.push(w);
    w = (1 + tauxMensuel) * w + versement;
  }
  return values; // une valeur par an
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
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#6366F1" }}
      />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0F172A", border: "1px solid #334155",
      borderRadius: 8, padding: "10px 14px", fontSize: 13
    }}>
      <div style={{ color: "#94A3B8", marginBottom: 6, fontFamily: "monospace" }}>
        Année {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontFamily: "monospace", marginBottom: 2 }}>
          {p.name} : {p.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [produits, setProduits] = useState(PRODUITS_DEFAUT);
  const [nAns, setNAns] = useState(10);

  const updateProduit = (id, champ, valeur) => {
    setProduits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [champ]: valeur } : p))
    );
  };

  const data = useMemo(() => {
    const rows = [];
    for (let an = 0; an <= nAns; an++) rows.push({ an });
    produits.filter(p => p.actif).forEach((p) => {
      const vals = calculer(p.capital, p.versement, p.taux, nAns);
      vals.forEach((v, i) => { rows[i][p.label] = Math.round(v); });
    });
    return rows;
  }, [produits, nAns]);

  const actifs = produits.filter((p) => p.actif);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",
      color: "#E2E8F0",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px 20px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Titre */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px",
          background: "linear-gradient(90deg, #6366F1, #818CF8, #38BDF8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: 0
        }}>
          Simulateur d'épargne
        </h1>
        <p style={{ color: "#64748B", fontSize: 13, marginTop: 4, fontFamily: "monospace" }}>
          Intérêts composés · taux annuel
        </p>
      </div>

      {/* Durée globale */}
      <div style={{
        background: "#1E293B", border: "1px solid #334155",
        borderRadius: 12, padding: "16px 20px", marginBottom: 20
      }}>
        <Slider label="Durée de simulation" value={nAns} min={1} max={30} step={1} onChange={setNAns} unit=" ans" />
      </div>

      {/* Paramètres par produit */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 24 }}>
        {produits.map((p) => (
          <div key={p.id} style={{
            background: "#1E293B",
            border: `1px solid ${p.actif ? p.color + "55" : "#334155"}`,
            borderRadius: 12, padding: "16px 18px",
            opacity: p.actif ? 1 : 0.45,
            transition: "opacity 0.2s"
          }}>
            {/* En-tête produit */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: p.color }}>{p.label}</span>
              </div>
              <button
                onClick={() => updateProduit(p.id, "actif", !p.actif)}
                style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 20,
                  border: `1px solid ${p.actif ? p.color : "#475569"}`,
                  background: p.actif ? p.color + "22" : "transparent",
                  color: p.actif ? p.color : "#64748B",
                  cursor: "pointer", fontFamily: "monospace"
                }}
              >
                {p.actif ? "actif" : "off"}
              </button>
            </div>

            <Slider label="Capital initial" value={p.capital} min={0} max={200000} step={500} onChange={(v) => updateProduit(p.id, "capital", v)} unit="€" />
            <Slider label="Versement mensuel" value={p.versement} min={0} max={1000} step={10} onChange={(v) => updateProduit(p.id, "versement", v)} unit="€" />
            <Slider label="Taux annuel" value={p.taux} min={0.1} max={10} step={0.1} onChange={(v) => updateProduit(p.id, "taux", v)} unit=" %" />
          </div>
        ))}
      </div>

      {/* Graphe */}
      <div style={{
        background: "#1E293B", border: "1px solid #334155",
        borderRadius: 12, padding: "20px 10px 10px", marginBottom: 20
      }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
            <XAxis
              dataKey="an"
              tickFormatter={(v) => `${v} an${v > 1 ? "s" : ""}`}
              tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`}
              tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: "monospace", color: "#94A3B8" }}
            />
            {actifs.map((p) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.label}
                stroke={p.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau récap */}
      <div style={{
        background: "#1E293B", border: "1px solid #334155",
        borderRadius: 12, overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "monospace" }}>
          <thead>
            <tr style={{ background: "#0F172A" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", color: "#64748B", fontWeight: 500 }}>Produit</th>
              <th style={{ padding: "10px 16px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Total versé</th>
              <th style={{ padding: "10px 16px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Capital final</th>
              <th style={{ padding: "10px 16px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Intérêts</th>
              <th style={{ padding: "10px 16px", textAlign: "right", color: "#64748B", fontWeight: 500 }}>Rendement</th>
            </tr>
          </thead>
          <tbody>
            {actifs.map((p, i) => {
              const totalVerse = p.capital + p.versement * nAns * 12;
              const final = calculer(p.capital, p.versement, p.taux, nAns).at(-1);
              const interets = final - totalVerse;
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #334155", background: i % 2 === 0 ? "transparent" : "#0F172A22" }}>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
                      <span style={{ color: p.color, fontWeight: 700 }}>{p.label}</span>
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#CBD5E1" }}>{fmt(totalVerse)}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#E2E8F0", fontWeight: 700 }}>{fmt(final)}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#34D399" }}>+{fmt(interets)}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", color: "#818CF8" }}>+{(interets / totalVerse * 100).toFixed(1)} %</td>
                </tr>
              );
            })}
            {/* Ligne total */}
            {(() => {
              const totaux = actifs.reduce((acc, p) => {
                const totalVerse = p.capital + p.versement * nAns * 12;
                const final = calculer(p.capital, p.versement, p.taux, nAns).at(-1);
                return {
                  verse: acc.verse + totalVerse,
                  final: acc.final + final,
                };
              }, { verse: 0, final: 0 });
              const totalInterets = totaux.final - totaux.verse;
              return (
                <tr style={{ borderTop: "2px solid #6366F1", background: "#1a1f35" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#E2E8F0", fontSize: 14 }}>
                    ∑ Total ({actifs.length} produit{actifs.length > 1 ? "s" : ""})
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#E2E8F0", fontWeight: 700 }}>{fmt(totaux.verse)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, fontSize: 15, color: "#E2E8F0" }}>{fmt(totaux.final)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#34D399", fontSize: 14 }}>+{fmt(totalInterets)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#818CF8", fontSize: 14 }}>
                    +{(totalInterets / totaux.verse * 100).toFixed(1)} %
                  </td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
