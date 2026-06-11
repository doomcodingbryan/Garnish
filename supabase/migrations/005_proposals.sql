CREATE TABLE proposals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id        uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  recipient_id        uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  initiator_role      user_role NOT NULL,
  creator_id          uuid NOT NULL REFERENCES user_profiles(id),
  restaurant_id       uuid NOT NULL REFERENCES user_profiles(id),
  status              proposal_status NOT NULL DEFAULT 'pending',
  counter_count       smallint NOT NULL DEFAULT 0 CHECK (counter_count IN (0, 1)),
  meal_description    text CHECK (char_length(meal_description) <= 600),
  deliverables        text NOT NULL CHECK (char_length(deliverables) BETWEEN 1 AND 400),
  posting_window_days integer NOT NULL CHECK (posting_window_days > 0 AND posting_window_days <= 365),
  payment_cents       integer NOT NULL CHECK (payment_cents >= 0),
  message             text CHECK (char_length(message) <= 500),
  counter_terms       jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_proposal CHECK (initiator_id != recipient_id),
  CONSTRAINT parties_match CHECK (
    (creator_id = initiator_id AND restaurant_id = recipient_id)
    OR (restaurant_id = initiator_id AND creator_id = recipient_id)
  )
);

-- Prevents two open negotiations between the same pair simultaneously
CREATE UNIQUE INDEX proposals_one_active_per_pair
  ON proposals(creator_id, restaurant_id)
  WHERE status IN ('pending', 'countered');

CREATE INDEX proposals_initiator_idx ON proposals(initiator_id);
CREATE INDEX proposals_recipient_idx ON proposals(recipient_id);
CREATE INDEX proposals_creator_id_idx ON proposals(creator_id);
CREATE INDEX proposals_restaurant_id_idx ON proposals(restaurant_id);
CREATE INDEX proposals_status_idx ON proposals(status);

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
