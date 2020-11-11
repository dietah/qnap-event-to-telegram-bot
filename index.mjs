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

	// open the database
	const db = await open({
		filename: `db/${config.EVENT_DB}`,
		driver: sqlite3.Database
	});

	const { id } = await db.get(`SELECT max(event_id) AS id FROM ${config.EVENT_TABLE} ORDER BY event_id DESC;`);
	logger.info(`Most recent event id is ${id}`);
	latestEventId = id;

	setInterval(() => processEventLog(db, telegram), config.EVENT_INTERVAL);
})();

async function processEventLog(db, telegram) {
	logger.debug('Checking for new events');
	const results = await db.all(`SELECT * FROM ${config.EVENT_TABLE} WHERE event_id > ${latestEventId} ORDER BY event_id ASC;`);

	for (const { event_id: id, event_date: date, event_time: time, event_desc: desc } of results) {
		try {
			await telegram.sendMessage({
				chat_id: config.TELEGRAM_CHAT_ID,
				text: `QNAP System event at ${date.replace(/-/g, '\\-')} ${time}:\\\n\\\n\`\`\`${desc}\`\`\``,
				parse_mode: 'MarkdownV2',
				disable_notification: desc.includes('Failed to upload file')
			});

			logger.info(`Processed new event_id ${id}`);
			latestEventId = id;
		} catch (error) {
			logger.error(error);
		}

	}
}
