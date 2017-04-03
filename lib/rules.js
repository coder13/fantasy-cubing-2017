
// TODO: abstract a ton for multiple seasons / leagues
const season = module.exports.season = function (week) {
	return week < 14 ? 1 : 2;
};

module.exports.getClasses = function (week) {
	if (season(week) === 1) {
		return [{
			name: '3x3',
			slots: 2,
			events: ['333']
		}, {
			name: 'Main Events',
			slots: 4,
			events: ['444', '555', '222', 'skewb', 'pyram', '333oh', '333bf']
		}, {
			name: 'Side Events',
			slots: 4,
			events: ['333fm', '333ft', 'minx', 'sq1', 'clock', '666', '777', '444bf', '555bf', '333mbf']
		}];
	} else {
		return [{
			name: '3x3',
			slots: 3,
			events: ['333']
		}, {
			name: 'Small Events',
			slots: 4,
			events: ['222', 'pyram', 'skewb', '333ft']
		}, {
			name: 'Medium Events',
			slots: 3,
			events: ['333oh', 'sq1', 'clock', '333bf', '444bf', '555bf']
		}, {
			name: 'Big Events',
			slots: 4,
			events: ['444', '555', '666', '777', 'minx', '333fm', '333mbf']
		}];
	}
};

module.exports.canPickCuberForSlot = function (classes, slot, eventId) {
	for (let i = 0, s = 0; i < classes.length; i++) {
		s += classes[i].slots;
		if (s > slot) {
			return classes[i].events.indexOf(eventId) > -1;
		}
	}
};
