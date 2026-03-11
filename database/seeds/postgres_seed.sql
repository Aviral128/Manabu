-- Seed core badges and starter course
INSERT INTO badges (code, name, description, icon_url)
VALUES
('streak_7', '7-Day Streak', 'Maintained a study streak for seven days.', 'https://cdn.manabu.app/badges/streak_7.png'),
('accuracy_90', 'Sharp Shooter', 'Scored above 90% in a timed quiz.', 'https://cdn.manabu.app/badges/accuracy_90.png'),
('social_battle', 'Battle Challenger', 'Completed first multiplayer battle.', 'https://cdn.manabu.app/badges/social_battle.png')
ON CONFLICT (code) DO NOTHING;
