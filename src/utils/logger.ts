// Simple logger que silencia logs en producción
const isDev = typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : true;

export const logger = {
	debug: (...args: any[]) => {
		if (isDev) console.debug(...args);
	},
	info: (...args: any[]) => {
		if (isDev) console.info(...args);
	},
	warn: (...args: any[]) => {
		if (isDev) console.warn(...args);
	},
	error: (...args: any[]) => {
		if (isDev) console.error(...args);
	},
};

export default logger;
