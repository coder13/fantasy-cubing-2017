const LIMIT = 50;
const YEAR = 2017;

const Queries = {
	weeklyPoints: `
		SELECT personId, personName, personCountryId, TRUNCATE(avg(totalPoints), 2) points
		FROM Points
		WHERE week = :week AND year=${YEAR}
		GROUP BY personId, personName, personCountryId
		ORDER BY points DESC
		LIMIT :limit;
	`,
	pointsByEvent: `
		SELECT personId, personName, personCountryId, eventId, TRUNCATE(avg(totalPoints), 2) points
		FROM Points
		WHERE week = :week AND year=${YEAR}
		GROUP BY personId, personName, personCountryId, eventId
		ORDER BY points DESC
		LIMIT :limit;
	`,
	rankings: (limit) => `
		SELECT u.name owner, t.name, t.id, t.points
		FROM Teams t
		JOIN Users u ON t.owner = u.id
		ORDER BY t.points DESC, t.name, u.name
		${limit ? 'LIMIT :limit' : ''};
	`,
	weeklyRankings: (week, limit) => `
		SELECT u.name owner, t.name, t.id, a.points
		FROM Archive a
		JOIN Teams t ON a.teamId = t.id
		JOIN Users u ON t.owner = u.id
		WHERE a.week = :week
		ORDER BY a.points DESC, t.name, u.name
		${limit ? 'LIMIT :limit' : ''};		
	`,
	weeklyCompProgress: () => `
		SELECT (SELECT COUNT(DISTINCT competitionId) FROM Points WHERE year=2017 AND week=:week) completed,
		(SELECT count(id) FROM (
			SELECT id,
			@date := DATE(CONCAT(year, '-', month, '-', day)) date,
			@weekend := DATE_SUB(@date, INTERVAL (DAYOFWEEK(@date) + 2) % 7 DAY) weekend,
			@week:= week(@weekend) week, year
			FROM Competitions WHERE id NOT IN (SELECT DISTINCT competitionId FROM Points)) comps
		WHERE year=2017 AND week=:week) pending;
	`
};

module.exports = function (sequelize) {
	let queries = {};

	queries.weeklyPoints = (week, limit) => sequelize.query(Queries.weeklyPoints, {
		replacements: {
			week,
			limit: limit || LIMIT
		},
		type: sequelize.QueryTypes.SELECT
	});

	queries.weeklyPointsByEvent = (week, limit) => sequelize.query(Queries.pointsByEvent, {
		replacements: {
			week,
			limit: limit || LIMIT
		},
		type: sequelize.QueryTypes.SELECT
	});

	queries.weeklyRankings = (week, limit) => sequelize.query(Queries.weeklyRankings(week, limit), {
		replacements: {
			limit: limit || LIMIT,
			week
		},
		type: sequelize.QueryTypes.SELECT
	});

	queries.rankings = (limit) => sequelize.query(Queries.rankings(limit), {
		replacements: {
			limit: limit || LIMIT
		},
		type: sequelize.QueryTypes.SELECT
	});

	queries.weeklyCompProgress = (week) => sequelize.query(Queries.weeklyCompProgress(), {
		replacements: {week},
		type: sequelize.QueryTypes.SELECT
	});

	return queries;
};
