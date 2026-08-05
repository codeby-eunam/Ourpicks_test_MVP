import { supabase } from './supabaseClient';
import { SurveyAnswers, TestResultInsert } from './types';

/**
 * 토너먼트 결승이 끝나는 즉시 정량 데이터를 test_results 테이블에 저장한다.
 * 반환된 id는 이후 퀵 설문 제출 시 update 대상 row를 특정하는 데 사용한다.
 * insert 자체가 실패해도(예: 오프라인, RLS 미설정) 결과 화면 진행은 막지 않고 null을 반환한다.
 */
export async function createTestResult(
  payload: TestResultInsert
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        region: payload.region,
        interaction_mode: payload.interaction_mode,
        selected_restaurant_id: payload.selected_restaurant_id,
        duration_seconds: payload.duration_seconds,
        is_completed: payload.is_completed,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch (err) {
    console.error('[testResults] 결과 저장 실패:', err);
    return null;
  }
}

/**
 * 퀵 설문 응답을 기존 test_results row에 update 한다.
 */
export async function submitSurvey(
  resultId: string,
  answers: SurveyAnswers
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('test_results')
      .update({
        survey_q1_help: answers.survey_q1_help,
        survey_q2_painpoint: answers.survey_q2_painpoint,
        survey_q3_coupon: answers.survey_q3_coupon,
      })
      .eq('id', resultId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[testResults] 설문 저장 실패:', err);
    return false;
  }
}
