import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Box, Ruler, Sparkles } from "lucide-react";
import { models, type ShapeId } from "../data/models";

interface ControlPanelProps {
  shape: ShapeId;
  fold: number;
  side: number;
  autoRotate: boolean;
  onFoldChange: (value: number) => void;
  onSideChange: (value: number) => void;
  onAutoRotateChange: (value: boolean) => void;
  onReset: () => void;
}

const presets = [
  { value: "0", label: "Khai triển" },
  { value: "50", label: "Gấp 1/2" },
  { value: "100", label: "Khối 3D" },
];

export function ControlPanel({
  shape,
  fold,
  side,
  autoRotate,
  onFoldChange,
  onSideChange,
  onAutoRotateChange,
  onReset,
}: ControlPanelProps) {
  const model = models[shape];
  const phaseCopy = fold === 0
    ? "Các mặt đang trải phẳng. Hãy quan sát cách chúng nối với nhau."
    : fold === 100
      ? "Khối đã ghép hoàn chỉnh. Kéo mô hình để xem các mặt."
      : "Các mặt đang gấp dần vào nhau — kéo tiếp để hoàn thiện khối.";
  const presetValue = presets.some((preset) => Number(preset.value) === fold)
    ? String(fold)
    : "";

  return (
    <section className="panel controls-panel" aria-labelledby="controls-title">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title" id="controls-title">Bàn điều khiển</h2>
          <p className="panel-subtitle">Tự tay khám phá hình</p>
        </div>
        <span className="controls-indicator"><span /> Trực tiếp</span>
      </div>

      <div className="control-block">
        <div className="control-heading">
          <label className="control-label" htmlFor="fold-slider">
            <span className="control-icon violet"><Box size={15} /></span>
            Gấp / mở hình
          </label>
          <output className="control-output" htmlFor="fold-slider">{fold}%</output>
        </div>
        <Slider.Root
          className="slider-root"
          id="fold-slider"
          min={0}
          max={100}
          step={1}
          value={[fold]}
          onValueChange={([value]) => value !== undefined && onFoldChange(value)}
          aria-label="Mức độ gấp mở hình"
        >
          <Slider.Track className="slider-track"><Slider.Range className="slider-range" /></Slider.Track>
          <Slider.Thumb className="slider-thumb" aria-label="Điều chỉnh mức gấp" />
        </Slider.Root>
        <div className="range-labels"><span>Mở phẳng</span><span>Hình khối</span></div>
        <ToggleGroup.Root
          className="fold-presets"
          type="single"
          value={presetValue}
          onValueChange={(value) => value && onFoldChange(Number(value))}
          aria-label="Chọn nhanh mức gấp"
        >
          {presets.map((preset) => (
            <ToggleGroup.Item className="preset-button" value={preset.value} key={preset.value}>
              {preset.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
        <p className="phase-note" aria-live="polite">{phaseCopy}</p>
      </div>

      <div className="control-block">
        <div className="control-heading">
          <label className="control-label" htmlFor="size-slider">
            <span className="control-icon amber"><Ruler size={15} /></span>
            Độ dài cạnh a
          </label>
          <output className="control-output" htmlFor="size-slider">{side} cm</output>
        </div>
        <Slider.Root
          className="slider-root"
          id="size-slider"
          min={2}
          max={8}
          step={1}
          value={[side]}
          onValueChange={([value]) => value !== undefined && onSideChange(value)}
          aria-label="Độ dài cạnh hình"
        >
          <Slider.Track className="slider-track"><Slider.Range className="slider-range amber-range" /></Slider.Track>
          <Slider.Thumb className="slider-thumb amber-thumb" aria-label="Điều chỉnh độ dài cạnh" />
        </Slider.Root>
        <div className="range-labels"><span>2 cm</span><span>8 cm</span></div>
      </div>

      <div className="control-bottom">
        <div className="auto-row">
          <div className="auto-copy">
            <span className="control-icon blue"><Sparkles size={15} /></span>
            <span><strong>Tự động xoay</strong><small>Quan sát mọi góc</small></span>
          </div>
          <Switch.Root
            className="switch-root"
            checked={autoRotate}
            onCheckedChange={onAutoRotateChange}
            aria-label="Tự động xoay mô hình"
          >
            <Switch.Thumb className="switch-thumb" />
          </Switch.Root>
        </div>
        <button className="reset-button" type="button" onClick={onReset}>
          <Sparkles size={14} />
          Đặt lại {model.shortName.toLowerCase()}
        </button>
      </div>
    </section>
  );
}
