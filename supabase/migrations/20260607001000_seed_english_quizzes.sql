-- English translations of the five quizzes from testare_manuala_ro.docx.
-- Safe to run repeatedly: questions/options for these quizzes are replaced.

create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  passing_score integer not null default 70 check (passing_score between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  explanation text,
  selection_mode text not null default 'single'
    check (selection_mode in ('single', 'multiple')),
  order_index integer not null check (order_index > 0),
  created_at timestamptz not null default now(),
  unique (quiz_id, order_index)
);

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  order_index integer not null check (order_index > 0),
  unique (question_id, order_index)
);

alter table public.quiz_questions
add column if not exists selection_mode text not null default 'single'
check (selection_mode in ('single', 'multiple'));

do $$
declare
  quiz_record jsonb;
  question_record jsonb;
  option_record jsonb;
  question_id uuid;
  quiz_data jsonb := $quiz_json$
[
  {
    "id": "quiz-1",
    "title": "Testing Fundamentals",
    "passing_score": 70,
    "questions": [
      {
        "prompt": "What is the correct definition of software testing?",
        "mode": "single",
        "explanation": "Software testing verifies that an application behaves according to expectations and identifies deviations or defects. It does not include writing source code or deploying the application.",
        "options": [
          {"label": "The process of writing the application's source code", "correct": false},
          {"label": "The process of verifying that the application works as expected and finding defects", "correct": true},
          {"label": "The process of installing the application on production servers", "correct": false},
          {"label": "The process of documenting business requirements", "correct": false}
        ]
      },
      {
        "prompt": "What does the first testing principle, 'Testing shows the presence of defects,' mean?",
        "mode": "single",
        "explanation": "Testing can show that defects exist, but it cannot prove that no defects remain. Undiscovered defects may still exist after extensive testing.",
        "options": [
          {"label": "If no defects were found, the application is perfect", "correct": false},
          {"label": "Testing can prove that no defects exist", "correct": false},
          {"label": "Testing reduces risk but does not guarantee the absence of defects", "correct": true},
          {"label": "All defects can be found through exhaustive testing", "correct": false}
        ]
      },
      {
        "prompt": "Why is exhaustive testing impossible?",
        "mode": "single",
        "explanation": "Even one text field can accept millions of character combinations. Across every field and scenario, the number of possible tests becomes enormous, so testers select the most important cases.",
        "options": [
          {"label": "Testers do not have enough time", "correct": false},
          {"label": "The number of possible data combinations and scenarios is practically infinite", "correct": true},
          {"label": "Applications are too technically complex", "correct": false},
          {"label": "Clients do not permit complete testing", "correct": false}
        ]
      },
      {
        "prompt": "What does the pesticide paradox mean in software testing?",
        "mode": "single",
        "explanation": "Running the same tests repeatedly eventually stops revealing new defects. Test cases and test data must be updated and diversified.",
        "options": [
          {"label": "Tests consume resources in the same way pesticides consume crops", "correct": false},
          {"label": "Running the same tests repeatedly stops finding new defects", "correct": true},
          {"label": "Defects multiply when they are not treated quickly", "correct": false},
          {"label": "Excessive testing can destroy product quality", "correct": false}
        ]
      },
      {
        "prompt": "Which option is NOT an advantage of manual testing over automated testing?",
        "mode": "single",
        "explanation": "Automated testing is better suited to repetitive regression testing because scripts run quickly and consistently. Manual testing is stronger for UX, exploratory work, and low initial cost.",
        "options": [
          {"label": "It can identify user-experience problems", "correct": false},
          {"label": "It is better suited to exploratory testing", "correct": false},
          {"label": "It is faster for repetitive regression testing", "correct": true},
          {"label": "It has a lower initial cost", "correct": false}
        ]
      },
      {
        "prompt": "What does the defect clustering principle mean?",
        "mode": "single",
        "explanation": "The Pareto principle often applies to testing: a small portion of modules or features contains most of the defects.",
        "options": [
          {"label": "Defects always appear in pairs", "correct": false},
          {"label": "Approximately 80% of defects are found in 20% of the code", "correct": true},
          {"label": "Defects must be grouped before they are reported", "correct": false},
          {"label": "Testers must work in teams of at least three people", "correct": false}
        ]
      }
    ]
  },
  {
    "id": "quiz-2",
    "title": "Types of Testing",
    "passing_score": 70,
    "questions": [
      {
        "prompt": "Which testing level verifies the entire application as a complete system?",
        "mode": "single",
        "explanation": "System testing verifies the complete application end to end. Unit testing covers individual functions, integration testing covers connected modules, and acceptance testing is performed by the client or users.",
        "options": [
          {"label": "Unit Testing", "correct": false},
          {"label": "Integration Testing", "correct": false},
          {"label": "System Testing", "correct": true},
          {"label": "Acceptance Testing", "correct": false}
        ]
      },
      {
        "prompt": "Which type of testing is performed by the client before accepting the product?",
        "mode": "single",
        "explanation": "User Acceptance Testing allows clients or end users to verify that the product satisfies business requirements before release.",
        "options": [
          {"label": "Smoke Testing", "correct": false},
          {"label": "Unit Testing", "correct": false},
          {"label": "Regression Testing", "correct": false},
          {"label": "User Acceptance Testing (UAT)", "correct": true}
        ]
      },
      {
        "prompt": "Select all non-functional testing types.",
        "mode": "multiple",
        "explanation": "Non-functional testing verifies how the application works, including performance, security, compatibility, and usability. Functional testing verifies what the application does.",
        "options": [
          {"label": "Performance testing", "correct": true},
          {"label": "Functional testing", "correct": false},
          {"label": "Security testing", "correct": true},
          {"label": "Compatibility testing", "correct": true},
          {"label": "Regression testing", "correct": false}
        ]
      },
      {
        "prompt": "What is Black Box testing?",
        "mode": "single",
        "explanation": "In Black Box testing, the tester does not know the internal code. The tester interacts with the product from the user's perspective and verifies outputs.",
        "options": [
          {"label": "Testing in darkness to simulate extreme conditions", "correct": false},
          {"label": "Testing without knowledge of the internal code, from the user's perspective", "correct": true},
          {"label": "Testing hidden application modules", "correct": false},
          {"label": "Testing the application's databases", "correct": false}
        ]
      },
      {
        "prompt": "A developer fixed a defect in the payment module. Which testing type should be performed immediately afterward?",
        "mode": "single",
        "explanation": "Regression testing is performed after a change to confirm that the rest of the application was not negatively affected.",
        "options": [
          {"label": "Unit Testing", "correct": false},
          {"label": "Smoke Testing", "correct": false},
          {"label": "Regression Testing", "correct": true},
          {"label": "Performance Testing", "correct": false}
        ]
      },
      {
        "prompt": "What is the main purpose of Smoke Testing?",
        "mode": "single",
        "explanation": "Smoke testing is a quick stability check. If the basic functions fail, there is no reason to continue with detailed testing.",
        "options": [
          {"label": "To test every application function in detail", "correct": false},
          {"label": "To quickly verify that the build is stable enough for deeper testing", "correct": true},
          {"label": "To verify application performance under maximum load", "correct": false},
          {"label": "To test compatibility across every browser", "correct": false}
        ]
      }
    ]
  },
  {
    "id": "quiz-3",
    "title": "Situation Analysis: Find the Defect",
    "passing_score": 70,
    "questions": [
      {
        "prompt": "A tester submits a registration form with valid data. The account is created, but no confirmation email arrives. How should this be classified?",
        "mode": "single",
        "explanation": "The confirmation email is a specified feature, so its absence is a functional defect. It has Major severity because it affects an important registration flow without completely blocking the application.",
        "options": [
          {"label": "It is not a defect because the email may be in spam", "correct": false},
          {"label": "It is a functional defect with Major severity", "correct": true},
          {"label": "It is a non-functional performance defect", "correct": false},
          {"label": "It is a compatibility defect", "correct": false}
        ]
      },
      {
        "prompt": "A tester runs the same 50 tests for three months and finds no new defects. What should the tester do?",
        "mode": "single",
        "explanation": "This is a classic example of the pesticide paradox. The tester should add new tests, change test data, and explore previously untested areas.",
        "options": [
          {"label": "Continue because the absence of defects proves the application is perfect", "correct": false},
          {"label": "Report that testing is complete and no defects remain", "correct": false},
          {"label": "Update and diversify the test set", "correct": true},
          {"label": "Reduce the number of tests to 25 for efficiency", "correct": false}
        ]
      },
      {
        "prompt": "A banking application has a minor cosmetic defect and another defect that makes pages take 15 seconds to load. Which should be fixed first?",
        "mode": "single",
        "explanation": "The performance defect significantly affects usability and has a higher severity and priority, especially in a banking application.",
        "options": [
          {"label": "The cosmetic defect because it is easier to fix", "correct": false},
          {"label": "Both at exactly the same time", "correct": false},
          {"label": "The performance defect because it affects the user experience", "correct": true},
          {"label": "Neither; both should wait for the next version", "correct": false}
        ]
      },
      {
        "prompt": "A tester discovers that a defect marked Fixed still exists. Which status should the defect receive?",
        "mode": "single",
        "explanation": "When a defect marked Fixed is still reproducible during retesting, it becomes Reopened and returns to the development workflow.",
        "options": [
          {"label": "New", "correct": false},
          {"label": "Reopened", "correct": true},
          {"label": "Duplicate", "correct": false},
          {"label": "Deferred", "correct": false}
        ]
      },
      {
        "prompt": "Select all situations that represent a defect.",
        "mode": "multiple",
        "explanation": "A broken Buy button, missing numeric validation, and a logo positioned against the specification are defects. A two-second load time meets the three-second requirement, and an error message during server downtime may be expected behavior.",
        "options": [
          {"label": "The Buy button does nothing when clicked", "correct": true},
          {"label": "The page loads in two seconds when the requirement is a maximum of three seconds", "correct": false},
          {"label": "The application displays an error message instead of data when the server is down", "correct": false},
          {"label": "A numeric field accepts letters without displaying an error", "correct": true},
          {"label": "The company logo appears on the left although the specification requires it to be centered", "correct": true}
        ]
      },
      {
        "prompt": "A financial management product displays 'Managment' instead of 'Management' in the main-page title. How should this defect be classified?",
        "mode": "single",
        "explanation": "The typo does not affect functionality, so its severity is Trivial. Its priority is High because it is visible to every user and damages the credibility of a financial product.",
        "options": [
          {"label": "Severity: Blocker, Priority: High", "correct": false},
          {"label": "Severity: Trivial, Priority: High", "correct": true},
          {"label": "Severity: Critical, Priority: Low", "correct": false},
          {"label": "Severity: Minor, Priority: Low", "correct": false}
        ]
      }
    ]
  },
  {
    "id": "quiz-4",
    "title": "Test Design",
    "passing_score": 70,
    "questions": [
      {
        "prompt": "A numeric field accepts values from 1 through 100. Using Equivalence Partitioning, which classes are correct?",
        "mode": "single",
        "explanation": "Equivalence Partitioning creates one valid class from 1 through 100 and two invalid classes: values below 1 and values above 100.",
        "options": [
          {"label": "One class: 1 through 100", "correct": false},
          {"label": "Two classes: below 1 and 1 through 100", "correct": false},
          {"label": "Three classes: below 1 invalid, 1 through 100 valid, and above 100 invalid", "correct": true},
          {"label": "Four classes: negative, zero, 1 through 100, and above 100", "correct": false}
        ]
      },
      {
        "prompt": "Using Boundary Value Analysis for an age field that accepts 18 through 65, select all values that should be tested from the options below.",
        "mode": "multiple",
        "explanation": "Boundary Value Analysis covers the limits and values immediately beside them. From the available options, 17, 18, 64, 65, and 66 are boundary values. The middle value 35 is not.",
        "options": [
          {"label": "17", "correct": true},
          {"label": "18", "correct": true},
          {"label": "35", "correct": false},
          {"label": "64", "correct": true},
          {"label": "65", "correct": true},
          {"label": "66", "correct": true}
        ]
      },
      {
        "prompt": "When is the Decision Table technique most useful?",
        "mode": "single",
        "explanation": "Decision tables are ideal when business logic depends on combinations of conditions, such as discounts, access rules, and tax calculations.",
        "options": [
          {"label": "When testing application performance", "correct": false},
          {"label": "When multiple combinations of conditions lead to different outcomes", "correct": true},
          {"label": "When testing compatibility across browsers", "correct": false},
          {"label": "When testing numeric field boundary values", "correct": false}
        ]
      },
      {
        "prompt": "Which test-design technique relies entirely on the tester's experience and creativity?",
        "mode": "single",
        "explanation": "Error Guessing has no formal algorithm. It relies on the tester's experience and knowledge of where defects commonly occur.",
        "options": [
          {"label": "Equivalence Partitioning", "correct": false},
          {"label": "Boundary Value Analysis", "correct": false},
          {"label": "Error Guessing", "correct": true},
          {"label": "State Transition Testing", "correct": false}
        ]
      },
      {
        "prompt": "State Transition Testing is suitable for which situation?",
        "mode": "single",
        "explanation": "State Transition Testing maps distinct system states and the actions that move the system between them.",
        "options": [
          {"label": "Numeric fields with limits", "correct": false},
          {"label": "Systems that move through distinct states based on user actions", "correct": true},
          {"label": "Web pages containing many forms", "correct": false},
          {"label": "Database testing", "correct": false}
        ]
      },
      {
        "prompt": "A login form accepts passwords between 8 and 20 characters long. Which values should be tested using Boundary Value Analysis?",
        "mode": "single",
        "explanation": "Classic Boundary Value Analysis covers the value below the lower limit, the lower limit, the upper limit, and the value above the upper limit: 7, 8, 20, and 21.",
        "options": [
          {"label": "7, 8, 20, 21", "correct": true},
          {"label": "8, 20", "correct": false},
          {"label": "1, 10, 20", "correct": false},
          {"label": "8, 9, 19, 20", "correct": false}
        ]
      }
    ]
  },
  {
    "id": "quiz-5",
    "title": "Bug Reports",
    "passing_score": 70,
    "questions": [
      {
        "prompt": "Which bug title is written best?",
        "mode": "single",
        "explanation": "A strong bug title is specific and descriptive. It identifies the affected component, the action, and relevant context such as the browser.",
        "options": [
          {"label": "Bug at login", "correct": false},
          {"label": "Does not work", "correct": false},
          {"label": "Login button does not respond when clicked on the sign-in page in Chrome 120", "correct": true},
          {"label": "SERIOUS ERROR!!! The application breaks!!!", "correct": false}
        ]
      },
      {
        "prompt": "Select all essential information that should be included in a bug report.",
        "mode": "multiple",
        "explanation": "Essential bug-report information includes a clear title, reproduction steps, expected result, actual result, and test environment. The tracking system usually records the tester automatically.",
        "options": [
          {"label": "A clear and concise title", "correct": true},
          {"label": "Steps to reproduce", "correct": true},
          {"label": "Expected result", "correct": true},
          {"label": "Actual result", "correct": true},
          {"label": "The name of the tester who found the defect", "correct": false},
          {"label": "The test environment, including browser, operating system, and version", "correct": true}
        ]
      },
      {
        "prompt": "What is the difference between severity and priority?",
        "mode": "single",
        "explanation": "Severity describes the technical impact of a defect. Priority describes how urgently the defect should be fixed from a business perspective.",
        "options": [
          {"label": "There is no difference; they are synonyms", "correct": false},
          {"label": "Severity measures technical impact, while priority measures how urgently the defect should be fixed", "correct": true},
          {"label": "Severity is set by the client, while priority is set by the tester", "correct": false},
          {"label": "Severity refers to frontend issues, while priority refers to backend issues", "correct": false}
        ]
      },
      {
        "prompt": "A defect has been marked Fixed. What is the correct next step in its life cycle?",
        "mode": "single",
        "explanation": "After a defect is marked Fixed, a tester retests it. If the fix works, the defect is Closed; otherwise, it is Reopened.",
        "options": [
          {"label": "The defect closes automatically", "correct": false},
          {"label": "A tester verifies the fix and marks the defect Closed or Reopened", "correct": true},
          {"label": "The project manager decides whether the defect is resolved", "correct": false},
          {"label": "The client tests and confirms the resolution", "correct": false}
        ]
      },
      {
        "prompt": "What does the Deferred status mean for a defect?",
        "mode": "single",
        "explanation": "Deferred means that the defect is valid but will be fixed in a future sprint or release, often because of lower priority, limited resources, or dependencies.",
        "options": [
          {"label": "The defect was rejected as invalid", "correct": false},
          {"label": "The defect will be fixed in a future release rather than the current sprint", "correct": true},
          {"label": "The defect duplicates another reported defect", "correct": false},
          {"label": "The defect was transferred to another team", "correct": false}
        ]
      },
      {
        "prompt": "What should the Steps to Reproduce section of a bug report contain?",
        "mode": "single",
        "explanation": "Steps to Reproduce should be a clear, numbered list of exact actions that allows anyone to reproduce the defect.",
        "options": [
          {"label": "A general description of the problem", "correct": false},
          {"label": "The tester's opinion about the cause", "correct": false},
          {"label": "A numbered list of the exact actions that cause the defect", "correct": true},
          {"label": "The application source code containing the defect", "correct": false}
        ]
      },
      {
        "prompt": "Which bug report is written best?",
        "mode": "single",
        "explanation": "The strongest report specifies the test data, actual behavior, expected behavior, and complete environment, making it reproducible and actionable.",
        "options": [
          {"label": "The bug sometimes appears at login when incorrect data is entered. I do not know exactly when.", "correct": false},
          {"label": "When a valid email and incorrect password are entered, the application displays 'Internal Error' (500) instead of 'Incorrect password'. Reproduced consistently in Chrome 120 on Windows 11, build v3.2.1.", "correct": true},
          {"label": "I found a big bug! The application breaks! Fix URGENTLY!!!", "correct": false},
          {"label": "Login does not work.", "correct": false}
        ]
      }
    ]
  }
]
$quiz_json$::jsonb;
begin
  for quiz_record in select value from jsonb_array_elements(quiz_data)
  loop
    insert into public.quizzes (id, title, passing_score, is_published)
    values (
      quiz_record ->> 'id',
      quiz_record ->> 'title',
      (quiz_record ->> 'passing_score')::integer,
      true
    )
    on conflict (id) do update
    set
      title = excluded.title,
      passing_score = excluded.passing_score,
      is_published = true;

    delete from public.quiz_questions
    where quiz_id = quiz_record ->> 'id';

    for question_record in
      select value
      from jsonb_array_elements(quiz_record -> 'questions')
      with ordinality as questions(value, position)
      order by position
    loop
      insert into public.quiz_questions (
        quiz_id,
        prompt,
        explanation,
        selection_mode,
        order_index
      )
      values (
        quiz_record ->> 'id',
        question_record ->> 'prompt',
        question_record ->> 'explanation',
        question_record ->> 'mode',
        (
          select count(*) + 1
          from public.quiz_questions
          where quiz_id = quiz_record ->> 'id'
        )
      )
      returning id into question_id;

      insert into public.quiz_options (
        question_id,
        label,
        is_correct,
        order_index
      )
      select
        question_id,
        option.value ->> 'label',
        (option.value ->> 'correct')::boolean,
        option.position::integer
      from jsonb_array_elements(question_record -> 'options')
      with ordinality as option(value, position);
    end loop;
  end loop;
end;
$$;

-- Tell Supabase PostgREST to immediately discover the newly created tables.
notify pgrst, 'reload schema';
