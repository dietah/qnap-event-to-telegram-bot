const moment = require('moment');
require('moment-duration-format');

module.exports = {
	getCurrentTimestamp,
	getProjectRoot,
	time
};

function getCurrentTimestamp() {
	return moment().format('YYYY-MM-DD-HH-mm-ss');
}

function getProjectRoot() {
	const directory = __dirname.split('/');

	return directory.join('/');
}

function time(startDateTime, endDateTime) {
	const duration = moment.duration(endDateTime.diff(startDateTime));
	if (duration < 1000) {
		return duration.format('S [ms]');
	}

	return duration.format('h [hours] m [minutes] s [seconds]');
}
