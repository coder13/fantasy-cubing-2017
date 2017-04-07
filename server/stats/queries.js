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
		return `${recordType} = 'WR'`;
	} else if (region[0] === '_') {
		return `NOT ${recordType} = '' AND personContinentId = '${ContinentIds[region] ? ContinentIds[region] : ''}'`;
	} else {
		return knex.raw(`NOT ${recordType} = '' AND personCountryId = ?`, [region]).toString();
	}
};

module.exports = function () {
	let queries = {};

	queries.weeklyPoints = (week) =>
		knex('Points').select('personId', 'personName', 'eventId', 'personCountryId', knex.raw('TRUNCATE(AVG(totalPoints), 2) AS points'))
			.where({week: week, year: YEAR})
			.groupBy('personId', 'personName', 'eventId', 'personCountryId')
			.orderBy('points', 'desc');

	queries.rankings = () =>
		knex('Teams').join('Users', 'Teams.owner', 'Users.id')
		.select('Users.name AS owner', 'Teams.name', 'Teams.id', 'Teams.points')
		.orderBy('Teams.points', 'desc').orderBy('Teams.name').orderBy('Users.name');

	queries.weeklyRankings = (week) =>
		knex('Archive AS a').join('Teams AS t', 'a.teamId', 't.id').join('Users AS u', 't.owner', 'u.id')
		.select('u.name AS owner', 't.id', 't.name', 'a.points')
		.where({week}).orderBy('a.points', 'desc');

	queries.seasonRankings = (season) =>
		knex('Archive AS a').join('Teams AS t', 'a.teamId', 't.id').join('Users AS u', 't.owner', 'u.id')
		.select('u.name AS owner', 't.id', 't.name', 'a.points')
		.where({season}).orderBy('a.points', 'desc');

	queries.mostPicked = (week) =>
		knex('Picks AS p').leftJoin('Persons', function () {
			this.on('Persons.id', 'p.personId').on('Persons.subid', knex.raw('1'));
		})
			.select('personId', 'name', 'countryId', 'p.eventId', knex.raw('COUNT(*) AS picks'))
			.where({week}).groupBy('personId', 'name', 'countryId', 'p.eventId')
			.orderBy('picks', 'desc');

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
		let average = knex('ResultDates').min('average').where({eventId: event}).whereRaw('average > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Average')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('average');
		let single = knex('ResultDates').min('best').where({eventId: event}).whereRaw('best > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Single')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('single');

		return knex.select(average, single);
	};

	queries.records = (region,date) => {
		let average = knex('ResultDates').min('average').whereRaw('eventId = id').whereRaw('average > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Average')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('average');
		let single = knex('ResultDates').min('best').whereRaw('eventId = id').whereRaw('best > 0')
			.whereRaw(getRegionQueryFromRegion(region, 'Single')).whereRaw(date ? knex.raw('date < ?', [date]) : '').as('single');
		let events = knex('Events').select('id').whereRaw('rank < 500').as('events');

		return knex(events).select('id', 'eventId', knex.raw(average), knex.raw(single));
	};

	queries.person = (personId) =>
		knex('Persons').select('id', 'name', 'countryId').where({id: personId});

	const points = (table, type) => [
		`${table}.worldPoints AS ${type}.worldPoints`,
		`${table}.continentPoints AS ${type}.continentPoints`,
		`${table}.countryPoints AS ${type}.countryPoints`,
		`${table}.totalPoints AS ${type}.totalPoints`
	];

	const select = [
		'A.eventId', 'A.roundId', 'R.pos', 'R.formatId AS formatId',
		'C.id AS competition.id', 'C.name AS competition.name', knex.raw('CONCAT(C.year, \'-\', C.month, \'-\', C.day) AS `competition.date`'),
		'A.average AS average.time', 'R.regionalAverageRecord AS average.regionalRecord',
		...points('A', 'average'),
		'R.value1 AS average.times[0]', 'R.value2 AS average.times[1]', 'R.value3 AS average.times[2]', 'R.value4 AS average.times[3]', 'R.value5 AS average.times[4]',
		'S.best AS single.time', 'R.regionalSingleRecord AS single.regionalRecord',
		...points('S', 'single')
	];

	queries.personPoints = (personId) =>
		knex('PointsAverage AS A').join('PointsSingle AS S', 'A.resultId', 'S.resultId').join('Events AS E', 'A.eventId', 'E.id').join('Results AS R', function () {
			this.on('A.competitionid', '=', 'R.competitionId').on('A.personId', '=', 'R.personId').on('A.eventId', '=', 'R.eventId').on('A.roundId', '=', 'R.roundId');
		})
		.join('Competitions AS C', 'A.competitionId', 'C.id')
		.join('Rounds AS rounds', 'A.roundId', 'rounds.id')

		.select(select).where({'A.personId': personId}).orderBy('A.weekend', 'desc').orderBy('E.rank').orderBy('rounds.rank', 'desc');

	return queries;
};
