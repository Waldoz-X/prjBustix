// -----------------------------------------------------------------------------
// Header.tsx
// Componente de cabecera para el dashboard. Muestra el breadcrumb, botones de notificación y configuración.
// Permite inyectar un slot a la izquierda (leftSlot) para personalización.
// -----------------------------------------------------------------------------
import { useSettings } from "@/store/settingStore";
import { cn } from "@/utils";
import type { ReactNode } from "react";
import BreadCrumb from "../components/bread-crumb";
import NoticeButton from "../components/notice";
import SettingButton from "../components/setting-button";

/**
 * Props para el componente Header.
 * @property leftSlot - Elemento React opcional que se muestra a la izquierda del breadcrumb.
 */
interface HeaderProps {
	leftSlot?: ReactNode;
}

/**
 * Componente Header (cabecera principal del dashboard)
 *
 * Estructura y personalización:
 * - leftSlot: Permite inyectar un elemento personalizado a la izquierda (por ejemplo, un botón de menú o logo).
 * - Breadcrumb: Se muestra solo si está habilitado en settings y en pantallas medianas o grandes.
 * - Botones a la derecha: Incluye notificaciones y configuración.
 *
 * Ejemplo de uso:
 * <Header leftSlot={<MiBotonMenu />} />
 *
 * El componente es sticky, siempre visible en la parte superior.
 */
export default function Header({ leftSlot }: HeaderProps) {
	// Obtiene el estado del breadcrumb desde el store de settings
	const { breadCrumb } = useSettings();
	return (
		<header
			data-slot="slash-layout-header"
			className={cn(
				"sticky top-0 left-0 right-0 z-app-bar",
				"flex items-center justify-between px-2 grow-0 shrink-0",
				"bg-background/60 backdrop-blur-xl",
				"h-[var(--layout-header-height)] ",
			)}
		>
			{/* Sección izquierda: slot personalizado y breadcrumb */}
			<div className="flex items-center">
				{leftSlot}

				{/* Breadcrumb solo visible en pantallas md+ y si está habilitado */}
				<div className="hidden md:block ml-4">{breadCrumb && <BreadCrumb />}</div>
			</div>

			{/* Sección derecha: botones de notificación y configuración */}
			<div className="flex items-center gap-1">
				<NoticeButton />
				<SettingButton />
			</div>
		</header>
	);
}
