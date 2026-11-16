import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  BookOpen,
  Box,
  Check,
  CircleDot,
  ChevronRight,
  Expand,
  Eye,
  EyeOff,
  Moon,
  RotateCcw,
  RotateCw,
  Sparkles,
  Sun,
} from "lucide-react";
import { ControlPanel } from "./components/ControlPanel";
import { LessonFacts } from "./components/LessonFacts";
import { ModelPicker } from "./components/ModelPicker";
import { QuizCard } from "./components/QuizCard";
import { models, type ShapeId } from "./data/models";

const GeometryScene = lazy(() =>
  import("./components/GeometryScene").then((module) => ({ default: module.GeometryScene })),
);

type SectionId = "explore" | "learn" | "challenge";
type Theme = "light" | "dark";

export default function App() {
  const [shape, setShape] = useState<ShapeId>("cube");
  const [fold, setFold] = useState(100);
  const [side, setSide] = useState(4);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem("hinh-khoi-theme");
    return savedTheme === "dark" ||
      (savedTheme === null && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  });
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showVertices, setShowVertices] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("explore");
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  const stageRef = useRef<HTMLElement>(null);
  const lessonRef = useRef<HTMLElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const resetViewRef = useRef<(() => void) | null>(null);
  const model = models[shape];
  const isPolyhedron = model.geometry === "polyhedron";
  const sceneStatus = isPolyhedron
    ? fold === 0
      ? `LƯỚI KHAI TRIỂN · ${model.faces.length} MẶT`
      : fold === 100
        ? "MÔ HÌNH 3D · CÓ THỂ TƯƠNG TÁC"
        : "ĐANG GẤP · KÉO ĐỂ XOAY"
    : "KHỐI TRÒN XOAY · KÉO ĐỂ QUAN SÁT";

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("hinh-khoi-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const resetModel = () => {
    setFold(100);
    setSide(4);
    setAutoRotate(false);
    resetViewRef.current?.();
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await stageRef.current?.requestFullscreen();
      }
    } catch {
      setNotice("Trình duyệt chưa cho phép mở chế độ toàn màn hình.");
    }
  };

  const navItems: { id: SectionId; label: string; ref: React.RefObject<HTMLElement | null> }[] = [
    { id: "explore", label: "Khám phá", ref: stageRef },
    { id: "learn", label: "Bài học", ref: lessonRef },
    { id: "challenge", label: "Thử thách", ref: quizRef },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Hình Khối, về đầu trang">
          <span className="brand-mark"><Box size={21} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>Hình Khối</strong>
            <small>Không gian trong tầm tay</small>
          </span>
        </a>
        <nav className="top-nav" aria-label="Điều hướng bài học">
          {navItems.map(({ id, label, ref }) => (
            <button
              className={`nav-link${activeSection === id ? " active" : ""}`}
              type="button"
              key={id}
              onClick={() => {
                setActiveSection(id);
                ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            aria-pressed={theme === "dark"}
            title={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "dark" ? "Sáng" : "Tối"}</span>
          </button>
          <span className="streak-pill"><Sparkles size={14} /> Góc học tập</span>
        </div>
      </header>

      <main id="top">
        <div className="breadcrumbs">
          <span>Toán học</span><ChevronRight size={13} /><span>Hình học</span><ChevronRight size={13} /><strong>Hình khối không gian</strong>
        </div>
        <section className="page-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> PHÒNG THÍ NGHIỆM HÌNH HỌC <span className="eyebrow-separator">/</span> BÀI 01</div>
            <h1>Khám phá hình khối</h1>
            <p className="subtitle">Gấp mở khối đa diện, xoay khối tròn và khám phá hình học không gian theo cách của bạn.</p>
          </div>
          <div className="lesson-badge"><BookOpen size={15} /> Bài học tương tác <span>·</span> 5 phút</div>
        </section>

        <div className="workspace">
          <div className="main-column">
            <section className="stage-card" ref={stageRef} aria-label={`Mô hình ${model.name} tương tác`}>
              <div className="stage-toolbar">
                <div className="stage-title">
                  <span className="stage-title-icon"><Box size={17} /></span>
                  <div><h2>{model.name}</h2><p>Kéo mô hình để xoay tự do</p></div>
                </div>
                <div className="stage-actions" aria-label="Tùy chọn hiển thị">
                  <button
                    className={`icon-button${autoRotate ? " active" : ""}`}
                    type="button"
                    aria-label={autoRotate ? "Tắt tự động xoay" : "Bật tự động xoay"}
                    aria-pressed={autoRotate}
                    title="Tự động xoay"
                    onClick={() => setAutoRotate((value) => !value)}
                  ><RotateCw size={16} /></button>
                  <button
                    className={`icon-button${showLegend ? " active" : ""}`}
                    type="button"
                    aria-label={showLegend ? "Ẩn chú giải màu" : "Hiện chú giải màu"}
                    aria-pressed={showLegend}
                    title="Ẩn/hiện chú giải màu"
                    onClick={() => setShowLegend((value) => !value)}
                  >{showLegend ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  {model.vertices.length > 0 && (
                    <button
                      className={`icon-button${showVertices ? " active" : ""}`}
                      type="button"
                      aria-label={showVertices ? "Ẩn nhãn các điểm" : "Hiện nhãn các điểm"}
                      aria-pressed={showVertices}
                      title={showVertices ? "Ẩn nhãn các điểm" : "Hiện nhãn các điểm"}
                      onClick={() => setShowVertices((value) => !value)}
                    ><CircleDot size={16} /></button>
                  )}
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                    title={fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                    onClick={toggleFullscreen}
                  ><Expand size={16} /></button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Đặt lại góc nhìn"
                    title="Đặt lại góc nhìn"
                    onClick={() => resetViewRef.current?.()}
                  ><RotateCcw size={16} /></button>
                </div>
              </div>
              <div className="scene-surface">
                <Suspense fallback={<div className="scene-loading" role="status"><span />Đang dựng mô hình 3D…</div>}>
                  <GeometryScene
                    shape={shape}
                    fold={fold}
                    side={side}
                    theme={theme}
                    autoRotate={autoRotate}
                    showVertices={showVertices}
                    resetRef={resetViewRef}
                  />
                </Suspense>
                <div className="scene-status">
                  <span className={`status-dot ${!isPolyhedron || fold === 100 ? "assembled" : ""}`} />
                  <span>{sceneStatus}</span>
                </div>
                <div className="drag-hint"><span className="drag-icon"><ChevronRight size={13} /></span>Kéo để xoay <kbd>↔</kbd></div>
                <div className={`scene-legend${showLegend ? "" : " scene-legend-hidden"}`} aria-label="Chú giải màu sắc">
                  {isPolyhedron ? (
                    <>
                      <span><i className="legend-dot blue" />Mặt bên</span>
                      <span><i className="legend-dot mint" />Mặt đáy</span>
                      <span><i className="legend-dot amber" />Mặt trên</span>
                    </>
                  ) : model.geometry === "sphere" ? (
                    <span><i className="legend-dot blue" />Mặt cầu</span>
                  ) : (
                    <>
                      <span><i className="legend-dot blue" />Mặt cong</span>
                      <span><i className="legend-dot mint" />{model.geometry === "cylinder" ? "2 đáy tròn" : "Đáy tròn"}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="stage-caption">
                <span><span className="caption-pulse" /> MÔ HÌNH 3D TƯƠNG TÁC</span>
                <span className="axis-key"><i className="axis-x" /> x <i className="axis-y" /> y <i className="axis-z" /> z</span>
              </div>
            </section>

            <section ref={lessonRef} className="lesson-section" aria-label={`Thông tin ${model.name}`}>
              <div className="section-heading">
                <div><div className="section-kicker">GHI NHỚ</div><h2>Nhìn hình, hiểu khối</h2></div>
                <span className="section-step"><Check size={14} /> Bài 01</span>
              </div>
              <LessonFacts model={model} side={side} />
            </section>
          </div>

          <aside className="sidebar">
            <ModelPicker value={shape} onChange={setShape} />
            <ControlPanel
              shape={shape}
              fold={fold}
              side={side}
              autoRotate={autoRotate}
              onFoldChange={setFold}
              onSideChange={setSide}
              onAutoRotateChange={setAutoRotate}
              onReset={resetModel}
            />
            <section className="coach-card">
              <span className="coach-icon"><Sparkles size={16} /></span>
              <div>
                <strong>Mẹo khám phá</strong>
                <p>{isPolyhedron
                  ? <>Thử <b>mở phẳng</b> hình rồi đếm số mặt. Kéo mô hình để nhìn từ phía sau nữa nhé!</>
                  : <>Kéo mô hình hoặc bật <b>tự động xoay</b> để quan sát mặt cong và các đáy.</>}</p>
              </div>
            </section>
            <div ref={quizRef} className="quiz-anchor">
              <QuizCard key={shape} model={model} />
            </div>
          </aside>
        </div>
      </main>
      {notice && <div className="toast-message" role="status">{notice}</div>}
      <footer className="page-footer"><span>HÌNH KHỐI <i>·</i> HỌC BẰNG CÁCH KHÁM PHÁ</span><span>Dành cho những bộ óc tò mò <Sparkles size={13} /></span></footer>
    </div>
  );
}
