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
  survey_q1_help: boolean;
  survey_q2_painpoint: string;
  survey_q3_coupon: boolean;
}

/** app/test 플로우의 화면 단계 */
export type FlowStep = 'loading' | 'browse' | 'tournament' | 'result';
