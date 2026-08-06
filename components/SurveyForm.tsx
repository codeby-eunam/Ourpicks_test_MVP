'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { PartyPopper } from 'lucide-react';
import { submitSurvey } from '@/lib/testResults';
import { Region } from '@/lib/types';
import { getCopy } from '@/lib/copy';

interface SurveyFormProps { region: Region; resultId: string | null; }
const PROFILE_COOKIE = 'picks_survey_profile_completed';

export default function SurveyForm({ region, resultId }: SurveyFormProps) {
  const t = getCopy(region);
  const [showProfile, setShowProfile] = useState(false);
  const [cookieChecked, setCookieChecked] = useState(false);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [decisionMethod, setDecisionMethod] = useState<string | null>(null);
  const [painPoint, setPainPoint] = useState<string | null>(null);
  const [satisfaction, setSatisfaction] = useState<string | null>(null);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const completed = document.cookie.split('; ').some((item) => item.startsWith(`${PROFILE_COOKIE}=`));
      setShowProfile(!completed);
    } catch {
      setShowProfile(true);
    } finally {
      setCookieChecked(true);
    }
  }, []);

  const profileComplete = !showProfile || (frequency !== null && decisionMethod !== null && painPoint !== null);
  const canSubmit = cookieChecked && profileComplete && satisfaction !== null && npsScore !== null && !submitting;

  async function handleSubmit() {
    if (!canSubmit || satisfaction === null || npsScore === null) return;
    setSubmitting(true);
    if (resultId) {
      await submitSurvey(resultId, {
        survey_frequency: frequency,
        survey_decision_method: decisionMethod,
        survey_pain_point: painPoint,
        survey_satisfaction: satisfaction,
        survey_nps_score: npsScore,
        survey_improvement_feedback: npsScore <= 6 ? feedback.trim() : '',
      });
    }
    if (showProfile) {
      try {
        document.cookie = `${PROFILE_COOKIE}=1; Max-Age=31536000; Path=/; SameSite=Lax`;
      } catch {
        // 쿠키 저장 실패는 설문 제출을 막지 않는다.
      }
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
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <p className="font-semibold text-ink">{t.survey.title}</p>
      {cookieChecked && showProfile && (
        <>
          <Question number={1} label={t.survey.q1}><ChoiceGroup options={t.survey.q1Options} value={frequency} onChange={setFrequency} /></Question>
          <Question number={2} label={t.survey.q2}><ChoiceGroup options={t.survey.q2Options} value={decisionMethod} onChange={setDecisionMethod} /></Question>
          <Question number={3} label={t.survey.q3}><ChoiceGroup options={t.survey.q3Options} value={painPoint} onChange={setPainPoint} /></Question>
        </>
      )}
      <Question number={4} label={t.survey.q4}><ChoiceGroup options={t.survey.q4Options} value={satisfaction} onChange={setSatisfaction} /></Question>
      <Question number={5} label={t.survey.q5}>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
          {Array.from({ length: 11 }, (_, score) => <ToggleButton key={score} label={String(score)} active={npsScore === score} onClick={() => setNpsScore(score)} />)}
        </div>
        <div className="mt-1 flex justify-between text-xs text-ink-muted"><span>{t.survey.npsLow}</span><span>{t.survey.npsHigh}</span></div>
      </Question>
      {npsScore !== null && npsScore <= 6 && (
        <div className="animate-fade-in">
          <label htmlFor="improvement-feedback" className="mb-2 block text-sm text-ink">{t.survey.improvementLabel}</label>
          <input id="improvement-feedback" type="text" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder={t.survey.improvementPlaceholder} maxLength={200} className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand" />
        </div>
      )}
      <button type="button" disabled={!canSubmit} onClick={handleSubmit} className="mt-1 w-full rounded-2xl bg-brand py-3 text-center font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
        {submitting ? t.survey.submitting : t.survey.submit}
      </button>
    </div>
  );
}

function Question({ number, label, children }: { number: number; label: string; children: ReactNode }) {
  return <div><p className="mb-2 text-sm text-ink">Q{number}. {label}</p>{children}</div>;
}

function ChoiceGroup({ options, value, onChange }: { options: readonly string[]; value: string | null; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2">{options.map((option) => <ToggleButton key={option} label={option} active={value === option} onClick={() => onChange(option)} />)}</div>;
}

function ToggleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`min-w-0 flex-1 rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${active ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-ink-muted'}`}>{label}</button>;
}
