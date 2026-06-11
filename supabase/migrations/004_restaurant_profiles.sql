CREATE TABLE restaurant_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  name                  text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  cuisine               text NOT NULL CHECK (char_length(cuisine) <= 80),
  location              text NOT NULL CHECK (char_length(location) <= 200),
  aesthetic_description text CHECK (char_length(aesthetic_description) <= 600),
  collab_types          text[] NOT NULL DEFAULT '{}',
  description           text CHECK (char_length(description) <= 800),
  is_accepting_collabs  boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX restaurant_profiles_user_id_idx ON restaurant_profiles(user_id);
CREATE INDEX restaurant_profiles_cuisine_idx ON restaurant_profiles(cuisine);
CREATE INDEX restaurant_profiles_location_idx ON restaurant_profiles(location);
CREATE INDEX restaurant_profiles_accepting_idx ON restaurant_profiles(is_accepting_collabs)
  WHERE is_accepting_collabs = true;
CREATE INDEX restaurant_profiles_collab_types_idx ON restaurant_profiles USING GIN(collab_types);

CREATE TRIGGER restaurant_profiles_updated_at
  BEFORE UPDATE ON restaurant_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
