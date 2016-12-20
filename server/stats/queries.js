const LIMIT = 50;

const Queries = {
	weeklyPoints: `
		SELECT personId, personName, personCountryId, TRUNCATE(avg(totalPoints), 2) points
		FROM Points
		WHERE week = :week AND year=2016
		GROUP BY personId, personName, personCountryId
		ORDER BY points DESC
		LIMIT :limit;
	`,
	pointsByEvent: `
		SELECT personId, personName, personCountryId, eventId, TRUNCATE(avg(totalPoints), 2) points
		FROM Points
		WHERE week = :week AND year=2016
		GROUP BY personId, personName, personCountryId, eventId
		ORDER BY points DESC
		LIMIT :limit;
	`,
	teamLeaders: `
		SELECT u.name owner, t.name, t.points
		FROM Teams t
		JOIN Users u ON t.owner = u.id
		ORDER BY t.points DESC, t.name, u.name
		LIMIT :limit
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

	queries.teamLeaders = (limit) => sequelize.query(Queries.teamLeaders, {
		replacements: {
			limit: limit || LIMIT
		},
		type: sequelize.QueryTypes.SELECT
	});

	return queries;
};
