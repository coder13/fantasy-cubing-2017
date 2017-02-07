const _ = require('lodash');

module.exports = function (bookshelf, db) {
	const {knex} = db;

	db.Team = bookshelf.Model.extend({
		tableName: 'Teams',
		hasTimestamps: ['createdAt', 'updatedAt'],

		owner () {
			return this.hasOne(db.User, 'teamId', {
				withRelated: 'owner'
			});
		},

		getPicks (week) {
			let points = knex('Points')
				.select('personId', 'eventId', knex.raw('TRUNCATE(AVG(totalPoints), 2) AS points'))
				.where({week, year: 2017})
				.groupBy('personId', 'eventId');

			return knex('Picks')
				.leftJoin('Persons', 'Persons.id', 'Picks.personId')
				.leftJoin(points.as('points'), function () {
					this.on('points.personId', '=', 'Picks.personId')
							.on('points.eventId', '=', 'Picks.eventId');
				})
				.select('Picks.eventId', 'Picks.slot','Picks.personId', 'Persons.name', 'Persons.countryId', 'points')
				.where({teamId: this.id, week, subid: 1});
		}
	}, {
		getWithOwner (id) {
			return new db.Team({id}).fetch({
				withRelated: ['owner']
			}).then(function (team) {
				return _.extend({team, owner: team.related('owner')});
			});
		},

		masks: {
			json: 'id,league,owner,name,points'
		}
	});

	db.Teams = bookshelf.Collection.extend({
		model: db.Team
	});
};
