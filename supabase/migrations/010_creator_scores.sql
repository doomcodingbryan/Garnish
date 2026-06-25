-- Computed UGC Score stored on creator_profiles so Discover's `select("*")` picks it up
-- for sorting/filtering without a join. Components jsonb holds the sub-scores + confidence.
ALTER TABLE creator_profiles
  ADD COLUMN youtube_handle text CHECK (char_length(youtube_handle) <= 64),
  ADD COLUMN ugc_score      integer CHECK (ugc_score BETWEEN 0 AND 100),
  ADD COLUMN ugc_tier       text CHECK (char_length(ugc_tier) <= 32),
  -- { engagement, reach, consistency, breadth, confidence }
  ADD COLUMN ugc_components jsonb,
  ADD COLUMN ugc_scored_at  timestamptz;

CREATE INDEX creator_profiles_ugc_score_idx ON creator_profiles(ugc_score DESC NULLS LAST);
