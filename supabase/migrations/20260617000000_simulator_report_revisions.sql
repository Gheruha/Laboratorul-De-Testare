-- Allows the evaluator to store reports that identify the right defect
-- but need clearer QA wording before they can count as solved.

alter table public.ai_simulator_submissions
drop constraint if exists ai_simulator_submissions_verdict_check;

alter table public.ai_simulator_submissions
add constraint ai_simulator_submissions_verdict_check
check (verdict in ('correct', 'needs_revision', 'incorrect', 'out_of_scope'));

notify pgrst, 'reload schema';
