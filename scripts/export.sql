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

SELECT id, personName name, personCountryId country,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id) total,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='333') 333_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='444') 444_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='555') 555_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='222') 222_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='333bf') 333bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='333oh') 333oh_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='333fm') 333fm_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='333ft') 333ft_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='minx') minx_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='pyram') pyram_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='sq1') sq1_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='clock') clock_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='skewb') skewb_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='666') 666_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='777') 777_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='444bf') 444bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='555bf') 555bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personId=persons.id AND eventId='333mbf') 333mbf_p
FROM (SELECT DISTINCT personId id, personName, personCountryId FROM Points) persons ORDER BY total DESC LIMIT 25;

EXPLAIN (SELECT id,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id) totalPoints,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='333') 333_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='444') 444_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='555') 555_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='222') 222_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='333bf') 333bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='333oh') 333oh_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='333fm') 333fm_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='333ft') 333ft_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='minx') minx_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='pyram') pyram_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='sq1') sq1_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='clock') clock_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='skewb') skewb_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='666') 666_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='777') 777_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='444bf') 444bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='555bf') 555bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.personCountryId=c.id AND eventId='333mbf') 333mbf_p
FROM (SELECT DISTINCT personCountryId id FROM Points) c ORDER BY totalPoints DESC LIMIT 50);


EXPLAIN (SELECT id,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id) totalPoints,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='333') 333_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='444') 444_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='555') 555_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='222') 222_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='333bf') 333bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='333oh') 333oh_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='333fm') 333fm_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='333ft') 333ft_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='minx') minx_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='pyram') pyram_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='sq1') sq1_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='clock') clock_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='skewb') skewb_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='666') 666_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='777') 777_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='444bf') 444bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='555bf') 555bf_p,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM Points p WHERE p.competitionId=c.id AND eventId='333mbf') 333mbf_p
FROM (SELECT DISTINCT competitionId id FROM Points) c ORDER BY totalPoints DESC LIMIT 50);


SELECT id, name,
(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id) totalPoints
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='333') `333`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='444') `444`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='555') `555`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='222') `222`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='333bf') `333bf`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='333oh') `333oh`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='333fm') `333fm`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='333ft') `333ft`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='minx') `minx`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='pyram') `pyram`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='sq1') `sq1`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='clock') `clock`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='skewb') `skewb`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='666') `666`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='777') `777`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='444bf') `444bf`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='555bf') `555bf`
,(SELECT SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) FROM PersonEventPoints pep WHERE pep.id=p.id AND pep.eventId='333mbf') `333mbf`
FROM (SELECT DISTINCT id, name FROM PersonEventPoints) p ORDER BY totalPoints DESC LIMIT 25;

SELECT id,name, SUM(compPoints)+SUM(wrSinglePoints)+SUM(wrAveragePoints)+SUM(crSinglePoints)+SUM(crAveragePoints)+SUM(nrSinglePoints)+SUM(nrAveragePoints) points
FROM (SELECT * FROM PersonEventPoints WHERE eventId in ('444')) pep
GROUP BY id,name
ORDER BY points DESC
LIMIT 25;


SELECT * INTO OUTFILE '/tmp/compPointsPastYear.tsv' FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' FROM (
