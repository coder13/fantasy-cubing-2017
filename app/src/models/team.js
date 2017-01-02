const app = require('ampersand-app');
const Model = require('ampersand-model');
const xhr = require('xhr');
const shortid = require('shortid');
const Week = require('./week');

module.exports = window.Team = Model.extend({
	props: {
		id: {
			type: 'string'
			// test: (value) => shortid.isValid(value) ? false : 'Invalid id'
		},
		owner: 'number',
		name: 'string',
		league: 'string',
		points: 'number'
	},

	weeks: {},

	setCuber(slot, personId, eventId) {
		let self = this;
		xhr.put(`${app.apiURL}/teams/${this.id}/${slot}`, {body: JSON.stringify({eventId, slot, personId, teamId: this.id})}, function (err, res, body) {
			if (err) {
				return console.error(err);
			}

			if (res.body === null) {
				_.remove(self.cubers, c => c.slot === slot);
				self.trigger('change');
			} else if (res.statusCode < 400) {
				let cuber = JSON.parse(body);
				cuber.personId = personId;
				cuber.eventId = eventId;
				cuber.slot = slot;

				_.remove(self.cubers, c => c.slot === slot);
				self.cubers.push(cuber);

				self.trigger('change');
			}
		});
	},

	fetchWeek(weekNo, options) {
		let week = new Week({
			teamId: this.id,
			week: weekNo
		});

		week.on('change', () => {
			this.trigger('change');
		});

		week.fetch(options);
		this.weeks[weekNo] = week;
	},

	url () {
		return `${app.apiURL}/teams/${this.id || ''}`;
	}
});
