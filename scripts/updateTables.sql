START TRANSACTION;

CREATE INDEX id ON Countries(id);
CREATE INDEX id ON Continents(id);
CREATE INDEX compId on Results(competitionId);

## Attaches Dates and continent ids to results

DROP TABLE IF EXISTS ResultDates;
CREATE TABLE ResultDates AS (
	SELECT R.personId, R.personName, R.personCountryId, c.continentId personContinentId, R.competitionId, R.eventId, R.roundId, R.formatId, R.pos, R.average, R.best, R.regionalAverageRecord, R.regionalSingleRecord,
	@date := DATE(CONCAT(year, '-', month, '-', day)) date,
	@weekend := DATE_SUB(@subdate:=DATE_SUB(@date, INTERVAL 5 DAY), INTERVAL DAYOFWEEK(@subDate)-6 DAY) weekend
	FROM Results R
	JOIN Competitions comps ON comps.id = R.competitionId
	JOIN (SELECT Countries.id, Continents.recordName continentId FROM Countries LEFT JOIN Continents ON Countries.continentid = Continents.id) c ON c.id = R.personCountryId
);


# ~30

CREATE INDEX eventRound ON ResultDates(eventId, roundId);
CREATE INDEX roundEventComp ON ResultDates(roundId, eventId, competitionId);
CREATE INDEX eventCountryDate ON ResultDates(eventId, personCountryId, date);
CREATE INDEX eventContinentDate ON ResultDates(eventId, personContinentId, date);
CREATE INDEX eventDateAvg ON ResultDates(eventId, date, average);
CREATE INDEX avg ON ResultDates(average);
CREATE INDEX best ON ResultDates(best);
CREATE INDEX rar ON ResultDates(regionalAverageRecord);
CREATE INDEX rsr ON ResultDates(regionalSingleRecord);

# ~30s

DROP TABLE Points;
CREATE TABLE Points AS (
SELECT R.competitionId, R.personId, R.personName, R.personCountryId, R.eventId, R.roundId, R.average, R.best, weekend, year(weekend) year, week(weekend) week,
@WPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (W.average / R.average + W.best / R.best), if(R.best > 0, 50 * W.best / R.best, 0)), 2) AS worldPoints,
@CPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (C.average / R.average + C.best / R.best), if(R.best > 0, 50 * C.best / R.best, 0)), 2) AS continentPoints,
@NPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (N.average / R.average + N.best / R.best), if(R.best > 0, 50 * N.best / R.best, 0)), 2) AS countryPoints,
@skillPoints := TRUNCATE((@WPoints + @CPoints + @NPoints) / 3, 2) AS skillPoints,
@compPoints := TRUNCATE(if(formatId in ('a', 'm'),
if(R.average > 0, 100 * (comp.bestAvg / (R.average + comp.avg) + comp.bestAvg / R.average), 0),
if(R.best > 0, 100 * (comp.bestSingle / (R.best + comp.avgSingle) + comp.bestSingle / R.best), 0)), 2) AS compPoints,
TRUNCATE((@compPoints + @skillPoints) / 2, 2) AS totalPoints
FROM ResultDates R
LEFT JOIN (SELECT competitionId, eventId, roundId, AVG(r.average) avg, AVG(r.best) avgSingle, MIN(r.average) bestAvg, MIN(r.best) bestSingle
	FROM ResultDates r WHERE if(formatId in ('a', 'm'), r.average > 0, r.best > 0) GROUP BY roundId,eventId,competitionId) comp ON R.competitionId=comp.competitionId AND R.eventId=comp.eventId AND R.roundId=comp.roundId
LEFT JOIN (SELECT date, eventId,
	(SELECT IFNULL(MIN(average),0) FROM ResultDates r where r.date < rd.date AND r.eventId=rd.eventId AND r.average > 0 AND regionalAverageRecord='WR') average,
	(SELECT IFNULL(MIN(best),0) FROM ResultDates r where r.date < rd.date AND r.eventId=rd.eventId AND r.best > 0 AND regionalSingleRecord='WR') best
	FROM (SELECT date,eventId FROM ResultDates GROUP BY eventId,date) rd) W ON W.eventId = R.eventId AND W.date = R.date
LEFT JOIN (SELECT date, eventId, personCountryId,
	(SELECT IFNULL(MIN(average),0) FROM ResultDates r where r.date < rd.date AND r.personCountryId = rd.personCountryId AND NOT r.regionalAverageRecord = '' AND r.eventId=rd.eventId AND r.average > 0) average,
	(SELECT IFNULL(MIN(best),0) FROM ResultDates r where r.date < rd.date AND r.personCountryId = rd.personCountryId AND NOT r.regionalSingleRecord = '' AND r.eventId=rd.eventId AND r.best > 0) best
	FROM (SELECT date,eventId,personCountryId FROM ResultDates GROUP BY eventId,personCountryId,date) rd) N ON N.eventId = R.eventId AND N.personCountryId = R.personCountryId AND N.date = R.date
LEFT JOIN (SELECT date, eventId, personContinentId,
	(SELECT IFNULL(MIN(average),0) FROM ResultDates r where r.date < rd.date AND r.personContinentId = rd.personContinentId AND NOT r.regionalAverageRecord = '' AND r.eventId=rd.eventId AND r.average > 0) average,
	(SELECT IFNULL(MIN(best),0) FROM ResultDates r where r.date < rd.date AND r.personContinentId = rd.personContinentId AND NOT r.regionalSingleRecord = '' AND r.eventId=rd.eventId AND r.best > 0) best
	FROM (SELECT date,eventId,personContinentId FROM ResultDates GROUP BY eventId,personContinentId,date) rd) C ON C.eventId = R.eventId AND C.personContinentId = R.personContinentId AND C.date = R.date
);

# ~37 minutes, awful. Need improving though.

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
