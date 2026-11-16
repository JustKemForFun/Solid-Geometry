import { Box, Check, Layers, Triangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { models, shapeOrder, type ShapeId } from "../data/models";

interface ModelPickerProps {
  value: ShapeId;
  onChange: (shape: ShapeId) => void;
}

const icons: Record<ShapeId, LucideIcon> = {
  cube: Box,
  pyramid: Triangle,
  prism: Layers,
};

export function ModelPicker({ value, onChange }: ModelPickerProps) {
  return (
    <section className="panel model-panel" aria-labelledby="model-picker-title">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title" id="model-picker-title">Chọn hình khối</h2>
          <p className="panel-subtitle">Bắt đầu bằng một mô hình</p>
        </div>
        <span className="count-badge">03</span>
      </div>
      <div className="model-list" role="group" aria-label="Chọn hình khối">
        {shapeOrder.map((id) => {
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
    </section>
  );
}
