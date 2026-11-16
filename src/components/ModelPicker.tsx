import { Box, Check, CircleDot, Layers, Triangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { models, shapeCategories, shapeOrder, type ShapeId } from "../data/models";

interface ModelPickerProps {
  value: ShapeId;
  onChange: (shape: ShapeId) => void;
}

const icons: Record<ShapeId, LucideIcon> = {
  cuboid: Box,
  cube: Box,
  prism: Layers,
  pyramid: Triangle,
  cylinder: CircleDot,
  cone: Triangle,
  sphere: CircleDot,
};

export function ModelPicker({ value, onChange }: ModelPickerProps) {
  return (
    <section className="panel model-panel" aria-labelledby="model-picker-title">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title" id="model-picker-title">Chọn hình khối</h2>
          <p className="panel-subtitle">Bắt đầu bằng một mô hình</p>
        </div>
        <span className="count-badge">{String(shapeOrder.length).padStart(2, "0")}</span>
      </div>
      {shapeCategories.map((category) => (
        <div className="model-category" key={category.label}>
          <h3 className="model-category-title">{category.label}</h3>
          <div className="model-list" role="group" aria-label={category.label}>
            {category.shapes.map((id) => {
              const model = models[id];
              const Icon = icons[id];
              const selected = id === value;
              return (
                <button
                  className={`model-option${selected ? " selected" : ""}`}
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange(id)}
                >
                  <span className="model-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <span className="model-copy">
                    <span className="model-name">{model.name}</span>
                    <span className="model-description">{model.description}</span>
                  </span>
                  <span className="model-check" aria-hidden="true"><Check size={14} /></span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
