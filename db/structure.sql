--
-- Table structure for table `users`
-- todo: figure out how to remove the need to set FOREIGN_KEY_CHECKS to 0
--

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `wca_id` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `avatar` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `elo` int(11) COLLATE utf8_unicode_ci NOT NULL DEFAULT 500,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `owner` int(11) NOT NULL,
  `name` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `teamPeople`;
CREATE TABLE `teamPeople` (
  `teamId` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `owner` int(11)  COLLATE utf8_unicode_ci NOT NULL,
  `eventId` varchar(6) COLLATE utf8_unicode_ci NOT NULL,
  `slot` int(11) COLLATE utf8_unicode_ci NOT NULL,
  `personId` varchar(10) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
