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
