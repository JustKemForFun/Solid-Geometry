import { Crosshair, Trash2, X } from "lucide-react";

export interface FreePoint {
  id: number;
  label: string;
  x: number;
  y: number;
  z: number;
}

interface FreePointsPanelProps {
  points: FreePoint[];
  isPlacing: boolean;
  onStartPlacement: () => void;
  onCancelPlacement: () => void;
  onChange: (point: FreePoint) => void;
  onRemove: (id: number) => void;
}

const axes = ["x", "y", "z"] as const;

export function FreePointsPanel({
  points,
  isPlacing,
  onStartPlacement,
  onCancelPlacement,
  onChange,
  onRemove,
}: FreePointsPanelProps) {
  return (
    <section className="panel free-points-panel" aria-labelledby="free-points-title">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title" id="free-points-title">Điểm tự do</h2>
          <p className="panel-subtitle">Thêm điểm và chỉnh tên, tọa độ</p>
        </div>
        <button
          className="add-point-button"
          type="button"
          onClick={isPlacing ? onCancelPlacement : onStartPlacement}
          aria-label={isPlacing ? "Hủy chấm điểm" : "Chấm điểm trên hình"}
          aria-pressed={isPlacing}
        >
          {isPlacing ? <X size={15} /> : <Crosshair size={15} />}
          {isPlacing ? "Hủy chấm" : "Chấm điểm"}
        </button>
      </div>

      <p className="point-coordinate-hint">
        {isPlacing
          ? "Chạm vào khối để đặt điểm trên mặt; chạm vùng trống để đặt trên mặt phẳng nhìn qua tâm."
          : "Chấm trực tiếp trên mô hình hoặc nhập tọa độ x, y, z (cm) để chỉnh chính xác."}
      </p>
      {points.length === 0 ? (
        <p className="empty-points-note">
          {isPlacing
            ? "Điểm sẽ xuất hiện ở đây sau khi bạn chạm vào mô hình 3D."
            : "Chưa có điểm tùy chỉnh. Nhấn “Chấm điểm” rồi chọn vị trí trên mô hình."}
        </p>
      ) : (
        <div className="free-point-list">
          {points.map((point) => (
            <div className="free-point-row" key={point.id}>
              <div className="free-point-heading">
                <span className="free-point-mark" />
                <label className="free-point-name">
                  <span className="sr-only">Tên điểm {point.label}</span>
                  <input
                    type="text"
                    maxLength={5}
                    value={point.label}
                    onChange={(event) => onChange({ ...point, label: event.target.value })}
                    aria-label={`Tên điểm ${point.label}`}
                  />
                </label>
                <button
                  className="remove-point-button"
                  type="button"
                  onClick={() => onRemove(point.id)}
                  aria-label={`Xóa điểm ${point.label}`}
                  title={`Xóa điểm ${point.label}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="free-point-coordinates">
                {axes.map((axis) => (
                  <label className="coordinate-field" key={axis}>
                    <span>{axis}</span>
                    <input
                      type="number"
                      min={-10}
                      max={10}
                      step={0.1}
                      value={point[axis]}
                      onChange={(event) => onChange({ ...point, [axis]: Number(event.target.value) })}
                      aria-label={`Tọa độ ${axis} của điểm ${point.label}`}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
