PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- Перестворити таблицю users з CHECK-обмеженням на role
CREATE TABLE IF NOT EXISTS users_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'user'))
);
INSERT INTO users_new (id, name, email, role)
  SELECT id, name, email, role FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Перестворити таблицю software з CHECK-обмеженням на seats
CREATE TABLE IF NOT EXISTS software_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  license TEXT NOT NULL,
  seats INTEGER NOT NULL CHECK(seats > 0),
  comment TEXT,
  owner_id TEXT,
  category_id TEXT,
  FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);
INSERT INTO software_new (id, name, version, license, seats, comment, owner_id, category_id)
  SELECT id, name, version, license, seats, comment, owner_id, category_id FROM software;
DROP TABLE software;
ALTER TABLE software_new RENAME TO software;

COMMIT;
PRAGMA foreign_keys = ON;
