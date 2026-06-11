-- Atomic proposal acceptance + match creation
-- Called via service role from acceptProposal() server action
CREATE OR REPLACE FUNCTION accept_proposal_and_create_match(p_proposal_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_proposal proposals%ROWTYPE;
  v_terms jsonb;
  v_deliverables text;
  v_posting_window_days integer;
  v_payment_cents integer;
BEGIN
  SELECT * INTO v_proposal FROM proposals WHERE id = p_proposal_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_proposal.status NOT IN ('pending', 'countered') THEN
    RAISE EXCEPTION 'Proposal cannot be accepted in status: %', v_proposal.status;
  END IF;

  -- Resolve active terms
  IF v_proposal.status = 'countered' AND v_proposal.counter_terms IS NOT NULL THEN
    v_deliverables := v_proposal.counter_terms->>'deliverables';
    v_posting_window_days := (v_proposal.counter_terms->>'posting_window_days')::integer;
    v_payment_cents := (v_proposal.counter_terms->>'payment_cents')::integer;
  ELSE
    v_deliverables := v_proposal.deliverables;
    v_posting_window_days := v_proposal.posting_window_days;
    v_payment_cents := v_proposal.payment_cents;
  END IF;

  UPDATE proposals SET status = 'accepted' WHERE id = p_proposal_id;

  INSERT INTO matches (proposal_id, creator_id, restaurant_id, deliverables, posting_deadline, payment_cents)
  VALUES (
    p_proposal_id,
    v_proposal.creator_id,
    v_proposal.restaurant_id,
    v_deliverables,
    CURRENT_DATE + v_posting_window_days,
    v_payment_cents
  );
END;
$$;
