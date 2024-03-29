const envalid = require('envalid'); // eslint-disable-line object-curly-newline

/* eslint-disable key-spacing */

module.exports = envalid.cleanEnv(process.env, {
	LOG_LEVEL: 						envalid.str({ choices: ['OFF', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'ALL'], default: 'INFO', devDefault: 'DEBUG' }),

	TELEGRAM_TOKEN: 				envalid.str({ desc: 'Telegram Bot API Token' }),
	TELEGRAM_CHAT_ID:				envalid.str({ desc: 'Telegram Chat ID' }),
	TELEGRAM_SILTENT_EVENTS_REGEX:	envalid.str({ default: '', desc: 'Regex for events that should receive a silent alert' }),
	TELEGRAM_DISCARD_EVENTS_REGEX:	envalid.str({ default: '', desc: 'Regex for events that should not be send' }),

	EVENT_INTERVAL:					envalid.num({ default: 60 * 1000, desc: 'Interval to check event log for new events' }),
	EVENT_TABLE:					envalid.str({ default: 'NASLOG_EVENT', desc: 'The table where the event logs are stored' }),
	EVENT_DB:						envalid.str({ default: 'event.log', desc: 'The name of the database' }),
}, {
	strict: true
});
