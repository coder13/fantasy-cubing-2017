CREATE INDEX compId on Results(competitionId);

DROP TABLE IF EXISTS ResultDates;
CREATE TABLE ResultDates AS (
	SELECT r.personId, r.personName, r.personCountryId, r.competitionId, r.eventId, r.roundId, r.formatId, r.pos, r.average, r.regionalAverageRecord, r.regionalSingleRecord,
	DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH) date,
	DATE_SUB(DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH), INTERVAL DAYOFWEEK(DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH))-1 DAY) weekend
	FROM Results r
	JOIN Competitions c ON c.id = r.competitionId
);

# ~30

CREATE INDEX eventRound ON ResultDates(eventId, roundId);
CREATE INDEX roundEventComp ON ResultDates(roundId, eventId, competitionId);
CREATE INDEX eventCountryDate ON ResultDates(eventId, personCountryId, date);

# ~30s

DROP TABLE IF EXISTS `Points`;
CREATE TABLE Points AS (
SELECT competitionId, personId, personName, personCountryId, eventId, roundId, weekend, year(weekend) year, week(weekend) week,
if(regionalAverageRecord = 'WR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.average > -1), 0) wrAveragePoints,
if(regionalSingleRecord = 'WR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date), 0) wrSinglePoints,
if(NOT regionalAverageRecord in('WR', 'NR'),
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.average > -1 AND rd.personCountryId in
(SELECT Countries.id FROM Countries JOIN Continents on Countries.continentId=Continents.id where recordName = rd2.regionalAverageRecord)), 0) crAveragePoints,
if(NOT regionalSingleRecord in('WR', 'NR'),
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.personCountryId in
(SELECT Countries.id FROM Countries JOIN Continents on Countries.continentId=Continents.id where recordName = rd2.regionalSingleRecord)), 0) crSinglePoints,
if(regionalAverageRecord = 'NR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.average > -1 AND rd.personCountryId=rd2.personCountryId), 0) nrAveragePoints,
if(regionalSingleRecord = 'NR',
(SELECT COUNT(DISTINCT personId) FROM ResultDates rd
WHERE rd.eventId=rd2.eventId AND rd.date <= rd2.date AND rd.personCountryId=rd2.personCountryId), 0) nrSinglePoints,
(SELECT COUNT(DISTINCT pos) FROM ResultDates rd
	WHERE rd.competitionId=rd2.competitionId AND rd.eventId=rd2.eventId AND rd.roundId=rd2.roundId AND rd.pos>rd2.pos) compPoints
FROM ResultDates rd2);

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
SELECT personId id, personName name, SUM(compPoints) points
FROM Points
GROUP BY id, name
ORDER BY points DESC);

# ~10s

DROP TABLE IF EXISTS `PersonEventPoints`;
CREATE Table PersonEventPoints AS (
SELECT personId id, personName name, eventId,
sum(compPoints)+sum(wrSinglePoints)+sum(wrAveragePoints)+sum(crSinglePoints)+sum(crAveragePoints)+sum(nrSinglePoints)+sum(nrAveragePoints) totalPoints,
sum(compPoints) compPoints,
sum(wrSinglePoints) wrSinglePoints,
sum(wrAveragePoints) wrAveragePoints,
sum(crSinglePoints) crSinglePoints,
sum(crAveragePoints) crAveragePoints,
sum(nrSinglePoints) nrSinglePoints,
sum(nrAveragePoints) nrAveragePoints
FROM Points
GROUP BY id, name, eventId
ORDER BY totalPoints DESC);

# ~25s
