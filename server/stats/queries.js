let sumPoints = 'SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints)';

const LIMIT = 50;

module.exports.personEvent = (events, limit) => `
SELECT id, name,
(SELECT SUM(totalPoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND eventId in (${events.map(i => `'${i}'`).join(',')})) totalPoints,
${events.map(event => `(SELECT sum(totalPoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='${event}') \`${event}\``)}
FROM (SELECT DISTINCT id, name FROM PersonEventPoints) p
ORDER BY totalPoints DESCy
LIMIT ${limit || LIMIT};`;

module.exports.countryEvent = (events, limit) => `
SELECT id,
(SELECT ${sumPoints} FROM Points p WHERE p.personCountryId=c.id AND eventId in (${events.map(i => `'${i}'`).join(',')})) totalPoints,
${events.map(event => `(SELECT ${sumPoints} FROM Points p WHERE p.personCountryId=c.id AND p.eventId='${event}') \`${event}\``)}
FROM (SELECT DISTINCT personCountryId id FROM Points) c
ORDER BY totalPoints DESC
LIMIT ${limit || LIMIT};`;

module.exports.competitionEvent = (events, limit) => `
SELECT id,
(SELECT ${sumPoints} FROM Points p WHERE p.competitionId=c.id AND eventId in (${events.map(i => `'${i}'`).join(',')})) totalPoints,
${events.map(event => `(SELECT ${sumPoints} FROM Points p WHERE p.competitionId=c.id AND p.eventId='${event}') \`${event}\``)}
FROM (SELECT DISTINCT competitionId id FROM Points) c
ORDER BY totalPoints DESC
LIMIT ${limit || LIMIT};`;
