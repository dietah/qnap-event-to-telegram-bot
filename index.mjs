import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import TG from 'telegram-bot-api';

import logger from './logger.js';
import config from './env.js';

const consoleConfig = { ...config, TELEGRAM_TOKEN: '[REDACTED]', TELEGRAM_CHAT_ID: '[REDACTED]' };
logger.info('environment variables:\n', consoleConfig);

let latestEventId;

(async () => {
	// init Telegram
	const telegram = new TG({
		token: config.TELEGRAM_TOKEN
	});

	const dbConfig = {
		filename: `db/${config.EVENT_DB}`,
		driver: sqlite3.Database
	};

	// open the database and fetch latest event id on startup
	const db = await open(dbConfig);

	const { id } = await db.get(`SELECT max(event_id) AS id FROM ${config.EVENT_TABLE} ORDER BY event_id DESC;`);
	logger.info(`Most recent event id is ${id}`);
	latestEventId = id;
	await db.close();

	// start checking process
	setInterval(() => processEventLog(dbConfig, telegram), config.EVENT_INTERVAL);
})();

async function processEventLog(dbConfig, telegram) {
	logger.debug('Checking for new events');
	const db = await open(dbConfig);

	// limit events per 5 to avoid too many requests on the telegram bot api
	const results = await db.all(`SELECT * FROM ${config.EVENT_TABLE} WHERE event_id > ${latestEventId} ORDER BY event_id ASC LIMIT 5;`);

	for (const { event_id: id, event_date: date, event_time: time, event_desc: desc } of results) {
		try {
			await telegram.sendMessage({
				chat_id: config.TELEGRAM_CHAT_ID,
				text: `QNAP System event at ${date} <b>${time}</b>:\n\n<pre>${desc.replace(/<->/g, '⟷').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;')}</pre>`,
				parse_mode: 'HTML',
				disable_notification: `${desc.includes('Failed to upload file')}`
			});

			logger.info(`Processed new event_id ${id}`);
			latestEventId = id;
		} catch (error) {
			logger.error(`Message not send for event_id ${id}`, error);
		}
	}
}
