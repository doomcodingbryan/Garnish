CREATE TABLE creator_profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  bio              text CHECK (char_length(bio) <= 500),
  instagram_handle text CHECK (char_length(instagram_handle) <= 64),
  tiktok_handle    text CHECK (char_length(tiktok_handle) <= 64),
  follower_count   integer NOT NULL DEFAULT 0 CHECK (follower_count >= 0),
  engagement_rate  numeric(5,2) CHECK (engagement_rate >= 0 AND engagement_rate <= 100),
  niche_tags       text[] NOT NULL DEFAULT '{}',
  flat_rate_cents  integer CHECK (flat_rate_cents >= 0),
  location         text CHECK (char_length(location) <= 120),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX creator_profiles_user_id_idx ON creator_profiles(user_id);
CREATE INDEX creator_profiles_follower_count_idx ON creator_profiles(follower_count);
CREATE INDEX creator_profiles_location_idx ON creator_profiles(location);
CREATE INDEX creator_profiles_niche_tags_idx ON creator_profiles USING GIN(niche_tags);

CREATE TRIGGER creator_profiles_updated_at
  BEFORE UPDATE ON creator_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
