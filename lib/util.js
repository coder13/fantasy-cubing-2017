module.exports.unflatten = function(data) {
	if (Object(data) !== data || Array.isArray(data)) {
		return data;
	}

	let regex = /\.?([^.\[\]]+)|\[(\d+)\]/g;
	let resultholder = {};
	for (let p in data) {
		let cur = resultholder;
		let prop = '';
		let m;

		while (m = regex.exec(p)) {
			cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
			prop = m[2] || m[1];
		}
		cur[prop] = data[p];
	}
	return resultholder[''] || resultholder;
};
