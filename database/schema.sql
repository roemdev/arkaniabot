CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    experience INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS giveaways (
    giveaway_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    giveaway_id INTEGER,
    user_id TEXT,
    FOREIGN KEY (giveaway_id) REFERENCES giveaways (giveaway_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);
