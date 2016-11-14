const fs = require('fs');
const async = require('async');
const mysql = require('mysql');
const secrets = require('../secrets');
const connection = mysql.createConnection(secrets.db);

connection.connect();

const BonusPoints = (limit, date) => `
SELECT personI,
sum(wrAveragePoints) wrAveragePoints,
sum(wrSinglePoints) wrSinglePoints,
sum(crAveragePoints) crAveragePoints,
sum(crSinglePoints) crSinglePoints,
sum(nrAveragePoints) nrAveragePoints,
sum(nrSinglePoints) nrSinglePoints,
sum(wrAveragePoints+wrSinglePoints+crAveragePoints+crSinglePoints+nrAveragePoints+nrSinglePoints+compPoints) totalPoints
FROM (select * FROM Points WHERE date >= DATE_ADD(CURDATE(), INTERVAL 7 DAY)) p
GROUP BY personId;`;

const PointsInPast = (date) => `
SELECT personId, personName, personCountryId,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`333\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='444'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`444\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='555'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`555\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='222'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`222\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333bf'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`333bf\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333oh'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`333oh\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333fm'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`333fm\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333ft'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`333ft\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='minx'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`minx\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='pyram'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`pyram\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='sq1'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`sq1\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='clock'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`clock\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='skewb'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`skewb\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='666'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`666\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='777'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`777\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='444bf'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`444bf\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='555bf'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`555bf\`,
IFNULL((SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333mbf'${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}), 0) \`333mbf\`,
SUM(compPoints) totalPoints,
(SELECT COUNT(DISTINCT competitionId) FROM Points p WHERE p.personId=p2.personId${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}) comps,
SUM(compPoints)/(SELECT COUNT(DISTINCT competitionId) FROM Points p WHERE p.personId=p2.personId${date ? ` AND date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}) pointsCompRatio
FROM Points p2${date ? ` WHERE date >= DATE_ADD(CURDATE(), INTERVAL ${date})` : ''}
GROUP BY personId,personName,personCountryId
ORDER BY totalPoints DESC
LIMIT 100;`;

const query = function(q, file) {
	return function (cb) {
		connection.query(q, function (err, rows, fields) {
			if (err) {
				throw err;
			}

			console.log(`${rows.length} rows computed;`);
			fs.writeFileSync(file, JSON.stringify(rows));
			cb(null);
		});
	};
};

async.waterfall([
	query(PointsInPast(), 'cache/totalPoints.json'),
	query(PointsInPast('-1 YEAR'), 'cache/totalPointsPastYear.json'),
	query(PointsInPast('-6 MONTH'), 'cache/totalPointsPast6Months.json'),
	query(PointsInPast('-3 MONTH'), 'cache/totalPointsPast3Months.json')
], function (err, result) {
	if (err) {
		throw err;
	}

	connection.end();
});
