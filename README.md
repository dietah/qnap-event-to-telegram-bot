# qnap-event-to-telegram
What the name suggests, post events from the QNAP event logs to a Telegram chat.

## Backstory
Just a little backstory why this repo exists. I have a QNAP NAS system at home and it is running the IFTTT Agent so I could receive the NAS events via Telegram in order not to have the QNAP App installed and sending me push notifications. I also thought it was handy since it didn't involve a lot of extra work, just setting up an applet on IFTTT.
However, recently IFTTT decided to make more than 3 applets available as a payment subscription and I no longer thurst them handling my data for free. Next to that there is a significant delay in receiving the messages up to about 10 minutes, or if the IFTTT service fails you need to reconnect it.

I figured the IFTTT Agent could read the events from the NAS so I should be able to do the same as well, and even run everything locally. Now, my NAS model is too old to run Docker so I'm running everything on a Raspberry Pi 4B (4GB) with the files mounted to the Pi.

When doing some research I found this repo https://github.com/vincentcox/QNAP-pushover/blob/master/main.py and decided to take a similar approach in Node.js.

## Prerequisites
* Registeren your own Telegram bot via [@BotFather](https://core.telegram.org/bots#6-botfather)
* You will require your bot's token
* For my own convenience I have created a Telegram group chat that includes all my automation clients and bots
* You will need the chat id of that group, you can find some instructions online, [example](https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id)
* QNAP stores the events in /etc/event.log, this log file is an Sqlite3 database format
* Depending where you are running the code or Docker container you will need to map this file or folder

## The code
### Run locally
You can run the code by:
1. Make sure you have nodejs installed on your system
2. Run `npm install` (only needed the first time)
3. There's a catch, because of building incompatability for docker, it is not included in package.json so you need to run `npm install sqlite3` locally.
4. Run `npm start` or `node .`

Note about the catch, I am running the container on arm64 and wanted to use the node-alpine build. The sqlite3 lib is not pre-build for that combination so I had to use some workarounds in my Dockerfile to achieve this and thus avoiding it being installed with the normal `npm install`.

### Docker
You should be able to build the Docker container locally but take note of the cpu architecture you are building it on.
```
docker build -t deetoreu/qnap-event-to-telegram-bot:latest .
```

## Deployment
The docker container is available on Docker Hub: https://hub.docker.com/r/deetoreu/qnap-event-to-telegram-bot

### Environment variables
These variables can be passed to the image from kubernetes.yaml or docker-compose.yml as needed:

Variable | Type | Default | Description |
-------- | ---- | ------- | ----------- |
LOG_LEVEL | String | DEBUG | log4js debug level, choices are: OFF, FATAL, ERROR, WARN, INFO, DEBUG, TRACE, ALL, but I reccomend keeping it on DEBUG
TELEGRAM_TOKEN | String |  | Your Telegram Bot token
TELEGRAM_CHAT_ID | String |  | Your Telegram Chat ID where you want the events to appear
EVENT_INTERVAL | Number | 60 * 1000 | Interval to check the event log for new events, in [ms]
EVENT_TABLE | String | NASLOG_EVENT | In case the table would be named differently on your system
EVENT_DB | String | event.log | The filename of the database

### Log files
Everything is logged on the console but also saved to a file per day.
If you want your logs to be persistent you can map a volume to `/usr/src/app/logs`

### Docker
docker run example:
```
docker run -e TELEGRAM_TOKEN=123456789:XXXXXXXXXXXXXXXXXX -e TELEGRAM_CHAT_ID=-123456789 -v ~/Documents/tmp/logs:/usr/src/app/logs -v ~/Documents/tmp/db:/usr/src/app/db deetoreu/qnap-event-to-telegram-bot:latest
```
or add the detach `-d` flag to run in the background

docker-compose.yml example:
```yaml
version: '3.6'
services:
  qnap-event-to-telegram-bot:
    container_name: qnap-events
    image: deetoreu/qnap-event-to-telegram-bot
    restart: unless-stopped
    environment:
      TELEGRAM_TOKEN: "123456789:XXXXXXXXXXXXXXXXXX"
      TELEGRAM_CHAT_ID: "-123456789"
      NTBA_FIX_319: 1 # https://github.com/yagop/node-telegram-bot-api/issues/484
    volumes:
      - ./volumes/qnap/logs:/usr/src/app/logs
      - ./volumes/qnap/db/:/usr/src/app/db/
```
apply with `docker-compose -f docker-compose.yml up -d`

---

Feel free to contact me or make an issue if you have a question.
