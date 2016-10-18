--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wca_id` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `avatar` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6302 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(10)  COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `team_id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `eventId` varchar(6) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `personId` varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT ''
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6302 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
