
DROP TABLE IF EXISTS `ResultDates`;
CREATE TABLE ResultDates AS (
	SELECT r.personId, r.personName, r.personCountryId, r.competitionId, r.eventId, r.roundId, r.formatId, r.pos, r.average, r.regionalAverageRecord, r.regionalSingleRecord,
	DATE_ADD(MAKEDATE(year, day), INTERVAL month-1 MONTH) date 
	FROM Results r
	JOIN Competitions c ON c.id = r.competitionId
);

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

# 2-3 minutes

DROP TABLE IF EXISTS `Points`;
CREATE TABLE Points AS (
SELECT competitionId, personId, personName, personCountryId, eventId, roundId, date,
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

# ~10 minutes

CREATE INDEX date ON Points(date);
CREATE INDEX personEvent ON Points(personId, eventId);
CREATE INDEX eventPerson ON Points(eventId, personId);
CREATE INDEX personCountryEvent ON Points(personCountryId, eventId);
CREATE INDEX competitionEvent ON Points(competitionId, eventId);
CREATE INDEX idNameEvent ON Points(personId,personName,eventId);

# ~1 minute

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