-- Align lesson quiz buttons with the module topics from the source document.
-- Quiz 3 is a scenario-analysis quiz for Modules 1-2, not a Module 3 quiz.
-- Module 5 did not have a dedicated quiz in the source file, so this adds one.

insert into public.quizzes (id, title, passing_score, is_published)
values ('quiz-6', 'Test Cases and Checklists', 70, true)
on conflict (id) do update
set
  title = excluded.title,
  passing_score = excluded.passing_score,
  is_published = true;

update public.quizzes
set is_published = false
where id = 'quiz-3';

delete from public.quiz_questions
where quiz_id = 'quiz-6';

do $$
declare
  question_id uuid;
begin
  insert into public.quiz_questions (
    quiz_id,
    prompt,
    explanation,
    selection_mode,
    order_index
  )
  values (
    'quiz-6',
    'What is the main purpose of a test case?',
    'A test case is a structured description of how to verify a specific functionality, including inputs, steps, and the expected result.',
    'single',
    1
  )
  returning id into question_id;

  insert into public.quiz_options (question_id, label, is_correct, order_index)
  values
    (question_id, 'To describe exactly how to test a specific functionality', true, 1),
    (question_id, 'To replace the bug report after a defect is found', false, 2),
    (question_id, 'To document the application source code', false, 3),
    (question_id, 'To decide the project budget', false, 4);

  insert into public.quiz_questions (
    quiz_id,
    prompt,
    explanation,
    selection_mode,
    order_index
  )
  values (
    'quiz-6',
    'Select all elements that normally belong in a well-written test case.',
    'A test case normally includes preconditions, test data, execution steps, expected result, actual result, and status.',
    'multiple',
    2
  )
  returning id into question_id;

  insert into public.quiz_options (question_id, label, is_correct, order_index)
  values
    (question_id, 'Preconditions', true, 1),
    (question_id, 'Test data', true, 2),
    (question_id, 'Steps to execute', true, 3),
    (question_id, 'Expected result', true, 4),
    (question_id, 'Actual result and status', true, 5),
    (question_id, 'Developer salary', false, 6);

  insert into public.quiz_questions (
    quiz_id,
    prompt,
    explanation,
    selection_mode,
    order_index
  )
  values (
    'quiz-6',
    'What is a positive test case?',
    'A positive test case verifies that the feature works correctly when valid data and normal user behavior are used.',
    'single',
    3
  )
  returning id into question_id;

  insert into public.quiz_options (question_id, label, is_correct, order_index)
  values
    (question_id, 'A test that uses valid data and follows the expected flow', true, 1),
    (question_id, 'A test that intentionally uses invalid data', false, 2),
    (question_id, 'A test that verifies only the application design colors', false, 3),
    (question_id, 'A test that is always automated', false, 4);

  insert into public.quiz_questions (
    quiz_id,
    prompt,
    explanation,
    selection_mode,
    order_index
  )
  values (
    'quiz-6',
    'What is a negative test case?',
    'A negative test case checks how the application behaves when the user enters invalid data or performs an incorrect action.',
    'single',
    4
  )
  returning id into question_id;

  insert into public.quiz_options (question_id, label, is_correct, order_index)
  values
    (question_id, 'A test that verifies invalid input or incorrect user actions are handled properly', true, 1),
    (question_id, 'A test that must always fail', false, 2),
    (question_id, 'A test written after the project is released', false, 3),
    (question_id, 'A test that checks only successful user behavior', false, 4);

  insert into public.quiz_questions (
    quiz_id,
    prompt,
    explanation,
    selection_mode,
    order_index
  )
  values (
    'quiz-6',
    'When is a checklist more suitable than a detailed test case?',
    'A checklist is useful for quick verification or simple functionality where a detailed step-by-step test case would be unnecessary.',
    'single',
    5
  )
  returning id into question_id;

  insert into public.quiz_options (question_id, label, is_correct, order_index)
  values
    (question_id, 'For quick verification of simple or familiar functionality', true, 1),
    (question_id, 'When exact detailed execution steps are required for every tester', false, 2),
    (question_id, 'When reporting a confirmed defect to developers', false, 3),
    (question_id, 'When testing must include every possible data combination', false, 4);

  insert into public.quiz_questions (
    quiz_id,
    prompt,
    explanation,
    selection_mode,
    order_index
  )
  values (
    'quiz-6',
    'A login page checklist includes “Email field is editable,” “Password is masked,” and “Forgot password link opens the reset page.” What kind of artifact is this?',
    'This is a checklist because it lists items to verify without detailed execution steps and expected results for each item.',
    'single',
    6
  )
  returning id into question_id;

  insert into public.quiz_options (question_id, label, is_correct, order_index)
  values
    (question_id, 'A checklist', true, 1),
    (question_id, 'A bug report', false, 2),
    (question_id, 'A defect life-cycle status', false, 3),
    (question_id, 'A decision table', false, 4);
end;
$$;

update public.lessons
set quiz_id = case slug
  when 'module-1-introduction-to-testing' then 'quiz-1'
  when 'module-2-types-of-testing' then 'quiz-2'
  when 'module-3-test-design-basic-techniques' then 'quiz-4'
  when 'module-4-bug-reports-and-bug-life-cycle' then 'quiz-5'
  when 'module-5-test-cases-and-checklists' then 'quiz-6'
  else quiz_id
end
where slug in (
  'module-1-introduction-to-testing',
  'module-2-types-of-testing',
  'module-3-test-design-basic-techniques',
  'module-4-bug-reports-and-bug-life-cycle',
  'module-5-test-cases-and-checklists'
);

notify pgrst, 'reload schema';
