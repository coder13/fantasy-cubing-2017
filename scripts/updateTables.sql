START TRANSACTION;

CREATE INDEX compId on Results(competitionId);

DROP TABLE IF EXISTS ResultDates;
CREATE TABLE ResultDates AS (
	SELECT r.personId, r.personName, r.personCountryId, r.competitionId, r.eventId, r.roundId, r.formatId, r.pos, r.average, r.best, r.regionalAverageRecord, r.regionalSingleRecord,
	DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH) date,
	DATE_SUB(DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH), INTERVAL DAYOFWEEK(DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH))-1 DAY) weekend
	FROM Results r
	JOIN Competitions c ON c.id = r.competitionId
);

# ~30

CREATE INDEX eventRound ON ResultDates(eventId, roundId);
CREATE INDEX roundEventComp ON ResultDates(roundId, eventId, competitionId);
CREATE INDEX eventCountryDate ON ResultDates(eventId, personCountryId, date);
CREATE INDEX eventCountryWeekend ON ResultDates(eventId, personCountryId, weekend);
CREATE INDEX eventDateAvg ON ResultDates(eventId, date, average);
CREATE INDEX rar ON ResultDates(regionalAverageRecord);
CREATE INDEX rsr ON ResultDates(regionalSingleRecord);

# ~30s

DROP TABLE Points;
CREATE TABLE Points AS (
SELECT R.competitionId, R.personId, R.personName, R.personCountryId, R.eventId, R.roundId, R.average, R.best, weekend, year(weekend) year, week(weekend) + 1 week,
@compPoints := TRUNCATE(if(formatId in ('a', 'm'),
if(R.average > 0, 100 * (comp.bestAvg / (R.average + comp.avg) + comp.bestAvg / R.average), 0),
if(R.best > 0, 100 * (comp.bestSingle / (R.best + comp.avgSingle) + comp.bestSingle / R.best), 0)), 2) AS compPoints,
@worldPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (world.average / R.average + world.best / R.best), if(R.best > 0, 50 * world.best / R.best, 0)), 2) AS worldPoints,
@countryPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (country.average / R.average + country.best / R.best), if(R.best > 0, 50 * country.best / R.best, 0)), 2) AS countryPoints,
TRUNCATE((@compPoints + @worldPoints + @countryPoints) / 3, 2) AS totalPoints
FROM ResultDates R
LEFT JOIN (SELECT competitionId, eventId, roundId, AVG(r.average) avg, AVG(r.best) avgSingle, MIN(r.average) bestAvg, MIN(r.best) bestSingle
	FROM ResultDates r WHERE if(formatId in ('a', 'm'), r.average > 0, r.best > 0) GROUP BY competitionId, eventId, roundId) comp ON R.competitionId=comp.competitionId AND R.eventId=comp.eventId AND R.roundId=comp.roundId
LEFT JOIN (SELECT date, eventId,
	(SELECT MIN(average) FROM ResultDates r where r.date <= rd.date AND r.eventId=rd.eventId AND r.average > 0 AND regionalAverageRecord='WR') average,
	(SELECT MIN(best) FROM ResultDates r where r.date <= rd.date AND r.eventId=rd.eventId AND r.best > 0 AND regionalSingleRecord='WR') best
	FROM (SELECT date,eventId FROM ResultDates GROUP BY date,eventId) rd) world ON world.eventId = R.eventId AND world.date = R.date
LEFT JOIN (SELECT date, eventId, personCountryId,
	(SELECT MIN(average) FROM ResultDates r where r.date <= rd.date AND r.eventId=rd.eventId AND r.personCountryId = rd.personCountryId AND r.average > 0) average,
	(SELECT MIN(best) FROM ResultDates r where r.date <= rd.date AND r.eventId=rd.eventId AND r.personCountryId = rd.personCountryId AND r.best > 0) best
	FROM (SELECT date,eventId,personCountryId FROM ResultDates GROUP BY date,eventId,personCountryId) rd) country ON country.eventId = R.eventId AND country.personCountryId = R.personCountryId AND country.date = R.date
);

# ~10 minutes

CREATE INDEX week ON Points(week);
CREATE INDEX year ON Points(year);
CREATE INDEX personEvent ON Points(personId, eventId);
CREATE INDEX eventPerson ON Points(eventId, personId);
CREATE INDEX personCountryEvent ON Points(personCountryId, eventId);
CREATE INDEX competitionEvent ON Points(competitionId, eventId);
CREATE INDEX idNameEvent ON Points(personId,personName,eventId);

# 1-2 minutes

DROP TABLE IF EXISTS `PersonPoints`;
CREATE TABLE PersonPoints AS (
SELECT personId id, personName name, SUM(totalPoints)/18 points
FROM Points GROUP BY id, name ORDER BY points DESC);

# ~10s

DROP TABLE IF EXISTS `PersonEventPoints`;
CREATE Table PersonEventPoints AS (
SELECT personId id, personName name, eventId, AVG(totalPoints) points
FROM Points GROUP BY id, name, eventId ORDER BY points DESC);

# ~25s

COMMIT;
