const app = require('ampersand-app');
const Model = require('ampersand-model');
const xhr = require('xhr');
const shortid = require('shortid');

module.exports = window.Team = Model.extend({
	props: {
		id: {
			type: 'string',
			test: (value) => !shortid.isValid(value)
		},
		owner: 'number',
		name: 'string',
		cubers: {
			type: 'object',
			default: () => ({})
		}
	},

	setCuber(eventId, slot, personId) {
		xhr.put(`${app.apiURL}/teams/${this.owner}/${eventId}/${slot}`, {body: JSON.stringify({eventId, slot, personId, teamId: this.id})}, (err, res, body) => {
			if (err) {
				return console.error(err);
			}

			let cuber = JSON.parse(body);
			cuber.personId = personId;
			this.cubers[`${eventId}-${slot}`] = cuber;
			this.trigger('change');
		});
	},

	url () {
		return `${app.apiURL}/teams/${this.owner}`;
	}
});
