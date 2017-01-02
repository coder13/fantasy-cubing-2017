const app = require('ampersand-app');
const Model = require('ampersand-model');
const xhr = require('xhr');
const shortid = require('shortid');

/*
 * Team configuration for a given week
*/
module.exports = Model.extend({
	props: {
		teamId: 'string',
		week: 'number',
		owner: 'number',
		name: 'string',
		points: 'number',
		cubers: {
			type: 'array',
			default: () => ({})
		}
	},

	setCuber(slot, personId, eventId) {
		let self = this;
		xhr.put(this.url(), {body: JSON.stringify({eventId, slot, personId, week: this.week, teamId: this.teamId})}, (err, res, body) => {
			if (err) {
				return console.error(err);
			}

			if (res.body === null) {
				_.remove(this.cubers, c => c.slot === slot);
				this.trigger('change');
			} else if (res.statusCode < 400) {
				let cuber = JSON.parse(body);
				cuber.personId = personId;
				cuber.eventId = eventId;
				cuber.slot = slot;

				_.remove(this.cubers, c => c.slot === slot);
				this.cubers.push(cuber);

				this.trigger('change');
			}
		});
	},

	url () {
		return `${app.apiURL}/teams/${this.teamId}/week/${this.week}`;
	}
});
