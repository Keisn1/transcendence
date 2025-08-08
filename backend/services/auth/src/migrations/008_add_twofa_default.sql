ALTER TABLE users ADD COLUMN twofa_enabled_new INTEGER DEFAULT 0;
UPDATE users SET twofa_enabled_new = COALESCE(twofa_enabled, 0);
ALTER TABLE users DROP COLUMN twofa_enabled;
ALTER TABLE users RENAME COLUMN twofa_enabled_new TO twofa_enabled;
