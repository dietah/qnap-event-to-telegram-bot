import Database from 'sqlite-async';
import TG from 'node-telegram-bot-api';

import logger from './logger.js';
import config from './env.js';

const consoleConfig = { ...config, TELEGRAM_TOKEN: '[REDACTED]', TELEGRAM_CHAT_ID: '[REDACTED]' };
logger.info('environment variables:\n', consoleConfig);

let latestEventId;

(async () => {
	// init Telegram
	const telegram = new TG(config.TELEGRAM_TOKEN);

	// open the database and fetch latest event id on startup
	const dbConfig = `db/${config.EVENT_DB}`;
	const db = await Database.open(dbConfig, Database.OPEN_READONLY);
	const { id } = await db.get(`SELECT max(event_id) AS id FROM ${config.EVENT_TABLE} ORDER BY event_id DESC;`);
	logger.info(`Most recent event id is ${id}`);
	latestEventId = id;
	await db.close();

	// start checking process
	setInterval(() => processEventLog(dbConfig, telegram), config.EVENT_INTERVAL);
})();

async function processEventLog(dbConfig, telegram) {
	logger.debug('Checking for new events');
	const db = await Database.open(dbConfig, Database.OPEN_READONLY);

	// limit events per 5 to avoid too many requests on the telegram bot api
	const results = await db.all(`SELECT * FROM ${config.EVENT_TABLE} WHERE event_id > ${latestEventId} ORDER BY event_id ASC LIMIT 5;`);

	for (const { event_id: id, event_date: date, event_time: time, event_desc: desc } of results) {
		if (!RegExp(config.TELEGRAM_DISCARD_EVENTS_REGEX, 'g').test(desc)) {
			try {
				await telegram.sendMessage(
					config.TELEGRAM_CHAT_ID,
					`QNAP System event at ${date} <b>${time}</b>:\n\n<pre>${desc.replace(/(<->|lt-gt)/g, '↔').replace(/(<-|-lt)/g, '←').replace(/(->|-gt)/g, '→').replace(/&/g, '&amp;')}</pre>`,
					{
						parse_mode: 'HTML',
						disable_notification: `${RegExp(config.TELEGRAM_SILTENT_EVENTS_REGEX, 'g').test(desc)}`
					}
				);

				logger.info(`Processed new event_id ${id}`);
				latestEventId = id;
			} catch (error) {
				logger.error(`Message not send for event_id ${id}`, error);
			}
		}
	}

	await db.close();
}
