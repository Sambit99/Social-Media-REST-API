import { createLogger, format, transports } from 'winston';
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports';
import util from 'util';
import config from '../config/config';
import { ApplicationEnviroment } from '../constant/application';
import path from 'path';
import * as sourceMapSupport from 'source-map-support';
import { blue, green, red, yellow, magenta } from 'colorette';

const colorizedLevel = (level: string) => {
  switch (level) {
    case 'ERROR':
      return red(level);
    case 'INFO':
      return blue(level);
    case 'WARN':
      return yellow(level);
    default:
      return level;
  }
};

sourceMapSupport.install();

const consoleLogFormat = format.printf((info) => {
  const { level, message, timestamp, meta = {} } = info;
  const customLevel = colorizedLevel(level.toUpperCase());
  const customTimestamp = green(timestamp as string);
  const customMessage = message;
  const customeMeta = util.inspect(meta, {
    showHidden: false,
    depth: null,
    colors: true
  });
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta('META')} ${customeMeta}\n`;
  return customLog;
});

const fileLogFormat = format.printf((info) => {
  const { level, message, timestamp, meta = {} } = info;
  const logMeta: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (value instanceof Error) {
      logMeta[key] = {
        name: value.name,
        message: value.message,
        trace: value.stack
      };
    } else {
      logMeta[key] = value;
    }
  }
  const logData = {
    level: colorizedLevel(level.toUpperCase()),
    message,
    timestamp: green(timestamp as string),
    meta: logMeta
  };
  return JSON.stringify(logData, null, 4);
});

const consoleTransport = (): Array<ConsoleTransportInstance> => {
  if (config.ENV === ApplicationEnviroment.PRODUCTION) return [];
  return [
    new transports.Console({
      level: 'info',
      format: format.combine(format.timestamp(), consoleLogFormat)
    })
  ];
};

const fileTransport = (): Array<FileTransportInstance> => {
  if (config.ENV === ApplicationEnviroment.PRODUCTION) return [];
  return [
    new transports.File({
      filename: path.join(__dirname, '../../logs', `${config.ENV}.log`),
      level: 'info',
      format: format.combine(format.timestamp(), fileLogFormat)
    })
  ];
};

export default createLogger({
  defaultMeta: { meta: {} },
  transports: [...consoleTransport(), ...fileTransport()]
});