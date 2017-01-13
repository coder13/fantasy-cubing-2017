const LIMIT = 50;
const YEAR = 2017;

const {knex, Archive, Teams} = App.db;

/* For Fantasy Cubing chrome extension: */
const ContinentIds = {
	'_Africa': 'AfR',
	'_Asia': 'AsR',
	'_Europe': 'ER',
	'_North America': 'NAR',
	'_Oceania': 'OcR',
	'_South America': 'SAR'
};

const getRegionQueryFromRegion = function (region, type) {
	let recordType = `regional${type}Record`;
	if (region === 'world') {
		return `AND ${recordType} = 'WR'`;
	} else if (region[0] === '_') {
		return `AND NOT ${recordType} = '' AND personContinentId = '${ContinentIds[region] ? ContinentIds[region] : ''}'`;
	} else {
		return knex.raw(`AND NOT ${recordType} = '' AND personCountryId = ?`, region);
	}
};

module.exports = function () {
	let queries = {};

	queries.weeklyPoints = (week, limit) =>
		knex('Points').select('personId', 'personName', 'eventId', 'personCountryId', knex.raw('TRUNCATE(AVG(totalPoints), 2) AS points'))
			.where({week: week, year: YEAR})
			.groupBy('personId', 'personName', 'eventId', 'personCountryId')
			.orderBy('points', 'desc')
			.limit(limit || LIMIT);

	queries.rankings = (limit) =>
		knex('Teams').join('Users', 'Teams.owner', 'Users.id')
		.select('Users.name', 'Teams.name', 'Teams.id', 'Teams.points')
		.orderBy('Teams.points', 'desc').orderBy('Teams.name').orderBy('Users.name')
		.limit(limit);

	queries.weeklyRankings = (week, limit) =>
		knex('Archive AS a').join('Teams AS t', 'a.teamId', 't.id').join('Users AS u', 't.owner', 'u.id')
		.where({'a.week': 1}).orderBy('a.points', 'desc')
		.limit(limit);

	queries.weeklyCompProgress = (week) => {
		let where = {year: 2017, week};

		let completed = knex('Points').countDistinct('competitionId').where(where).as('completed');
		let pending = knex.count('id').from(knex('Competitions').select('id',
					knex.raw('@date := DATE(CONCAT(year, \'-\', month, \'-\', day)) date'),
					knex.raw('@weekend := DATE_SUB(@date, INTERVAL (DAYOFWEEK(@date) + 2) % 7 DAY) weekend'),
					knex.raw('@week:= week(@weekend) week'), 'year')
				.where(knex.raw('id NOT IN (SELECT DISTINCT competitionId FROM Points)')).as('comps'))
			.where(where).as('pending');

		return knex.select(completed, pending);
	};

	queries.recordsByEvent = (event,region,date) =>{
		let average = knex('ResultDates').min('average').whereRaw('eventId = ?', event).whereRaw('average > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Average')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('average');
		let single = knex('ResultDates').min('best').whereRaw('eventId = ?', event).whereRaw('average > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Single')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('single');

		return knex.select(average, single);
	};

	queries.records = (region,date) => {
		let average = knex('ResultDates').min('average').whereRaw('eventId = id').whereRaw('average > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Average')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('average');
		let single = knex('ResultDates').min('best').whereRaw('eventId = id').whereRaw('average > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Single')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('single');
		let events = knex('Events').select('id').whereRaw('rank < 500').as('events');

		return knex(events).select('id', 'eventId', knex.raw(average), knex.raw(single));
	};

	return queries;
};
