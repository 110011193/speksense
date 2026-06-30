import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { FlowHeader } from '../../components/FlowHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { ApiError } from '../../api/types';
import { getDraft, getMyAssignment, saveDraft, submitAnswers } from '../../api/services/platform';
import type { ParticipantAssignment } from '../../api/services/platform';
import type { BehavioralScenario, Question } from '../../types/assessment';

type SurveyDraft = { step: number; answers: Record<string, string> };

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<ParticipantAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        const [data, draft] = await Promise.all([
          getMyAssignment(id),
          getDraft<SurveyDraft>(id),
        ]);
        if (cancelled) return;
        setAssignment(data);
        if (draft) {
          setStep(draft.step ?? 0);
          setAnswers(draft.answers ?? {});
        }
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof ApiError ? e.message : 'Could not load this assessment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (assignment) document.title = `SpekSense — ${assignment.title}`;
  }, [assignment]);

  const presentation = assignment?.presentation;
  const singlePage = presentation?.mode === 'singlePage';

  const isBehavioral = assignment?.kind === 'behavioral';
  const questions = (assignment?.kind === 'standard' ? assignment.questions : undefined) as
    | Question[]
    | undefined;
  const scenarios = (assignment?.kind === 'behavioral' ? assignment.scenarios : undefined) as
    | BehavioralScenario[]
    | undefined;
  const questionList = questions ?? [];
  const scenarioList = scenarios ?? [];
  const totalSteps = isBehavioral ? scenarioList.length : questionList.length;

  // Fire-and-forget autosave on any change to step/answers once loaded.
  useEffect(() => {
    if (!id || !assignment) return;
    void saveDraft(id, { step: singlePage ? 0 : step, answers });
  }, [id, assignment, step, answers, singlePage]);

  if (loading) {
    return (
      <div className="dashboard-page flow-page flow-page--centered">
        <FlowHeader />
        <main className="flow-main flow-main--center">
          <p className="flow-meta">Loading…</p>
        </main>
      </div>
    );
  }

  if (loadError || !assignment) {
    return (
      <div className="dashboard-page flow-page flow-page--centered">
        <FlowHeader />
        <main className="flow-main flow-main--center">
          <div className="flow-instructions-panel">
            <p className="flow-error" role="alert">
              {loadError ?? 'This assessment is not available.'}
            </p>
            <div className="flow-actions">
              <Link to="/assessments" className="dash-btn-pill dash-btn-pill--light">
                Back to assessments
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (assignment.kind === 'survey360') {
    return <Navigate to={`/assessments/${assignment.id}/peers`} replace />;
  }
  if (assignment.status === 'completed') return <Navigate to="/assessments" replace />;
  if (assignment.availability && assignment.availability !== 'open') {
    return <WindowGate assignment={assignment} />;
  }
  if (totalSteps === 0) return <Navigate to={`/assessments/${assignment.id}/complete`} replace />;

  const itemIds = isBehavioral ? scenarioList.map((s) => s.id) : questionList.map((q) => q.id);

  function setAnswerFor(itemId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
    setError(null);
  }

  function validateAll(): boolean {
    for (const itemId of itemIds) {
      if (!(answers[itemId] ?? '').trim()) {
        setError(
          isBehavioral
            ? 'Please answer every scenario before submitting.'
            : 'Please answer every question before submitting.',
        );
        return false;
      }
    }
    return true;
  }

  async function submitSurvey() {
    if (!id || !assignment) return;
    if (singlePage) {
      if (!validateAll()) return;
    }
    try {
      await submitAnswers(id, answers);
      navigate(`/assessments/${assignment.id}/complete`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not submit your answers.');
    }
  }

  if (singlePage) {
    return (
      <div className="dashboard-page flow-page">
        <FlowHeader
          onSaveProgress={() => {
            if (id) void saveDraft(id, { step: 0, answers });
          }}
          progress={
            presentation?.showProgressBar ? (
              <ProgressBar current={totalSteps} total={totalSteps} />
            ) : undefined
          }
        />
        <main className="flow-main">
          <article className={`flow-card glass survey-single-page${isBehavioral ? ' flow-card--behavioral' : ''}`}>
            {isBehavioral
              ? scenarioList.map((scenario, index) => (
                  <section key={scenario.id} className="survey-single-block">
                    <BehavioralScenarioBlock
                      scenario={scenario}
                      stepIndex={index}
                      total={totalSteps}
                      value={answers[scenario.id] ?? ''}
                      onChange={(v) => setAnswerFor(scenario.id, v)}
                      showSectionHeader={presentation?.behavioralShowSectionHeaders ?? true}
                      showProgress={false}
                    />
                  </section>
                ))
              : questionList.map((question) => (
                  <section key={question.id} className="survey-single-block">
                    <QuestionBlock
                      question={question}
                      value={answers[question.id] ?? ''}
                      onChange={(v) => setAnswerFor(question.id, v)}
                    />
                  </section>
                ))}
            {error ? (
              <p className="flow-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flow-actions">
              <Link
                to={`/assessments/${assignment.id}/instructions`}
                className="dash-btn-pill dash-btn-pill--light"
              >
                Back
              </Link>
              <button
                type="button"
                className="dash-btn-pill dash-pill--yellow flow-cta-primary"
                onClick={() => void submitSurvey()}
              >
                Submit
              </button>
            </div>
          </article>
        </main>
      </div>
    );
  }

  // Paginate: 1 item/screen normally, 2 when the author chose "Two per screen".
  const perPage = presentation?.mode === 'twoPerScreen' ? 2 : 1;
  const pageCount = Math.max(1, Math.ceil(totalSteps / perPage));
  const safePage = Math.min(step, pageCount - 1);
  const isLast = safePage === pageCount - 1;
  const pageStart = safePage * perPage;
  const pageItemIds = itemIds.slice(pageStart, pageStart + perPage);
  const multi = perPage > 1;

  function validateCurrent(): boolean {
    for (const itemId of pageItemIds) {
      if (!(answers[itemId] ?? '').trim()) {
        setError(
          isBehavioral
            ? 'Please answer every scenario on this page before continuing.'
            : 'Please answer every statement on this page before continuing.',
        );
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateCurrent()) return;
    if (isLast) {
      void submitSurvey();
      return;
    }
    setStep(() => Math.min(safePage + 1, pageCount - 1));
    setError(null);
  }

  function goBack() {
    if (safePage > 0) {
      setStep(safePage - 1);
      setError(null);
    }
  }

  return (
    <div className="dashboard-page flow-page">
      <FlowHeader
        onSaveProgress={() => {
          if (id) void saveDraft(id, { step: safePage, answers });
        }}
        progress={
          presentation?.showProgressBar ? (
            <ProgressBar current={safePage + 1} total={pageCount} />
          ) : undefined
        }
      />
      <main className="flow-main">
        <article
          className={`flow-card glass${isBehavioral ? ' flow-card--behavioral' : ''}${multi ? ' survey-single-page' : ''}`}
        >
          {isBehavioral
            ? scenarioList.slice(pageStart, pageStart + perPage).map((scenario, i) => (
                <section key={scenario.id} className={multi ? 'survey-single-block' : undefined}>
                  <BehavioralScenarioBlock
                    scenario={scenario}
                    stepIndex={pageStart + i}
                    total={totalSteps}
                    value={answers[scenario.id] ?? ''}
                    onChange={(v) => setAnswerFor(scenario.id, v)}
                    showSectionHeader={presentation?.behavioralShowSectionHeaders ?? true}
                    showProgress
                  />
                </section>
              ))
            : questionList.slice(pageStart, pageStart + perPage).map((question) => (
                <section key={question.id} className={multi ? 'survey-single-block' : undefined}>
                  <QuestionBlock
                    question={question}
                    value={answers[question.id] ?? ''}
                    onChange={(v) => setAnswerFor(question.id, v)}
                  />
                </section>
              ))}
          {error ? (
            <p className="flow-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flow-actions">
            {safePage > 0 ? (
              <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={goBack}>
                Back
              </button>
            ) : (
              <Link
                to={`/assessments/${assignment.id}/instructions`}
                className="dash-btn-pill dash-btn-pill--light"
              >
                Back
              </Link>
            )}
            <button
              type="button"
              className="dash-btn-pill dash-pill--yellow flow-cta-primary"
              onClick={goNext}
            >
              {isLast ? 'Submit' : 'Next'}
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}

function BehavioralScenarioBlock({
  scenario,
  stepIndex,
  total,
  value,
  onChange,
  showSectionHeader = true,
  showProgress = true,
}: {
  scenario: BehavioralScenario;
  stepIndex: number;
  total: number;
  value: string;
  onChange: (v: string) => void;
  showSectionHeader?: boolean;
  showProgress?: boolean;
}) {
  return (
    <>
      {showSectionHeader || showProgress ? (
        <p className="behavioral-meta">
          {showSectionHeader ? <span className="behavioral-section">{scenario.section}</span> : null}
          {showProgress ? (
            <span className="behavioral-progress">
              Scenario {stepIndex + 1} of {total}
            </span>
          ) : null}
        </p>
      ) : null}
      <h1 className="flow-question flow-question--behavioral">{scenario.prompt}</h1>
      <div className="survey-options survey-options--behavioral" role="radiogroup" aria-label={scenario.prompt}>
        {scenario.choices.map((choice) => (
          <label
            key={choice.key}
            className={`survey-option survey-option--behavioral${value === choice.key ? ' survey-option--selected' : ''}`}
          >
            <input
              type="radio"
              name={scenario.id}
              value={choice.key}
              checked={value === choice.key}
              onChange={() => onChange(choice.key)}
            />
            <span className="survey-option-key" aria-hidden>
              {choice.key}
            </span>
            <span className="survey-option-text">{choice.text}</span>
          </label>
        ))}
      </div>
    </>
  );
}

function QuestionBlock({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <h1 className="flow-question">{question.prompt}</h1>
      {question.type === 'single' ? (
        <div className="survey-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((opt) => (
            <label key={opt} className={`survey-option${value === opt ? ' survey-option--selected' : ''}`}>
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ) : (
        <textarea
          className="survey-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? 'Type your answer…'}
          rows={4}
        />
      )}
    </>
  );
}

/** Shown when the assessment is outside its active window — server enforces this too. */
function WindowGate({ assignment }: { assignment: ParticipantAssignment }) {
  const upcoming = assignment.availability === 'upcoming';
  const when = upcoming ? assignment.startAt : assignment.endAt;
  const whenLabel = when
    ? new Date(when).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
    : null;
  return (
    <div className="dashboard-page flow-page flow-page--centered">
      <FlowHeader />
      <main className="flow-main flow-main--center">
        <div className="flow-instructions-panel">
          <h1 className="flow-title">{assignment.title}</h1>
          <p className="flow-sub">
            {upcoming
              ? whenLabel
                ? `This assessment opens on ${whenLabel}. Please come back then.`
                : 'This assessment is not open yet.'
              : whenLabel
                ? `This assessment closed on ${whenLabel} and can no longer be completed.`
                : 'This assessment is closed.'}
          </p>
          <div className="flow-actions">
            <Link to="/assessments" className="dash-btn-pill dash-pill--yellow flow-cta-primary">
              Back to assessments
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
