import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import { AssignParticipantsPanel } from '../../components/configure/AssignParticipantsPanel';
import {
  getAssessmentDefinition,
  kindLabel,
  publishAssessmentDefinition,
  updateAssessmentDefinition,
  updateAssessmentSchedule,
} from '../../api/services/assessmentCatalog';
import { newId } from '../../api/mock/store';
import { GENERAL_TRAIT_ITEMS, buildGeneralTraitScenarios } from '../../data/generalTrait';
import type { AssessmentDefinition } from '../../api/types';
import type { Assignment } from '../../types/assessment';
import { DEFAULT_PRESENTATION } from '../../types/presentation';
import { isAdminUser } from '../../utils/sessionUser';
import { canPublish, firstInvalidField, WIZARD_STEP_LABELS } from './configureValidation';
import type { InvalidField } from './configureValidation';

export function ConfigureAssignPage() {
  const { id } = useParams<{ id: string }>();
  const [def, setDef] = useState<AssessmentDefinition | null>(null);
  const [startAt, setStartAt] = useState<string | null>(null);
  const [endAt, setEndAt] = useState<string | null>(null);
  const [savingDates, setSavingDates] = useState(false);
  const [dateMsg, setDateMsg] = useState<string | null>(null);
  const [dateErr, setDateErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getAssessmentDefinition(id)
      .then((d) => {
        setDef(d);
        setStartAt(d.startAt ?? null);
        setEndAt(d.endAt ?? null);
      })
      .catch(() => setDef(null));
    document.title = 'SpekSense — Manage assessment';
  }, [id]);

  async function saveDates(assessmentId: string) {
    setSavingDates(true);
    setDateMsg(null);
    setDateErr(null);
    try {
      const updated = await updateAssessmentSchedule(assessmentId, { startAt, endAt });
      setDef(updated);
      setStartAt(updated.startAt ?? null);
      setEndAt(updated.endAt ?? null);
      setDateMsg('Dates saved. Anyone already assigned is emailed about a date change.');
    } catch (e) {
      setDateErr(e instanceof Error ? e.message : 'Could not update the dates.');
    } finally {
      setSavingDates(false);
    }
  }

  if (!isAdminUser()) return <Navigate to="/assessments" replace />;
  if (!id) return <Navigate to="/configure" replace />;
  if (!def) return <p className="configure-muted configure-center">Loading…</p>;

  const isPublished = def.publishStatus === 'published';

  return (
    <div className="dashboard-page configure-page">
      <AppHeader />
      <main className="dash-main configure-main configure-main--narrow">
        <Link to="/configure" className="configure-back">
          ← Back to Configure
        </Link>
        <h1 className="configure-title">Manage: {def.title}</h1>

        {isPublished ? (
          <section className="configure-panel" aria-labelledby="cfg-schedule-heading">
            <h2 id="cfg-schedule-heading" className="configure-section-title">
              Schedule
            </h2>
            <p className="configure-muted">
              Change when this assessment opens and closes. Everyone already assigned is emailed when a
              date changes. Leave both blank for no time limit.
            </p>
            <div className="configure-form-grid">
              <label>
                Opens (start)
                <input
                  type="datetime-local"
                  value={toLocalInput(startAt)}
                  onChange={(e) => setStartAt(fromLocalInput(e.target.value))}
                />
              </label>
              <label>
                Closes (end)
                <input
                  type="datetime-local"
                  value={toLocalInput(endAt)}
                  onChange={(e) => setEndAt(fromLocalInput(e.target.value))}
                />
              </label>
            </div>
            {dateErr ? (
              <p className="flow-error" role="alert">
                {dateErr}
              </p>
            ) : null}
            {dateMsg ? (
              <p className="configure-banner configure-banner--ok" role="status">
                {dateMsg}
              </p>
            ) : null}
            <div className="configure-wizard-actions">
              <button
                type="button"
                className="dash-btn-pill dash-pill--yellow"
                disabled={savingDates}
                onClick={() => void saveDates(def.id)}
              >
                {savingDates ? 'Saving…' : 'Save dates'}
              </button>
            </div>
          </section>
        ) : null}

        <section className="configure-panel" aria-labelledby="cfg-participants-heading">
          <h2 id="cfg-participants-heading" className="configure-section-title">
            Participants
          </h2>
          <AssignParticipantsPanel assessmentId={def.id} published={isPublished} />
        </section>
      </main>
    </div>
  );
}

export function ConfigureWizardPage() {
  const { id } = useParams<{ id: string }>();
  const [def, setDef] = useState<AssessmentDefinition | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<InvalidField | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAssessmentDefinition(id)
      .then((d) => {
        setDef(d);
        document.title = `SpekSense — Configure ${d.title || 'assessment'}`;
      })
      .catch(() => setDef(null));
  }, [id]);

  async function save(patch: Partial<AssessmentDefinition>): Promise<boolean> {
    if (!id || !def) return false;
    const snapshot = def; // local state when this save started
    setSaving(true);
    setError(null);
    setInvalidField(null);
    try {
      const updated = await updateAssessmentDefinition(id, patch);
      // Don't let a late save response clobber edits the user made while it was
      // in flight (e.g. clicking "Add instruction" right after blurring a field,
      // which otherwise made the new empty row flicker away).
      setDef((cur) => (cur === snapshot ? updated : cur));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!id || !def) return;
    const invalid = firstInvalidField(def);
    if (invalid) {
      setError(invalid.message);
      setInvalidField(invalid);
      return;
    }
    setSaving(true);
    try {
      const updated = await publishAssessmentDefinition(id);
      setDef(updated);
      setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!isAdminUser()) return <Navigate to="/assessments" replace />;
  if (!id) return <Navigate to="/configure" replace />;
  if (!def) return <p className="configure-muted configure-center">Loading assessment…</p>;

  const isPublished = def.publishStatus === 'published';
  const maxStep = isPublished ? 6 : 5;

  return (
    <div className="dashboard-page configure-page">
      <AppHeader />
      <main className="dash-main configure-main configure-main--narrow">
        <Link to="/configure" className="configure-back">
          ← Back to Configure
        </Link>
        <h1 className="configure-title">{def.title.trim() || 'New assessment'}</h1>

        <ol className="configure-steps" aria-label="Wizard progress">
          {WIZARD_STEP_LABELS.map((label, i) => (
            <li
              key={label}
              className={`configure-step${i === step ? ' configure-step--active' : ''}${i < step ? ' configure-step--done' : ''}`}
            >
              {label}
            </li>
          ))}
        </ol>

        {error ? (
          <p className="flow-error" id="cfg-wizard-error" role="alert">
            {error}
          </p>
        ) : null}
        {saving ? <p className="configure-muted">Saving…</p> : null}

        {step === 0 ? (
          <TypeStep
            def={def}
            onChangeKind={(kind) => {
              if (def.kind === kind) return;
              // Only warn when switching would actually discard content the admin
              // has authored — a fresh draft (no questions/scenarios/behaviors yet)
              // switches instantly with no interruption.
              if (hasAuthoredContent(def)) {
                const confirmed = window.confirm(
                  'Changing type will reset the content you have added. Continue?',
                );
                if (!confirmed) return;
              }
              // A Trait Assessment defaults to the SpekSense General template; other kinds start empty.
              const nextPatch =
                kind === 'behavioral'
                  ? {
                      kind: 'behavioral' as const,
                      instructions: def.instructions.length ? def.instructions : [''],
                      scenarios: buildGeneralTraitScenarios(),
                    }
                  : emptyContentForKind(kind, def);
              setDef({ ...def, ...nextPatch } as AssessmentDefinition);
              void save(nextPatch).then(() => {
                if (id) getAssessmentDefinition(id).then(setDef);
              });
            }}
            onPickTraitTemplate={(template) => {
              const scenarios = template === 'general' ? buildGeneralTraitScenarios() : [];
              const patch = { kind: 'behavioral' as const, scenarios };
              setDef({ ...def, ...patch } as AssessmentDefinition);
              void save(patch);
            }}
          />
        ) : null}

        {step === 1 ? (
          <BasicsStep
            def={def}
            invalidField={invalidField}
            onChange={(patch) => {
              setDef({ ...def, ...patch });
              setInvalidField(null);
            }}
            onBlurSave={(patch) => void save(patch)}
          />
        ) : null}

        {step === 2 ? (
          <InstructionsStep
            instructions={def.instructions}
            onChange={(instructions) => {
              setDef({ ...def, instructions });
            }}
            onBlurSave={() => void save({ instructions: def.instructions })}
          />
        ) : null}

        {step === 3 ? (
          <ContentStep
            def={def}
            invalidField={invalidField}
            onChange={(d) => {
              setDef(d);
              setInvalidField(null);
            }}
            onSave={() => void save(stripMeta(def))}
          />
        ) : null}

        {step === 4 ? (
          <ExperienceStep
            def={def}
            // Persist the NEW presentation directly — reading def.presentation in a
            // separate onSave caught a stale value, so the choice never saved.
            onChange={(presentation) => {
              setDef({ ...def, presentation });
              void save({ presentation });
            }}
            onSave={() => {}}
          />
        ) : null}

        {step === 5 ? (
          <ReviewStep def={def} onPublish={() => void handlePublish()} isPublished={isPublished} />
        ) : null}

        {step === 6 ? (
          <AssignParticipantsPanel
            assessmentId={def.id}
            published={def.publishStatus === 'published'}
          />
        ) : null}

        <div className="configure-wizard-actions">
          {step > 0 ? (
            <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : null}
          {step < maxStep ? (
            <button
              type="button"
              className="dash-btn-pill dash-pill--yellow"
              onClick={() => {
                const invalid = firstInvalidField(def);
                const blocksThisStep =
                  invalid &&
                  ((step === 1 && (invalid.field === 'title' || invalid.field === 'endAt')) ||
                    (step === 2 && invalid.field === 'instructions') ||
                    (step === 3 &&
                      invalid.field !== 'title' &&
                      invalid.field !== 'endAt' &&
                      invalid.field !== 'instructions'));
                if (blocksThisStep) {
                  setError(invalid.message);
                  setInvalidField(invalid);
                  return;
                }
                void save(stripMeta(def)).then((ok) => {
                  if (ok) setStep((s) => Math.min(s + 1, maxStep));
                });
              }}
            >
              Next
            </button>
          ) : (
            <Link to="/configure" className="dash-btn-pill dash-pill--yellow">
              Finish
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

function stripMeta(def: AssessmentDefinition): Partial<AssessmentDefinition> {
  const { id, createdAt, updatedAt, createdByEmail, publishStatus, ...rest } = def;
  void id;
  void createdAt;
  void updatedAt;
  void createdByEmail;
  void publishStatus;
  return rest;
}

/** True when the assessment has content that switching type would discard. */
function hasAuthoredContent(def: AssessmentDefinition): boolean {
  if (def.kind === 'standard') return (def.questions ?? []).length > 0;
  if (def.kind === 'behavioral') return (def.scenarios ?? []).length > 0;
  if (def.kind === 'survey360') {
    return (def.competencies ?? []).some(
      (c) => c.title.trim() !== '' || c.behaviors.some((b) => b.statement.trim() !== ''),
    );
  }
  return false;
}

function emptyContentForKind(
  kind: Assignment['kind'],
  def: AssessmentDefinition,
): Partial<AssessmentDefinition> {
  const base = {
    kind,
    instructions: def.instructions.length ? def.instructions : [''],
  };
  if (kind === 'standard') return { ...base, kind: 'standard', questions: [] };
  if (kind === 'behavioral') return { ...base, kind: 'behavioral', scenarios: [] };
  return {
    ...base,
    kind: 'survey360',
    competencies: [
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
    ],
  };
}

/** ISO-8601 (UTC) → value for a <input type="datetime-local"> (local wall-clock). */
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
/** datetime-local value → ISO-8601 (UTC), or null when cleared/invalid. */
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function BasicsStep({
  def,
  invalidField,
  onChange,
  onBlurSave,
}: {
  def: AssessmentDefinition;
  invalidField: InvalidField | null;
  onChange: (p: Partial<AssessmentDefinition>) => void;
  onBlurSave: (p: Partial<AssessmentDefinition>) => void;
}) {
  const titleInvalid = invalidField?.field === 'title';
  const endInvalid = invalidField?.field === 'endAt';
  return (
    <div className="configure-panel configure-form-grid">
      <label className="configure-span-2" htmlFor="cfg-title">
        Title
        <input
          id="cfg-title"
          required
          aria-required="true"
          aria-invalid={titleInvalid || undefined}
          aria-describedby={titleInvalid ? 'cfg-title-error' : undefined}
          value={def.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onBlur={() => onBlurSave({ title: def.title })}
        />
        {titleInvalid ? (
          <span id="cfg-title-error" className="configure-field-error" role="alert">
            {invalidField?.message}
          </span>
        ) : null}
      </label>
      <label className="configure-span-2">
        Subtitle
        <input
          value={def.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          onBlur={() => onBlurSave({ subtitle: def.subtitle })}
        />
      </label>
      <label>
        Estimated minutes
        <input
          type="number"
          min={1}
          value={def.estimatedMinutes}
          onChange={(e) => onChange({ estimatedMinutes: Number(e.target.value) || 1 })}
          onBlur={() => onBlurSave({ estimatedMinutes: def.estimatedMinutes })}
        />
      </label>
      <label>
        Due label
        <input
          value={def.dueLabel}
          onChange={(e) => onChange({ dueLabel: e.target.value })}
          onBlur={() => onBlurSave({ dueLabel: def.dueLabel })}
        />
      </label>
      <label>
        Opens (start)
        <input
          type="datetime-local"
          value={toLocalInput(def.startAt)}
          onChange={(e) => onChange({ startAt: fromLocalInput(e.target.value) })}
          onBlur={() => onBlurSave({ startAt: def.startAt ?? '' })}
        />
      </label>
      <label htmlFor="cfg-endat">
        Closes (end)
        <input
          id="cfg-endat"
          type="datetime-local"
          aria-invalid={endInvalid || undefined}
          aria-describedby={endInvalid ? 'cfg-endat-error' : undefined}
          value={toLocalInput(def.endAt)}
          onChange={(e) => onChange({ endAt: fromLocalInput(e.target.value) })}
          onBlur={() => onBlurSave({ endAt: def.endAt ?? '' })}
        />
        {endInvalid ? (
          <span id="cfg-endat-error" className="configure-field-error" role="alert">
            {invalidField?.message}
          </span>
        ) : null}
      </label>
      <p className="configure-muted configure-span-2">
        Participants can only open and submit this assessment between the start and end times. Leave
        both blank for no time limit.
      </p>
    </div>
  );
}

function TypeStep({
  def,
  onChangeKind,
  onPickTraitTemplate,
}: {
  def: AssessmentDefinition;
  onChangeKind: (kind: Assignment['kind']) => void;
  onPickTraitTemplate: (template: 'general' | 'custom') => void;
}) {
  const options: { kind: Assignment['kind']; label: string; desc: string }[] = [
    { kind: 'standard', label: 'Standard survey', desc: 'Single-choice and open-text questions.' },
    { kind: 'behavioral', label: 'Trait Assessment', desc: 'Statements rated on a scale (e.g. True/False or 1–5).' },
    { kind: 'survey360', label: '360 feedback', desc: 'Peer selection and effectiveness scales.' },
  ];
  // Heuristic: the General template if the statements still match the SpekSense preset.
  const isGeneral =
    def.kind === 'behavioral' &&
    (def.scenarios ?? []).length === GENERAL_TRAIT_ITEMS.length &&
    def.scenarios?.[0]?.prompt === GENERAL_TRAIT_ITEMS[0].statement;
  return (
    <>
      <div className="configure-panel configure-type-grid">
        {options.map((opt) => (
          <button
            key={opt.kind}
            type="button"
            className={`configure-type-card${def.kind === opt.kind ? ' configure-type-card--active' : ''}`}
            onClick={() => onChangeKind(opt.kind)}
          >
            <strong>{opt.label}</strong>
            <span>{opt.desc}</span>
          </button>
        ))}
      </div>

      {def.kind === 'behavioral' ? (
        <div className="configure-panel configure-trait-template">
          <p className="configure-trait-template-title">Trait template</p>
          <div className="configure-type-grid">
            <button
              type="button"
              className={`configure-type-card${isGeneral ? ' configure-type-card--active' : ''}`}
              onClick={() => onPickTraitTemplate('general')}
            >
              <strong>General Trait Assessment</strong>
              <span>SpekSense's standard {GENERAL_TRAIT_ITEMS.length}-statement set. You can still edit it.</span>
            </button>
            <button
              type="button"
              className={`configure-type-card${!isGeneral ? ' configure-type-card--active' : ''}`}
              onClick={() => onPickTraitTemplate('custom')}
            >
              <strong>Custom</strong>
              <span>Build your own statements and options from scratch.</span>
            </button>
          </div>
          <p className="configure-muted">Switching templates replaces the statements on the Content step.</p>
        </div>
      ) : null}
    </>
  );
}

function InstructionsStep({
  instructions,
  onChange,
  onBlurSave,
}: {
  instructions: string[];
  onChange: (lines: string[]) => void;
  onBlurSave: () => void;
}) {
  return (
    <div className="configure-panel">
      {instructions.map((line, i) => (
        <div key={`inst-${i}`} className="configure-repeat-row">
          <input
            value={line}
            onChange={(e) => {
              const next = [...instructions];
              next[i] = e.target.value;
              onChange(next);
            }}
            onBlur={onBlurSave}
            placeholder={`Instruction ${i + 1}`}
          />
          <button
            type="button"
            className="configure-icon-btn"
            aria-label="Remove instruction"
            onClick={() => onChange(instructions.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="dash-btn-pill dash-btn-pill--light"
        onClick={() => onChange([...instructions, ''])}
      >
        Add instruction
      </button>
    </div>
  );
}

function ContentStep({
  def,
  invalidField,
  onChange,
  onSave,
}: {
  def: AssessmentDefinition;
  invalidField: InvalidField | null;
  onChange: (d: AssessmentDefinition) => void;
  onSave: () => void;
}) {
  const [addCount, setAddCount] = useState(3); // "how many statements" quick-add (trait/custom)
  if (def.kind === 'standard') {
    const questions = def.questions ?? [];
    return (
      <div className="configure-panel">
        {questions.map((q, qi) => (
          <div key={q.id} className="configure-content-block">
            <label htmlFor={`cfg-q-${qi}-prompt`}>
              Prompt
              <input
                id={`cfg-q-${qi}-prompt`}
                required
                aria-required="true"
                value={q.prompt}
                onChange={(e) => {
                  const next = [...questions];
                  next[qi] = { ...q, prompt: e.target.value };
                  onChange({ ...def, kind: 'standard', questions: next });
                }}
                onBlur={onSave}
              />
            </label>
            <label>
              Type
              <select
                value={q.type}
                onChange={(e) => {
                  const next = [...questions];
                  if (e.target.value === 'text') {
                    next[qi] = { id: q.id, type: 'text', prompt: q.prompt, placeholder: '' };
                  } else {
                    next[qi] = { id: q.id, type: 'single', prompt: q.prompt, options: ['Option 1'] };
                  }
                  onChange({ ...def, kind: 'standard', questions: next });
                  onSave();
                }}
              >
                <option value="single">Single choice</option>
                <option value="text">Open text</option>
              </select>
            </label>
            {q.type === 'single' ? (
              <div className="configure-options">
                {q.options.map((opt, oi) => (
                  <input
                    key={`${q.id}-opt-${oi}`}
                    value={opt}
                    onChange={(e) => {
                      const next = [...questions];
                      const options = [...q.options];
                      options[oi] = e.target.value;
                      next[qi] = { ...q, options };
                      onChange({ ...def, kind: 'standard', questions: next });
                    }}
                    onBlur={onSave}
                  />
                ))}
                <button
                  type="button"
                  className="dash-btn-pill dash-btn-pill--light"
                  onClick={() => {
                    const next = [...questions];
                    next[qi] = { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
                    onChange({ ...def, kind: 'standard', questions: next });
                  }}
                >
                  Add option
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className="configure-link-danger"
              onClick={() =>
                onChange({ ...def, kind: 'standard', questions: questions.filter((_, j) => j !== qi) })
              }
            >
              Remove question
            </button>
          </div>
        ))}
        {invalidField?.field === 'questions' ? (
          <p className="configure-field-error" role="alert">{invalidField.message}</p>
        ) : null}
        <button
          type="button"
          className="dash-btn-pill dash-btn-pill--light"
          onClick={() =>
            onChange({
              ...def,
              kind: 'standard',
              questions: [
                ...questions,
                { id: newId('q'), type: 'single', prompt: '', options: ['Option 1'] },
              ],
            })
          }
        >
          Add question
        </button>
      </div>
    );
  }

  if (def.kind === 'behavioral') {
    const scenarios = def.scenarios ?? [];
    const OPTION_KEYS = 'ABCDEFGHIJ';
    const blankStatement = () => ({
      id: newId('scenario'),
      section: 'General',
      prompt: '',
      choices: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
      ],
    });
    return (
      <div className="configure-panel">
        <div className="configure-trait-add">
          <label className="configure-trait-add-count">
            Statements to add
            <input
              type="number"
              min={1}
              max={100}
              value={addCount}
              onChange={(e) => setAddCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
            />
          </label>
          <button
            type="button"
            className="dash-btn-pill dash-btn-pill--light"
            onClick={() =>
              onChange({ ...def, scenarios: [...scenarios, ...Array.from({ length: addCount }, blankStatement)] })
            }
          >
            Add {addCount} statement{addCount === 1 ? '' : 's'}
          </button>
        </div>

        {scenarios.map((s, si) => (
          <div key={s.id} className="configure-content-block">
            <label>
              Section
              <input
                value={s.section}
                onChange={(e) => {
                  const scenarios = [...def.scenarios];
                  scenarios[si] = { ...s, section: e.target.value };
                  onChange({ ...def, scenarios });
                }}
                onBlur={onSave}
              />
            </label>
            <label>
              Statement
              <textarea
                rows={2}
                value={s.prompt}
                onChange={(e) => {
                  const scenarios = [...def.scenarios];
                  scenarios[si] = { ...s, prompt: e.target.value };
                  onChange({ ...def, scenarios });
                }}
                onBlur={onSave}
              />
            </label>
            <div className="configure-options">
              {s.choices.map((c, ci) => (
                <div key={ci} className="configure-option-row">
                  <input
                    aria-label={`Option ${ci + 1}`}
                    placeholder={`Option ${ci + 1}`}
                    value={c.text}
                    onChange={(e) => {
                      const scenarios = [...def.scenarios];
                      const choices = [...s.choices];
                      choices[ci] = { ...c, text: e.target.value };
                      scenarios[si] = { ...s, choices };
                      onChange({ ...def, scenarios });
                    }}
                    onBlur={onSave}
                  />
                  {s.choices.length > 2 ? (
                    <button
                      type="button"
                      className="configure-icon-btn"
                      aria-label={`Remove option ${ci + 1}`}
                      onClick={() => {
                        const scenarios = [...def.scenarios];
                        scenarios[si] = { ...s, choices: s.choices.filter((_, j) => j !== ci) };
                        onChange({ ...def, scenarios });
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                className="dash-btn-pill dash-btn-pill--light configure-add-option"
                onClick={() => {
                  const scenarios = [...def.scenarios];
                  const choices = [
                    ...s.choices,
                    { key: OPTION_KEYS[s.choices.length] ?? String(s.choices.length + 1), text: '' },
                  ];
                  scenarios[si] = { ...s, choices };
                  onChange({ ...def, scenarios });
                }}
              >
                Add option
              </button>
            </div>
            <button
              type="button"
              className="configure-link-danger"
              onClick={() => onChange({ ...def, scenarios: def.scenarios.filter((_, j) => j !== si) })}
            >
              Remove statement
            </button>
          </div>
        ))}
        {invalidField?.field === 'scenarios' ? (
          <p className="configure-field-error" role="alert">{invalidField.message}</p>
        ) : null}
        <button
          type="button"
          className="dash-btn-pill dash-btn-pill--light"
          onClick={() => onChange({ ...def, scenarios: [...scenarios, blankStatement()] })}
        >
          Add statement
        </button>
      </div>
    );
  }

  const competencies = def.competencies ?? [];
  return (
    <div className="configure-panel">
      {competencies.map((comp, ci) => {
        const titleInvalid = invalidField?.field === `comp-${ci}-title`;
        return (
        <div key={comp.id} className="configure-content-block">
          <label htmlFor={`cfg-comp-${ci}-title`}>
            Competency title
            <input
              id={`cfg-comp-${ci}-title`}
              required
              aria-required="true"
              aria-invalid={titleInvalid || undefined}
              aria-describedby={titleInvalid ? `cfg-comp-${ci}-title-error` : undefined}
              value={comp.title}
              onChange={(e) => {
                const competencies = [...def.competencies];
                competencies[ci] = { ...comp, title: e.target.value };
                onChange({ ...def, competencies });
              }}
              onBlur={onSave}
            />
            {titleInvalid ? (
              <span id={`cfg-comp-${ci}-title-error`} className="configure-field-error" role="alert">
                {invalidField?.message}
              </span>
            ) : null}
          </label>
          {comp.behaviors.map((b, bi) => {
            const behaviorInvalid = invalidField?.field === `comp-${ci}-behavior-${bi}`;
            return (
            <label key={b.id} htmlFor={`cfg-comp-${ci}-behavior-${bi}`}>
              Behavior {bi + 1}
              <input
                id={`cfg-comp-${ci}-behavior-${bi}`}
                required
                aria-required="true"
                aria-invalid={behaviorInvalid || undefined}
                aria-describedby={behaviorInvalid ? `cfg-comp-${ci}-behavior-${bi}-error` : undefined}
                value={b.statement}
                onChange={(e) => {
                  const competencies = [...def.competencies];
                  const behaviors = [...comp.behaviors] as [typeof b, typeof b];
                  behaviors[bi] = { ...b, statement: e.target.value };
                  competencies[ci] = { ...comp, behaviors };
                  onChange({ ...def, competencies });
                }}
                onBlur={onSave}
              />
              {behaviorInvalid ? (
                <span id={`cfg-comp-${ci}-behavior-${bi}-error`} className="configure-field-error" role="alert">
                  {invalidField?.message}
                </span>
              ) : null}
            </label>
            );
          })}
        </div>
        );
      })}
      <p className="configure-muted">360 assessments use four competencies with two behaviors each.</p>
    </div>
  );
}

function ExperienceStep({
  def,
  onChange,
  onSave,
}: {
  def: AssessmentDefinition;
  onChange: (p: AssessmentDefinition['presentation']) => void;
  onSave: () => void;
}) {
  const p = def.presentation ?? DEFAULT_PRESENTATION;
  if (def.kind === 'survey360') {
    return (
      <div className="configure-panel">
        <p className="configure-muted">
          360 feedback uses a fixed flow: select peers, read instructions, then rate behaviors one at a time on
          the effectiveness scale.
        </p>
      </div>
    );
  }
  return (
    <div className="configure-panel configure-form-grid configure-experience">
      <fieldset className="configure-span-2">
        <legend>Statement layout</legend>
        <label className="configure-radio">
          <input
            type="radio"
            name="presentation-mode"
            checked={p.mode === 'onePerScreen'}
            onChange={() => {
              onChange({ ...p, mode: 'onePerScreen' });
              onSave();
            }}
          />
          One statement per screen
        </label>
        <label className="configure-radio">
          <input
            type="radio"
            name="presentation-mode"
            checked={p.mode === 'twoPerScreen'}
            onChange={() => {
              onChange({ ...p, mode: 'twoPerScreen' });
              onSave();
            }}
          />
          Two statements per screen
        </label>
        <label className="configure-radio">
          <input
            type="radio"
            name="presentation-mode"
            checked={p.mode === 'singlePage'}
            onChange={() => {
              onChange({ ...p, mode: 'singlePage' });
              onSave();
            }}
          />
          All statements on one page
        </label>
      </fieldset>
      <label className="configure-checkbox configure-span-2">
        <input
          type="checkbox"
          checked={p.showProgressBar}
          onChange={(e) => {
            onChange({ ...p, showProgressBar: e.target.checked });
            onSave();
          }}
        />
        Show progress bar
      </label>
      {def.kind === 'behavioral' ? (
        <label className="configure-checkbox configure-span-2">
          <input
            type="checkbox"
            checked={p.behavioralShowSectionHeaders}
            onChange={(e) => {
              onChange({ ...p, behavioralShowSectionHeaders: e.target.checked });
              onSave();
            }}
          />
          Show section headers on each scenario
        </label>
      ) : null}
    </div>
  );
}

function ReviewStep({
  def,
  onPublish,
  isPublished,
}: {
  def: AssessmentDefinition;
  onPublish: () => void;
  isPublished: boolean;
}) {
  const err = canPublish(def);
  return (
    <div className="configure-panel">
      <dl className="configure-review">
        <dt>Title</dt>
        <dd>{def.title}</dd>
        <dt>Type</dt>
        <dd>{kindLabel(def.kind)}</dd>
        <dt>Instructions</dt>
        <dd>{def.instructions.filter((s) => s.trim()).length} lines</dd>
        <dt>Status</dt>
        <dd>{def.publishStatus}</dd>
      </dl>
      {isPublished ? (
        <p className="configure-banner configure-banner--ok">This assessment is published.</p>
      ) : (
        <button type="button" className="dash-btn-pill dash-pill--yellow" disabled={Boolean(err)} onClick={onPublish}>
          Publish assessment
        </button>
      )}
      {err && !isPublished ? <p className="configure-muted">{err}</p> : null}
    </div>
  );
}
