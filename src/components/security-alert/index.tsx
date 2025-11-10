/**
 * Componente de Alerta de Seguridad
 * Muestra alertas importantes sin exponer detalles técnicos
 */

import { AlertTriangle, CheckCircle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/utils";

export enum AlertSeverity {
	INFO = "info",
	SUCCESS = "success",
	WARNING = "warning",
	ERROR = "error",
}

interface SecurityAlertProps {
	severity: AlertSeverity;
	title: string;
	message: string;
	className?: string;
	onDismiss?: () => void;
}

const severityConfig = {
	[AlertSeverity.INFO]: {
		icon: Info,
		bgColor: "bg-blue-50 dark:bg-blue-950",
		borderColor: "border-blue-200 dark:border-blue-800",
		textColor: "text-blue-800 dark:text-blue-200",
		iconColor: "text-blue-500",
	},
	[AlertSeverity.SUCCESS]: {
		icon: CheckCircle,
		bgColor: "bg-green-50 dark:bg-green-950",
		borderColor: "border-green-200 dark:border-green-800",
		textColor: "text-green-800 dark:text-green-200",
		iconColor: "text-green-500",
	},
	[AlertSeverity.WARNING]: {
		icon: AlertTriangle,
		bgColor: "bg-yellow-50 dark:bg-yellow-950",
		borderColor: "border-yellow-200 dark:border-yellow-800",
		textColor: "text-yellow-800 dark:text-yellow-200",
		iconColor: "text-yellow-500",
	},
	[AlertSeverity.ERROR]: {
		icon: ShieldAlert,
		bgColor: "bg-red-50 dark:bg-red-950",
		borderColor: "border-red-200 dark:border-red-800",
		textColor: "text-red-800 dark:text-red-200",
		iconColor: "text-red-500",
	},
};

export function SecurityAlert({ severity, title, message, className, onDismiss }: SecurityAlertProps) {
	const config = severityConfig[severity];
	const Icon = config.icon;

	return (
		<div className={cn("rounded-lg border p-4", config.bgColor, config.borderColor, className)}>
			<div className="flex items-start gap-3">
				<Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)} />
				<div className="flex-1">
					<h5 className={cn("font-semibold mb-1", config.textColor)}>{title}</h5>
					<p className={cn("text-sm", config.textColor)}>{message}</p>
				</div>
				{onDismiss && (
					<button
						type="button"
						onClick={onDismiss}
						className={cn("flex-shrink-0 hover:opacity-70 transition-opacity", config.textColor)}
					>
						<span className="sr-only">Cerrar</span>×
					</button>
				)}
			</div>
		</div>
	);
}
