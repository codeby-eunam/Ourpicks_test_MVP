export type Region = 'yeongnam' | 'seattle';
export type InteractionMode = 'select' | 'swipe';

export interface Restaurant {
  id: string;
  region: Region;
  name: string;
  category: string;
  image_url: string;
  rating: number;
}

export interface TestResultInsert {
  region: Region;
  interaction_mode: InteractionMode;
  selected_restaurant_id: string;
  duration_seconds: number;
  is_completed: boolean;
}

export interface SurveyAnswers {
  survey_frequency: string | null;
  survey_decision_method: string | null;
  survey_pain_point: string | null;
  survey_satisfaction: string;
  survey_nps_score: number;
  survey_improvement_feedback: string;
}

/** app/test 플로우의 화면 단계 */
export type FlowStep = 'loading' | 'intro' | 'browse' | 'tournament' | 'result';
