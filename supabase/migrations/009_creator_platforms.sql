-- Per-platform connections for a creator (the home for "youtube, instagram, tiktok, other apps").
-- One row per platform per creator. Raw aggregates in `metrics` feed the UGC Score.
CREATE TYPE platform_kind AS ENUM ('instagram', 'tiktok', 'youtube', 'other');
CREATE TYPE metric_source AS ENUM ('manual', 'api');

CREATE TABLE creator_platforms (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id     uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  platform       platform_kind NOT NULL,
  handle         text NOT NULL CHECK (char_length(handle) <= 128),
  profile_url    text CHECK (char_length(profile_url) <= 300),
  followers      integer CHECK (followers >= 0),
  -- { avg_likes, avg_comments, avg_views, post_count, posts_per_week, last_post_at }
  metrics        jsonb,
  source         metric_source NOT NULL DEFAULT 'manual',
  last_synced_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (creator_id, platform)
);

CREATE INDEX creator_platforms_creator_id_idx ON creator_platforms(creator_id);

CREATE TRIGGER creator_platforms_updated_at
  BEFORE UPDATE ON creator_platforms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
