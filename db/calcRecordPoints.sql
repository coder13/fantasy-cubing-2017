
DROP TABLE IF EXISTS `ResultDates`;
CREATE TABLE ResultDates AS (
SELECT r.personId, r.personName, r.personCountryId, r.competitionId, r.eventId, r.roundId, r.formatId, r.pos, r.average, r.regionalAverageRecord, r.regionalSingleRecord,
DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH) date 
FROM   Results r
JOIN   Competitions c ON c.id = r.competitionId);

# 5-6 mins


CREATE INDEX date ON ResultDates(date);
CREATE INDEX eventId ON ResultDates(eventId);
CREATE INDEX dateEvent ON ResultDates(date, eventId);
CREATE INDEX regionalAverage ON ResultDates(regionalAverageRecord);
CREATE INDEX regionalSingle ON ResultDates(regionalSingleRecord);
CREATE INDEX eventDate ON ResultDates(eventId, date);
CREATE INDEX record ON ResultDates(regionalAverageRecord,regionalSingleRecord);
CREATE INDEX eventCountryDate ON ResultDates(eventId, personCountryId, date);
CREATE INDEX countryEventDate ON ResultDates(personCountryId, eventId, date);
CREATE INDEX roundEvent ON ResultDates(roundId, eventId);
CREATE INDEX eventRound ON ResultDates(eventId, roundId);
CREATE INDEX personCountry ON ResultDates(personId, personCountryId);

CREATE INDEX roundEventComp ON ResultDates(roundId, eventId, competitionId);

DROP TABLE IF EXISTS `Points`;
CREATE TABLE Points AS (
SELECT competitionId, personId, personName, personCountryId, eventId, date,
if(regionalAverageRecord = 'WR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.average > 0), 0) wrAveragePoints,
if(regionalSingleRecord = 'WR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date), 0) wrSinglePoints,
if(NOT regionalAverageRecord in('WR', 'NR'),
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND average > -1 AND rd.personCountryId in
(SELECT Countries.id FROM Countries JOIN Continents on Countries.continentId=Continents.id where recordName = rd2.regionalAverageRecord)), 0) crAveragePoints,
if(NOT regionalSingleRecord in('WR', 'NR'),
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.personCountryId in
(SELECT Countries.id FROM Countries JOIN Continents on Countries.continentId=Continents.id where recordName = rd2.regionalSingleRecord)), 0) crSinglePoints,
if(regionalAverageRecord = 'NR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.personCountryId=rd2.personCountryId AND rd.average > -1), 0) nrAveragePoints,
if(regionalSingleRecord = 'NR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.personCountryId=rd2.personCountryId), 0) nrSinglePoints,
(SELECT COUNT(DISTINCT pos) FROM ResultDates rd
	WHERE rd.competitionId=rd2.competitionId AND rd.eventId=rd2.eventId AND rd.roundId=rd2.roundId AND rd.pos>rd2.pos) compPoints
FROM ResultDates rd2);


CREATE INDEX date ON Points(date);
CREATE INDEX personEvent ON Points(personId, eventId);
CREATE INDEX eventPerson ON Points(eventId, personId);

SELECT * INTO OUTFILE '/tmp/points.tsv' FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' FROM (
SELECT personId, personName, personCountryId, 
SUM(wrAveragePoints) wrAveragePoints, SUM(wrSinglePoints) wrSinglePoints,
SUM(crAveragePoints) crAveragePoints, SUM(crSinglePoints) crSinglePoints,
SUM(nrAveragePoints) nrAveragePoints, SUM(nrSinglePoints) nrSinglePoints,
SUM(compPoints) compPoints,
SUM(wrAveragePoints + wrSinglePoints + crAveragePoints + crSinglePoints + nrAveragePoints + nrSinglePoints) recordPoints,
SUM(wrAveragePoints + wrSinglePoints + crAveragePoints + crSinglePoints + nrAveragePoints + nrSinglePoints + compPoints) totalPoints
FROM Points GROUP BY personId,personName,personCountryId ORDER BY totalPoints DESC) rip LIMIT 10000;

SELECT * INTO OUTFILE '/tmp/compPointsPastYear.tsv' FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' FROM (
SELECT personId, personName, personCountryId,
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='444'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='555'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='222'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333bf'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333oh'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333fm'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333ft'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='minx'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='pyram'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='sq1'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='clock'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='skewb'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='666'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='777'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='444bf'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='555bf'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333mbf'),
SUM(compPoints) compPoints,
(SELECT COUNT(DISTINCT competitionId) FROM Points p WHERE p.personId=p2.personId AND date >= DATE_ADD(CURDATE(), INTERVAL -1 YEAR)),
SUM(compPoints)/(SELECT COUNT(DISTINCT competitionId) FROM Points p WHERE p.personId=p2.personId AND date >= DATE_ADD(CURDATE(), INTERVAL -1 YEAR))
FROM Points p2 WHERE date >= DATE_ADD(CURDATE(), INTERVAL -1 YEAR)
GROUP BY personId,personName,personCountryId ORDER BY compPoints DESC) rip LIMIT 10000;

SELECT * INTO OUTFILE '/tmp/compPointsPast3Months.tsv' FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' FROM (
SELECT personId, personName, personCountryId,
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='444'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='555'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='222'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333bf'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333oh'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333fm'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333ft'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='minx'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='pyram'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='sq1'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='clock'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='skewb'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='666'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='777'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='444bf'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='555bf'),
(SELECT SUM(compPoints) FROM Points p WHERE p.personId=p2.personId AND eventId='333mbf'),
SUM(compPoints) compPoints,
(SELECT COUNT(DISTINCT competitionId) FROM Points p WHERE p.personId=p2.personId AND date >= DATE_ADD(CURDATE(), INTERVAL -3 MONTH)),
SUM(compPoints)/(SELECT COUNT(DISTINCT competitionId) FROM Points p WHERE p.personId=p2.personId AND date >= DATE_ADD(CURDATE(), INTERVAL -3 MONTH))
FROM Points p2 WHERE date >= DATE_ADD(CURDATE(), INTERVAL -3 MONTH)
GROUP BY personId,personName,personCountryId ORDER BY compPoints DESC) rip LIMIT 10000;
