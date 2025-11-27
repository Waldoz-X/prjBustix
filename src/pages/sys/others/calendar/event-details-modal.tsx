import dayjs from "dayjs";
import { Icon } from "@/components/icon";

import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import { Text } from "@/ui/typography";

type EventDetails = {
	id: string;
	title: string;
	description?: string;
	start: Date;
	end?: Date;
	color?: string;
	recinto?: string;
	ciudad?: string;
	image?: string;
	tipoEvento?: string;
};

type Props = {
	open: boolean;
	event: EventDetails | null;
	onClose: VoidFunction;
};

export default function EventDetailsModal({ open, event, onClose }: Props) {
	if (!event) return null;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md p-0 overflow-hidden border-none">
				{/* Header Image */}
				<div className="relative h-48 w-full bg-gray-100">
					{event.image ? (
						<img src={event.image} alt={event.title} className="w-full h-full object-cover" />
					) : (
						<div className="w-full h-full flex items-center justify-center bg-primary/10">
							<Icon icon="solar:calendar-bold-duotone" size={64} className="text-primary/40" />
						</div>
					)}

					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
						<Text className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
							{event.tipoEvento || "Evento"}
						</Text>
						<DialogTitle className="text-white text-xl font-bold leading-tight">{event.title}</DialogTitle>
					</div>
				</div>

				<div className="p-6 space-y-4">
					{/* Date & Time */}
					<div className="flex items-start gap-3">
						<div className="p-2 bg-primary/10 rounded-lg text-primary">
							<Icon icon="solar:clock-circle-bold-duotone" size={24} />
						</div>
						<div>
							<Text className="font-semibold text-foreground">Fecha y Hora</Text>
							<Text className="text-muted-foreground text-sm">
								{dayjs(event.start).format("dddd, D [de] MMMM [de] YYYY")}
							</Text>
							<Text className="text-muted-foreground text-sm">
								{dayjs(event.start).format("h:mm A")}
								{event.end && ` - ${dayjs(event.end).format("h:mm A")}`}
							</Text>
						</div>
					</div>

					{/* Location */}
					{(event.recinto || event.ciudad) && (
						<div className="flex items-start gap-3">
							<div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
								<Icon icon="solar:map-point-bold-duotone" size={24} />
							</div>
							<div>
								<Text className="font-semibold text-foreground">Ubicación</Text>
								{event.recinto && <Text className="text-muted-foreground text-sm">{event.recinto}</Text>}
								{event.ciudad && <Text className="text-muted-foreground text-sm">{event.ciudad}</Text>}
							</div>
						</div>
					)}

					{/* Description */}
					{event.description && (
						<div className="flex items-start gap-3">
							<div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
								<Icon icon="solar:document-text-bold-duotone" size={24} />
							</div>
							<div>
								<Text className="font-semibold text-foreground">Descripción</Text>
								<Text className="text-muted-foreground text-sm leading-relaxed mt-1">{event.description}</Text>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
