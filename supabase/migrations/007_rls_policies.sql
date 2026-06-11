-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- creator_profiles
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_profiles_select" ON creator_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "creator_profiles_insert" ON creator_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "creator_profiles_update" ON creator_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- restaurant_profiles
ALTER TABLE restaurant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_profiles_select" ON restaurant_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "restaurant_profiles_insert" ON restaurant_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "restaurant_profiles_update" ON restaurant_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- proposals
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_select" ON proposals FOR SELECT TO authenticated
  USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);
CREATE POLICY "proposals_insert" ON proposals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "proposals_update" ON proposals FOR UPDATE TO authenticated
  USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

-- matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select" ON matches FOR SELECT TO authenticated
  USING (auth.uid() = creator_id OR auth.uid() = restaurant_id);
CREATE POLICY "matches_insert" ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id OR auth.uid() = restaurant_id);
CREATE POLICY "matches_update" ON matches FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id OR auth.uid() = restaurant_id);
