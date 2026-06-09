export type SimulatorVerdict = 'correct' | 'incorrect' | 'out_of_scope';

export interface SimulatorTask {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface SimulatorEvaluationRequest {
  scenarioId: string;
  sessionId: string;
  report: string;
}

export interface SimulatorEvaluationResponse {
  verdict: SimulatorVerdict;
  feedback: string;
  matchedDefectId: string | null;
}
