START TRANSACTION;

CREATE INDEX id ON Countries(id);
CREATE INDEX id ON Continents(id);
CREATE INDEX compId on Results(competitionId);

## Attaches Dates and continent ids to results

DROP TABLE IF EXISTS ResultDates;
CREATE TABLE ResultDates AS (
  SELECT R.personId, R.personName, R.personCountryId, c.continentId personContinentId, R.competitionId, R.eventId, R.roundId, R.formatId, R.pos, R.average, R.best, R.regionalAverageRecord, R.regionalSingleRecord,
  @date := DATE(CONCAT(year, '-', month, '-', day)) date,
  @weekend := DATE_SUB(@date, INTERVAL (DAYOFWEEK(@date) + 2) % 7 DAY) weekend
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



CREATE INDEX eventCountryDateRarAvg ON ResultDates(eventId, personCountryId, date, regionalAverageRecord, average);
CREATE INDEX eventCountryDateRsrBest ON ResultDates(eventId, personCountryId, date, regionalSingleRecord, best);
CREATE INDEX eventContinentDateRarAvg ON ResultDates(eventId, personContinentId, date, regionalAverageRecord, average);
CREATE INDEX eventContinentDateRsrBest ON ResultDates(eventId, personContinentId, date, regionalSingleRecord, best);

# ~30s

DROP TABLE IF EXISTS W;
CREATE TABLE W AS (
  SELECT date, eventId,
    (SELECT IFNULL(MIN(average),0) FROM (SELECT * FROM ResultDates WHERE ResultDates.regionalAverageRecord='WR') r WHERE r.date < rd.date AND r.eventId=rd.eventId) average,
    (SELECT IFNULL(MIN(best),0) FROM (SELECT * FROM ResultDates WHERE ResultDates.regionalSingleRecord = 'WR') r WHERE r.date < rd.date AND r.eventId=rd.eventId) best
  FROM (SELECT date,eventId FROM ResultDates GROUP BY eventId,date) rd);

CREATE INDEX date ON W(date);

# < 5s

DROP TABLE IF EXISTS C;
CREATE TABLE C AS (
  SELECT date, eventId, personContinentId,
    (SELECT IFNULL(MIN(average),0) FROM (SELECT * FROM ResultDates WHERE NOT ResultDates.regionalAverageRecord = '') r WHERE r.date < rd.date AND r.personContinentId = rd.personContinentId AND r.eventId=rd.eventId) average,
    (SELECT IFNULL(MIN(best),0) FROM (SELECT * FROM ResultDates WHERE NOT ResultDates.regionalSingleRecord = '') r WHERE r.date < rd.date AND r.personContinentId = rd.personContinentId AND r.eventId=rd.eventId) best
    FROM (SELECT date,eventId,personContinentId FROM ResultDates GROUP BY eventId,personContinentId,date) rd);

CREATE INDEX dateContinent ON C(date, personContinentId);

# < 10s3

DROP TABLE IF EXISTS N;
CREATE TABLE N AS (
  SELECT date, eventId, personCountryId,
    (SELECT IFNULL(MIN(average),0) FROM (SELECT * FROM ResultDates WHERE NOT ResultDates.regionalAverageRecord = '') r WHERE r.date < rd.date AND r.personCountryId = rd.personCountryId AND r.eventId=rd.eventId) average,
    (SELECT IFNULL(MIN(best),0) FROM (SELECT * FROM ResultDates WHERE NOT ResultDates.regionalSingleRecord = '') r WHERE r.date < rd.date AND r.personCountryId = rd.personCountryId AND r.eventId=rd.eventId) best
  FROM (SELECT date,eventId,personCountryId FROM ResultDates GROUP BY eventId,personCountryId,date) rd);

CREATE INDEX dateCountry ON N(date, personCountryId);

# < 10s

DROP TABLE IF EXISTS Points;
CREATE TABLE Points AS (
SELECT R.competitionId, R.personId, R.personName, R.personCountryId, R.eventId, R.roundId, R.average, R.best, weekend, year(weekend) year, week(weekend) week,
@WPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (W.average / R.average + W.best / R.best), if(R.best > 0, 100 * W.best / R.best, 0)), 2) AS worldPoints,
@CPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (C.average / R.average + C.best / R.best), if(R.best > 0, 100 * C.best / R.best, 0)), 2) AS continentPoints,
@NPoints := TRUNCATE(if(R.formatId in ('a', 'm') AND R.average > 0 AND R.best > 0, 50 * (N.average / R.average + N.best / R.best), if(R.best > 0, 100 * N.best / R.best, 0)), 2) AS countryPoints,
@skillPoints := TRUNCATE((@WPoints + @CPoints + @NPoints) / 3, 2) AS totalPoints
FROM ResultDates R
  LEFT JOIN W ON W.eventId = R.eventId AND W.date = R.date
  LEFT JOIN C ON C.eventId = R.eventId AND C.personContinentId = R.personContinentId AND C.date = R.date
  LEFT JOIN N ON N.eventId = R.eventId AND N.personCountryId = R.personCountryId AND N.date = R.date
);

# ~24 minutes, awful. Need improving though.

CREATE INDEX week ON Points(week);
CREATE INDEX year ON Points(year);
CREATE INDEX personEvent ON Points(personId, eventId);
CREATE INDEX eventPerson ON Points(eventId, personId);
CREATE INDEX personCountryEvent ON Points(personCountryId, eventId);
CREATE INDEX competitionEvent ON Points(competitionId, eventId);
CREATE INDEX idNameEvent ON Points(personId,personName,eventId);

# 1-2 minutes

DROP TABLE IF EXISTS `TotalPointsByEvent`;
CREATE TABLE TotalPointsByEvent AS (
  SELECT personId, personName, eventId, SUM(totalPoints) points FROM Points GROUP BY personId, personName, eventId ORDER BY points DESC
);

DROP TABLE IF EXISTS `TotalPoints`;
CREATE TABLE TotalPoints AS (
  SELECT personId, personName, SUM(totalPoints) points FROM Points GROUP BY personId, personName ORDER BY points DESC
);

# 1 minute

COMMIT;
