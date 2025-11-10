/**
 * Utilidades de seguridad para sanitización y validación
 */

/**
 * Sanitiza un email removiendo caracteres peligrosos
 */
export function sanitizeEmail(email: string): string {
	return email
		.trim()
		.toLowerCase()
		.replace(/[<>]/g, "") // Remover caracteres peligrosos
		.substring(0, 254); // Límite estándar de email
}

/**
 * Valida que el password cumpla requisitos mínimos
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
	if (!password || password.length < 8) {
		return { valid: false, message: "La contraseña debe tener al menos 8 caracteres" };
	}

	if (password.length > 128) {
		return { valid: false, message: "La contraseña es demasiado larga" };
	}

	// Verificar que no contenga caracteres nulos o de control
	// biome-ignore lint/suspicious/noControlCharactersInRegex: Necesitamos validar caracteres de control
	if (/[\x00-\x1F\x7F]/.test(password)) {
		return { valid: false, message: "La contraseña contiene caracteres no válidos" };
	}

	return { valid: true };
}

/**
 * Sanitiza texto general removiendo scripts y caracteres peligrosos
 */
export function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/<script[^>]*>.*?<\/script>/gi, "") // Remover scripts
		.replace(/<[^>]+>/g, "") // Remover HTML tags
		.replace(/javascript:/gi, "") // Remover javascript:
		.replace(/on\w+\s*=/gi, "") // Remover event handlers
		.substring(0, 1000); // Límite general
}

/**
 * Limita intentos de login (simple rate limiting en cliente)
 */
class LoginAttemptTracker {
	private attempts: number[] = [];
	private readonly maxAttempts = 5;
	private readonly timeWindow = 15 * 60 * 1000; // 15 minutos
	private readonly lockoutTime = 15 * 60 * 1000; // 15 minutos de bloqueo
	private readonly storageKey = "login_attempts";

	constructor() {
		// Cargar intentos previos del localStorage
		this.loadAttempts();
	}

	private loadAttempts(): void {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (stored) {
				this.attempts = JSON.parse(stored);
			}
		} catch (_error) {
			this.attempts = [];
		}
	}

	private saveAttempts(): void {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.attempts));
		} catch (error) {
			console.error("Error saving login attempts", error);
		}
	}

	canAttemptLogin(): { allowed: boolean; remainingAttempts?: number; waitTime?: number } {
		const now = Date.now();

		// Limpiar intentos antiguos
		this.attempts = this.attempts.filter((time) => now - time < this.timeWindow);
		this.saveAttempts();

		if (this.attempts.length >= this.maxAttempts) {
			const oldestAttempt = this.attempts[0];
			const waitTime = Math.ceil((this.lockoutTime - (now - oldestAttempt)) / 1000 / 60);
			return {
				allowed: false,
				waitTime,
			};
		}

		return {
			allowed: true,
			remainingAttempts: this.maxAttempts - this.attempts.length,
		};
	}

	/**
	 * Obtiene el tiempo restante de bloqueo en segundos
	 */
	getRemainingLockoutTime(): number {
		const now = Date.now();
		this.attempts = this.attempts.filter((time) => now - time < this.timeWindow);

		if (this.attempts.length >= this.maxAttempts) {
			const oldestAttempt = this.attempts[0];
			return Math.max(0, Math.ceil((this.lockoutTime - (now - oldestAttempt)) / 1000));
		}

		return 0;
	}

	/**
	 * Verifica si está bloqueado
	 */
	isLocked(): boolean {
		return this.getRemainingLockoutTime() > 0;
	}

	recordAttempt(): void {
		this.attempts.push(Date.now());
		this.saveAttempts();
	}

	reset(): void {
		this.attempts = [];
		localStorage.removeItem(this.storageKey);
	}
}

export const loginAttemptTracker = new LoginAttemptTracker();
