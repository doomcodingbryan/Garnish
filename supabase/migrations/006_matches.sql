CREATE TABLE matches (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id             uuid NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE RESTRICT,
  creator_id              uuid NOT NULL REFERENCES user_profiles(id),
  restaurant_id           uuid NOT NULL REFERENCES user_profiles(id),
  deliverables            text NOT NULL,
  posting_deadline        date NOT NULL,
  payment_cents           integer NOT NULL CHECK (payment_cents >= 0),
  status                  match_status NOT NULL DEFAULT 'pending_both',
  creator_confirmed_at    timestamptz,
  restaurant_confirmed_at timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX matches_creator_id_idx ON matches(creator_id);
CREATE INDEX matches_restaurant_id_idx ON matches(restaurant_id);
CREATE INDEX matches_status_idx ON matches(status);

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
