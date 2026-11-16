import { Box, CircleDot, Ruler } from "lucide-react";
import type { ShapeDefinition } from "../data/models";

interface LessonFactsProps {
  model: ShapeDefinition;
  side: number;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value);
}

export function LessonFacts({ model, side }: LessonFactsProps) {
  const facts = [
    { icon: Box, label: "Mặt", value: model.faceSummary, tone: "blue" },
    { icon: CircleDot, label: "Cạnh · đỉnh", value: model.edgeSummary, tone: "mint" },
    { icon: Ruler, label: "Diện tích toàn phần", value: `${formatNumber(model.area(side))} cm²`, tone: "amber" },
  ];

  return (
    <section className="facts-grid" aria-label={`Thông tin ${model.name.toLowerCase()}`}>
      {facts.map(({ icon: Icon, label, value, tone }) => (
        <article className="fact-card" key={label}>
          <span className={`fact-icon ${tone}`}><Icon size={17} strokeWidth={1.8} /></span>
          <div className="fact-copy">
            <span className="fact-label">{label}</span>
            <strong className="fact-value">{value}</strong>
          </div>
        </article>
      ))}
      <article className="formula-card">
        <div className="formula-heading"><span className="formula-mark">ƒ</span><span>Công thức nhanh</span></div>
        <div className="formula-values">
          <span><small>S toàn phần</small><strong>{model.surfaceFormula}</strong></span>
          <i />
          <span><small>Thể tích</small><strong>{model.volumeFormula}</strong></span>
        </div>
        <div className="formula-result">Với {model.parameterContext(side)}, thể tích là <strong>{formatNumber(model.volume(side))} cm³</strong></div>
      </article>
    </section>
  );
}
