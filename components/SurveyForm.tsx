'use client';

import { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { submitSurvey } from '@/lib/testResults';
import { Region } from '@/lib/types';
import { getCopy } from '@/lib/copy';

interface SurveyFormProps {
  region: Region;
  resultId: string | null;
}

/** Screen3 하단 - 3초 퀵 설문 폼 */
export default function SurveyForm({ region, resultId }: SurveyFormProps) {
  const t = getCopy(region);
  const [q1, setQ1] = useState<boolean | null>(null);
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = q1 !== null && q3 !== null && !submitting;

  async function handleSubmit() {
    if (q1 === null || q3 === null) return;
    setSubmitting(true);
    if (resultId) {
      await submitSurvey(resultId, {
        survey_q1_help: q1,
        survey_q2_painpoint: q2.trim(),
        survey_q3_coupon: q3,
      });
    }
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-pop-in flex flex-col items-center gap-2 rounded-2xl border border-brand/30 bg-brand/5 p-6 text-center">
        <PartyPopper className="text-brand" size={28} />
        <p className="font-semibold text-ink">{t.survey.thanksTitle}</p>
        <p className="text-sm text-ink-muted">{t.survey.thanksSubtitle}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <p className="text-sm font-semibold text-ink">{t.survey.title}</p>

      <div>
        <p className="mb-2 text-sm text-ink">Q1. {t.survey.q1}</p>
        <div className="flex gap-2">
          <ToggleButton label={t.survey.yes} active={q1 === true} onClick={() => setQ1(true)} />
          <ToggleButton label={t.survey.no} active={q1 === false} onClick={() => setQ1(false)} />
        </div>
      </div>

      <div>
        <label htmlFor="q2" className="mb-2 block text-sm text-ink">
          Q2. {t.survey.q2Label}
        </label>
        <input
          id="q2"
          type="text"
          value={q2}
          onChange={(e) => setQ2(e.target.value)}
          placeholder={t.survey.q2Placeholder}
          maxLength={80}
          className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand"
        />
      </div>

      <div>
        <p className="mb-2 text-sm text-ink">Q3. {t.survey.q3}</p>
        <div className="flex gap-2">
          <ToggleButton label={t.survey.yes} active={q3 === true} onClick={() => setQ3(true)} />
          <ToggleButton label={t.survey.no} active={q3 === false} onClick={() => setQ3(false)} />
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="mt-1 w-full rounded-2xl bg-brand py-3 text-center font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {submitting ? t.survey.submitting : t.survey.submit}
      </button>
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
        active
          ? 'border-brand bg-brand text-white'
          : 'border-slate-200 bg-white text-ink-muted'
      }`}
    >
      {label}
    </button>
  );
}
