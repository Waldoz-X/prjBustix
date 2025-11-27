import type { EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import eventosService from "@/api/services/eventosService";
import { down, useMediaQuery } from "@/hooks";
import { useSettings } from "@/store/settingStore";
import { Card, CardContent } from "@/ui/card";

import CalendarEvent from "./calendar-event";
import CalendarHeader, { type HandleMoveArg, type ViewType } from "./calendar-header";
import EventDetailsModal from "./event-details-modal";
import { StyledCalendar } from "./styles";

export default function Calendar() {
	const fullCalendarRef = useRef<FullCalendar>(null);
	const [view, setView] = useState<ViewType>("dayGridMonth");
	const [date, setDate] = useState(new Date());
	const [open, setOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<any>(null);

	const { themeMode } = useSettings();
	const xsBreakPoint = useMediaQuery(down("xs"));

	// --- 1. Fetch Events from API ---
	const { data: eventsData } = useQuery({
		queryKey: ["calendar-events"],
		queryFn: () => eventosService.getAllEventos(),
	});

	// --- 2. Map API Data to Calendar Events ---
	const calendarEvents = useMemo<EventInput[]>(() => {
		if (!eventsData) return [];

		return eventsData.map((event) => {
			// Combinar fecha y hora inicio
			const startDateTime = dayjs(event.fecha)
				.hour(parseInt(event.horaInicio.split(":")[0]))
				.minute(parseInt(event.horaInicio.split(":")[1]))
				.toDate();

			// Estimar fin (3 horas después)
			const endDateTime = dayjs(startDateTime).add(3, "hour").toDate();

			// Asignar color basado en tipo de evento (simple hash o random consistente)
			const colors = ["#00a76f", "#8e33ff", "#00b8d9", "#ffab00", "#ff5630"];
			const colorIndex = event.eventoID % colors.length;

			return {
				id: event.eventoID.toString(),
				title: event.nombre,
				start: startDateTime,
				end: endDateTime,
				color: colors[colorIndex],
				allDay: false,
				extendedProps: {
					description: event.descripcion,
					recinto: event.recinto,
					ciudad: event.ciudad,
					image: event.urlImagen,
					tipoEvento: event.tipoEvento,
				},
			};
		});
	}, [eventsData]);

	useEffect(() => {
		if (xsBreakPoint) {
			setView("listWeek");
		}
	}, [xsBreakPoint]);

	/**
	 * calendar header events
	 */
	const handleMove = (action: HandleMoveArg) => {
		const calendarApi = fullCalendarRef.current?.getApi();
		if (!calendarApi) return;
		switch (action) {
			case "prev":
				calendarApi.prev();
				break;
			case "next":
				calendarApi.next();
				break;
			case "today":
				calendarApi.today();
				break;
			default:
				break;
		}
		setDate(calendarApi.getDate());
	};

	const handleViewTypeChange = (view: ViewType) => {
		setView(view);
	};

	useLayoutEffect(() => {
		const calendarApi = fullCalendarRef.current?.getApi();
		if (!calendarApi) return;
		setTimeout(() => {
			calendarApi.changeView(view);
		});
	}, [view]);

	/**
	 * calendar event events
	 */
	const handleEventClick = (arg: EventClickArg) => {
		const { title, extendedProps, start, end, backgroundColor, id } = arg.event;
		setOpen(true);
		setSelectedEvent({
			id,
			title,
			start: start,
			end: end,
			color: backgroundColor,
			description: extendedProps.description,
			recinto: extendedProps.recinto,
			ciudad: extendedProps.ciudad,
			image: extendedProps.image,
			tipoEvento: extendedProps.tipoEvento,
		});
	};

	return (
		<>
			<Card className="h-full w-full">
				<CardContent className="h-full w-full">
					<StyledCalendar $themeMode={themeMode}>
						<CalendarHeader now={date} view={view} onMove={handleMove} onViewTypeChange={handleViewTypeChange} />
						<FullCalendar
							ref={fullCalendarRef}
							plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
							initialDate={date}
							initialView={xsBreakPoint ? "listWeek" : view}
							events={calendarEvents}
							eventContent={CalendarEvent}
							editable={false} // Read-only
							selectable={false} // Read-only
							selectMirror={false}
							dayMaxEvents
							headerToolbar={false}
							eventClick={handleEventClick}
						/>
					</StyledCalendar>
				</CardContent>
			</Card>

			<EventDetailsModal
				open={open}
				event={selectedEvent}
				onClose={() => {
					setOpen(false);
					setSelectedEvent(null);
				}}
			/>
		</>
	);
}
