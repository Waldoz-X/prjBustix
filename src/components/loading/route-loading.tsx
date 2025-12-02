import { useEffect, useRef, useState } from "react";
import { Progress } from "@/ui/progress";

export function RouteLoadingProgress() {
	const [progress, setProgress] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

	useEffect(() => {
		// Limpiar timers anteriores
		if (timerRef.current) clearTimeout(timerRef.current);
		if (intervalRef.current) clearInterval(intervalRef.current);

		// Resetear progress al cambiar de ruta
		setProgress(0);

		// Iniciar barra de progreso
		intervalRef.current = setInterval(() => {
			setProgress((prev) => Math.min(prev + 2, 90)); // No sobrepasar 90 hasta completar
		}, 5);

		// Completar la barra después de 500ms
		timerRef.current = setTimeout(() => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			setProgress(100);
			// Ocultar barra después de completarse
			setTimeout(() => setProgress(0), 100);
		}, 500);

		// Cleanup
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	return progress > 0 ? (
		<div className="fixed top-0 left-0 right-0 z-tooltip w-screen pointer-events-none">
			<Progress value={progress} className="h-[3px] shadow-2xl" />
		</div>
	) : null;
}
