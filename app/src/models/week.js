const app = require('ampersand-app');
const Model = require('ampersand-model');
const xhr = require('xhr');
const shortid = require('shortid');
const Owner = require('./owner');
const League = require('./league');

/*
 * Team configuration for a given week
*/
module.exports = Model.extend({
	props: {
		teamId: 'string',
		week: 'number',
		name: 'string',
		points: 'number',
		picks: {
			type: 'array',
			default: () => []
		}
	},

	children: {
		owner: Owner,
		league: League
	},

	setPick(slot, personId, eventId) {
		let self = this;

		xhr.put(this.url(), {body: JSON.stringify({eventId, slot, personId, owner: this.owner, week: this.week, teamId: this.teamId})}, (err, res, body) => {
			if (err) {
				return console.error(err);
			}

			if (res.body === null) {
				_.remove(this.picks, c => c.slot === slot);
				this.trigger('change');
			} else if (res.statusCode < 400) {
				let cuber = JSON.parse(body);
				cuber.personId = personId;
				cuber.eventId = eventId;
				cuber.slot = slot;

				_.remove(this.picks, c => c.slot === slot);
				this.picks.push(cuber);

				this.trigger('change');
			}
		});
	},

	url () {
		return `${app.apiURL}/teams/${this.teamId}/week/${this.week}`;
	}
});
