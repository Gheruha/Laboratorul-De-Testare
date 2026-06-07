# Lesson Database Notes

The current `lessons` table is a strong base. It already has stable slugs,
publication state, ordering, language fields, quiz placeholders, and flexible
JSON content.

## Add now

- Add `lesson_modules` and connect each lesson with `lessons.module_id`.
  This makes sidebar folders data-driven. The first module is seeded as
  `Manual Testing`.
- Enable row-level security with public read policies for published lessons and
  modules. This is required when lessons are available without authentication.
- Validate that `content` is an object containing a `blocks` array.
- Replace the loose `quiz_id` text relationship with a foreign key to a
  `quizzes` table.
- Store quiz questions and options in normalized tables.

These additions are included in
`supabase/migrations/20260607000000_lesson_structure.sql`.

## Add after authentication

Add a `user_lesson_progress` table containing:

- `user_id`
- `lesson_id`
- `status` (`not_started`, `in_progress`, `completed`)
- `last_block_index`
- `completed_at`
- `updated_at`

Add a `quiz_attempts` table containing the user, quiz, score, answers, and
completion timestamp. Protect both tables with user-owned RLS policies.

## Content recommendation

Keep the existing JSON block format, but validate it in the application before
rendering. Supported blocks currently are `heading`, `paragraph`, `callout`,
`list`, `table`, and `code`.
