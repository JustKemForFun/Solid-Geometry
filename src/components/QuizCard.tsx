import { CheckCircle2, CircleHelp, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";
import type { ShapeDefinition } from "../data/models";

interface QuizCardProps {
  model: ShapeDefinition;
}

export function QuizCard({ model }: QuizCardProps) {
  const [answer, setAnswer] = useState<number | null>(null);
  const correct = answer === model.quiz.correct;

  return (
    <section className="panel quiz-panel" aria-labelledby="quiz-title">
      <div className="panel-heading">
        <div className="quiz-heading">
          <span className="quiz-icon"><CircleHelp size={17} /></span>
          <div><h2 className="panel-title" id="quiz-title">Thử tài nhanh!</h2><p className="panel-subtitle">Củng cố điều vừa khám phá</p></div>
        </div>
        <Sparkles className="quiz-sparkle" size={17} />
      </div>
      <p className="quiz-question">{model.quiz.question}</p>
      <div className="quiz-options">
        {model.quiz.answers.map((option) => {
          const value = Number(option.match(/\d+/)?.[0]);
          const selected = answer === value;
          const state = selected ? (correct ? " correct" : " incorrect") : "";
          return (
            <button
              className={`quiz-option${state}`}
              type="button"
              key={option}
              onClick={() => setAnswer(value)}
              aria-pressed={selected}
            >
              {option}
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <div className={`quiz-feedback ${correct ? "success" : "retry"}`} role="status">
          {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{correct ? `Chính xác! Đáp án là ${model.quiz.answers.find((choice) => Number(choice.match(/\d+/)?.[0]) === answer)}.` : "Chưa đúng, hãy thử đếm lại nhé."}</span>
        </div>
      )}
    </section>
  );
}
