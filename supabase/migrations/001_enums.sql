CREATE TYPE user_role AS ENUM ('creator', 'restaurant');
CREATE TYPE proposal_status AS ENUM ('pending', 'countered', 'accepted', 'declined', 'withdrawn');
CREATE TYPE match_status AS ENUM ('pending_both', 'pending_creator', 'pending_restaurant', 'confirmed');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
