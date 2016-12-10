const app = require('ampersand-app');
const Model = require('ampersand-model');
const xhr = require('xhr');
const shortid = require('shortid');

module.exports = window.Team = Model.extend({
	props: {
		id: {
			type: 'string'
			// test: (value) => shortid.isValid(value) ? false : 'Invalid id'
		},
		owner: 'number',
		name: 'string',
		league: 'string',
		points: 'number',
		cubers: {
			type: 'object',
			default: () => ({})
		}
	},

	setCuber(eventId, slot, personId) {
		let self = this;
		xhr.put(`${app.apiURL}/teams/${this.id}/${eventId}/${slot}`, {body: JSON.stringify({eventId, slot, personId, teamId: this.id})}, function (err, res, body) {
			if (err) {
				return console.error(err);
			}

			if (res.body === null) {
				delete self.cubers[`${eventId}-${slot}`];
				self.trigger('change');
			} else if (res.statusCode < 400) {
				let cuber = JSON.parse(body);
				cuber.personId = personId;
				self.cubers[`${eventId}-${slot}`] = cuber;
				self.trigger('change');
			}
		});
	},

	fetch(options) {
		options = options || {};
		this.week = options.week || app.currentWeek();
		return Model.prototype.fetch.apply(this, arguments);
	},

	url () {
		return `${app.apiURL}/teams/${this.id || ''}${this.week ? `?week=${this.week}` : ''}`;
	}
});
