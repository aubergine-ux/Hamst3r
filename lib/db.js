const path = require('node:path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '..', 'hamst3r.db'));

db.pragma('journal_mode = WAL');

db.exec(`
	CREATE TABLE IF NOT EXISTS levels (
		guild_id     TEXT    NOT NULL,
		user_id      TEXT    NOT NULL,
		xp           INTEGER NOT NULL DEFAULT 0,
		messages     INTEGER NOT NULL DEFAULT 0,
		last_award   INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (guild_id, user_id)
	);

	CREATE INDEX IF NOT EXISTS idx_levels_leaderboard
		ON levels (guild_id, xp DESC);

	CREATE TABLE IF NOT EXISTS rank_cards (
		user_id    TEXT PRIMARY KEY,
		accent     TEXT,
		background TEXT
	);
`);

// XP needed to go from `level` to the next one.
function xpForLevel(level) {
	return 5 * level * level + 50 * level + 100;
}

// Turn total XP into a level plus progress inside that level.
function levelFromXp(totalXp) {
	let level = 0;
	let remaining = totalXp;

	while (remaining >= xpForLevel(level)) {
		remaining -= xpForLevel(level);
		level += 1;
	}

	return { level, into: remaining, needed: xpForLevel(level) };
}

const statements = {
	get: db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?'),

	upsert: db.prepare(`
		INSERT INTO levels (guild_id, user_id, xp, messages, last_award)
		VALUES (@guild_id, @user_id, @xp, 1, @now)
		ON CONFLICT (guild_id, user_id) DO UPDATE SET
			xp         = xp + @xp,
			messages   = messages + 1,
			last_award = @now
	`),

	rank: db.prepare(`
		SELECT COUNT(*) + 1 AS rank FROM levels
		WHERE guild_id = ? AND xp > ?
	`),

	top: db.prepare('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT ?'),

	card: db.prepare('SELECT * FROM rank_cards WHERE user_id = ?'),

	setCard: db.prepare(`
		INSERT INTO rank_cards (user_id, accent, background)
		VALUES (@user_id, @accent, @background)
		ON CONFLICT (user_id) DO UPDATE SET
			accent     = COALESCE(@accent, accent),
			background = COALESCE(@background, background)
	`),

	clearCard: db.prepare('DELETE FROM rank_cards WHERE user_id = ?'),
};

module.exports = { db, statements, xpForLevel, levelFromXp };
