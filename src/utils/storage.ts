import type { StorageEnum } from "#/enum";
import { logger } from "./logger";

export const getItem = <T>(key: StorageEnum): T | null => {
	let value = null;
	try {
		const result = window.localStorage.getItem(key);
		if (result) {
			value = JSON.parse(result);
		}
	} catch (error) {
		logger.error(error);
	}
	return value;
};

export const getStringItem = (key: StorageEnum): string | null => {
	return localStorage.getItem(key);
};

export const setItem = <T>(key: StorageEnum, value: T): void => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		logger.error("Error setting item to localStorage:", error);
	}
};
export const removeItem = (key: StorageEnum): void => {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		logger.error("Error removing item from localStorage:", error);
	}
};
export const clearItems = () => {
	try {
		localStorage.clear();
	} catch (error) {
		logger.error("Error clearing localStorage:", error);
	}
};
