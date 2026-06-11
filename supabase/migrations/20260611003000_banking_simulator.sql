-- Adds the third testing simulator: Northstar Online Banking.

insert into public.ai_simulator_scenarios (
  id, title, instructions, is_published, max_points
)
values (
  'banking-basic',
  'Northstar Online Banking Defect Hunt',
  'Inspect the online banking portal and submit one observed defect at a time.',
  true,
  100
)
on conflict (id) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  is_published = true,
  max_points = excluded.max_points;

insert into public.ai_simulator_tasks (
  id, scenario_id, title, description, order_index
)
values
  ('banking-balance-total', 'banking-basic', 'Account balance consistency', 'Compare the displayed total balance with the individual account balances.', 1),
  ('banking-duplicate-reference', 'banking-basic', 'Transaction data integrity', 'Verify that transaction identifiers are unique.', 2),
  ('banking-category-search', 'banking-basic', 'Transaction search', 'Test every search behavior advertised in the transaction activity view.', 3),
  ('banking-negative-transfer', 'banking-basic', 'Transfer amount validation', 'Test transfer amounts at and beyond valid boundaries.', 4),
  ('banking-same-account-transfer', 'banking-basic', 'Transfer account validation', 'Verify that source and destination account combinations are valid.', 5),
  ('banking-freeze-card', 'banking-basic', 'Card security controls', 'Use the card security control and verify its resulting state.', 6),
  ('banking-past-payment', 'banking-basic', 'Payment date validation', 'Verify scheduled bill payments follow valid date rules.', 7),
  ('banking-wrong-beneficiary-delete', 'banking-basic', 'Beneficiary management', 'Delete saved beneficiaries and verify the selected record is removed.', 8)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index;

insert into public.ai_simulator_defects (
  id, scenario_id, title, evaluation_criteria, feedback_correct
)
values
  ('banking-balance-total', 'banking-basic', 'Incorrect total available balance', 'The portal displays a total available balance of $11,750, while the two account balances are $2,450 and $8,100, which total $10,550.', 'Correct. The total available balance must equal the sum of the displayed account balances.'),
  ('banking-duplicate-reference', 'banking-basic', 'Duplicate transaction reference', 'The City Transit and StreamBox transactions both use the reference TX-88423. Transaction references must be unique.', 'Correct. Separate transactions must not share the same transaction reference.'),
  ('banking-category-search', 'banking-basic', 'Transaction category search does not work', 'The transaction search advertises merchant or category searching, but entering a category such as Utilities returns no result because only merchant names are searched.', 'Correct. The advertised transaction category search behavior is not implemented.'),
  ('banking-negative-transfer', 'banking-basic', 'Negative transfer amount is accepted', 'The transfer form accepts and confirms a negative amount instead of rejecting it.', 'Correct. Money transfers must reject zero or negative amounts.'),
  ('banking-same-account-transfer', 'banking-basic', 'Transfer to the same account is accepted', 'The transfer form allows the same account to be selected as both source and destination and confirms the transfer.', 'Correct. A transfer must use different source and destination accounts.'),
  ('banking-freeze-card', 'banking-basic', 'Freeze card button does nothing', 'Clicking Freeze card produces no confirmation and does not change the card state.', 'Correct. A security control must clearly confirm and reflect whether the card is frozen.'),
  ('banking-past-payment', 'banking-basic', 'Past bill payment date is accepted', 'The bill payment form accepts and schedules a date in the past.', 'Correct. Scheduled payments must reject dates in the past.'),
  ('banking-wrong-beneficiary-delete', 'banking-basic', 'Deleting beneficiary removes the wrong record', 'Clicking delete on Riverstone Rentals or Maya Patel removes Alex Morgan, the first beneficiary, instead of the selected beneficiary.', 'Correct. Beneficiary deletion must remove the record selected by the user.')
on conflict (id) do update set
  title = excluded.title,
  evaluation_criteria = excluded.evaluation_criteria,
  feedback_correct = excluded.feedback_correct,
  is_active = true;

notify pgrst, 'reload schema';
