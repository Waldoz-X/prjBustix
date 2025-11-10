// filepath: c:\Users\sierr\WebstormProjects\prjbustix\src\pages\landing\tours.tsx
// -----------------------------------------------------------------------------
// landing/tours.tsx
// Página de tours disponibles - BusTix - Cartelera de eventos mejorada
// -----------------------------------------------------------------------------

import { useState } from "react";
import { useNavigate } from "react-router";
// Importar imágenes de eventos
import event1 from "@/assets/images/landing/event/event_1.png";
import event2 from "@/assets/images/landing/event/event_2.png";
import event3 from "@/assets/images/landing/event/event_3.png";
import event4 from "@/assets/images/landing/event/event_4.png";
import event5 from "@/assets/images/landing/event/event_5.png";
import event6 from "@/assets/images/landing/event/event_6.png";
import event7 from "@/assets/images/landing/event/event_7.png";
import event8 from "@/assets/images/landing/event/event_8.png";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

export default function Tours() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [filterCategoria, setFilterCategoria] = useState("Todos");

	const handleReservar = () => {
		navigate("/auth/login");
	};

	const handleEventoPersonalizado = () => {
		navigate("/auth/login");
	};

	const tours = [
		{
			id: 1,
			evento: "Festival Corona Capital 2025",
			artistas: ["The Killers", "Arctic Monkeys", "Tame Impala"],
			fecha: "15-17 Noviembre 2025",
			ubicacion: "Autódromo Hermanos Rodríguez, CDMX",
			precio: 890,
			imagen: event1,
			disponibles: 45,
			salidas: ["Querétaro", "Puebla", "Toluca"],
			categoria: "Rock",
			destacado: true,
		},
		{
			id: 2,
			evento: "Vive Latino 2025",
			artistas: ["Café Tacvba", "Molotov", "Los Fabulosos Cadillacs"],
			fecha: "20-22 Marzo 2025",
			ubicacion: "Foro Sol, CDMX",
			precio: 750,
			imagen: event2,
			disponibles: 32,
			salidas: ["Cuernavaca", "Pachuca", "Tlaxcala"],
			categoria: "Latino",
			destacado: false,
		},
		{
			id: 3,
			evento: "EDC México 2025",
			artistas: ["Tiësto", "Martin Garrix", "Armin van Buuren"],
			fecha: "22-24 Febrero 2025",
			ubicacion: "Autódromo Hermanos Rodríguez, CDMX",
			precio: 950,
			imagen: event3,
			disponibles: 28,
			salidas: ["Querétaro", "Puebla", "Toluca"],
			categoria: "Electrónica",
			destacado: true,
		},
		{
			id: 4,
			evento: "Hell & Heaven 2025",
			artistas: ["Metallica", "Iron Maiden", "Slayer"],
			fecha: "5-7 Mayo 2025",
			ubicacion: "Foro Pegaso, Estado de México",
			precio: 820,
			imagen: event4,
			disponibles: 15,
			salidas: ["Querétaro", "Puebla"],
			categoria: "Metal",
			destacado: false,
		},
		{
			id: 5,
			evento: "Pa'l Norte 2025",
			artistas: ["Bad Bunny", "Peso Pluma", "Grupo Frontera"],
			fecha: "28-30 Marzo 2025",
			ubicacion: "Parque Fundidora, Monterrey",
			precio: 1200,
			imagen: event5,
			disponibles: 40,
			salidas: ["CDMX", "Guadalajara", "San Luis Potosí"],
			categoria: "Regional",
			destacado: true,
		},
		{
			id: 6,
			evento: "Tecate Emblema 2025",
			artistas: ["Caifanes", "Zoé", "Porter"],
			fecha: "10-12 Abril 2025",
			ubicacion: "Autódromo Hermanos Rodríguez, CDMX",
			precio: 880,
			imagen: event6,
			disponibles: 38,
			salidas: ["Querétaro", "Toluca", "Cuernavaca"],
			categoria: "Rock",
			destacado: false,
		},
		{
			id: 7,
			evento: "BABYMETAL",
			artistas: ["BABYMETAL"],
			fecha: "7 Noviembre 2025",
			ubicacion: "Arena Ciudad de México, CDMX",
			precio: 680,
			imagen: event7,
			disponibles: 52,
			salidas: ["Querétaro", "Puebla", "Toluca"],
			categoria: "Metal",
			destacado: false,
		},
		{
			id: 8,
			evento: "Dua Lipa - Future Nostalgia Tour",
			artistas: ["Dua Lipa"],
			fecha: "1, 2 y 5 Diciembre 2025",
			ubicacion: "Estadio GNP Seguros, CDMX",
			precio: 1150,
			imagen: event8,
			disponibles: 60,
			salidas: ["Querétaro", "Puebla", "Toluca", "Cuernavaca"],
			categoria: "Pop",
			destacado: true,
		},
		{
			id: 9,
			evento: "Bad Bunny - Most Wanted Tour",
			artistas: ["Bad Bunny"],
			fecha: "10-21 Diciembre 2025",
			ubicacion: "Estadio GNP Seguros, CDMX",
			precio: 1350,
			imagen: event5,
			disponibles: 95,
			salidas: ["CDMX", "Guadalajara", "Monterrey", "Puebla"],
			categoria: "Regional",
			destacado: true,
		},
	];

	const categorias = ["Todos", "Rock", "Latino", "Electrónica", "Metal", "Regional", "Pop"];

	const toursFiltrados = tours.filter((tour) => {
		const matchSearch =
			tour.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
			tour.artistas.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchCategoria = filterCategoria === "Todos" || tour.categoria === filterCategoria;
		return matchSearch && matchCategoria;
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#F0EBE3] to-white">
			{/* Hero Section - Mejorado */}
			<section className="relative overflow-hidden bg-gradient-to-r from-[#1A1A1A] via-[#803549] to-[#A6402C] py-20 text-white sm:py-28">
				<div className="absolute inset-0 opacity-10">
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0zNiA1MmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] [background-size:40px_40px]"></div>
				</div>
				<div className="container relative z-10 mx-auto px-4 text-center lg:px-6">
					<Badge className="mb-4 bg-white/20 px-4 py-1 text-sm backdrop-blur-sm">
						<Icon icon="solar:ticket-bold" className="mr-2 inline" size={16} />
						Cartelera de Eventos 2025
					</Badge>
					<h1 className="mb-6 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
						Los Mejores Conciertos
						<br />
						<span className="bg-gradient-to-r from-white to-[#F0EBE3] bg-clip-text text-transparent">
							Te Están Esperando
						</span>
					</h1>
					<p className="mx-auto max-w-3xl text-base text-white/90 sm:text-lg lg:text-xl">
						Reserva tu transporte seguro a los eventos más importantes del año.
						<br className="hidden sm:inline" />
						Viaja cómodo, disfruta sin preocupaciones.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
						<div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
							<Icon icon="solar:calendar-mark-bold" size={20} />
							<span>{tours.length} eventos disponibles</span>
						</div>
						<div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
							<Icon icon="solar:map-point-bold" size={20} />
							<span>Salidas desde 15 ciudades</span>
						</div>
						<div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
							<Icon icon="solar:shield-check-bold" size={20} />
							<span>Transporte seguro certificado</span>
						</div>
					</div>
				</div>
			</section>

			{/* Filtros - Mejorado */}
			<section className="sticky top-0 z-40 border-b border-[#A9A9A9]/20 bg-white/95 py-4 shadow-md backdrop-blur-sm sm:py-6">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						{/* Búsqueda */}
						<div className="relative flex-1 lg:max-w-md">
							<Icon
								icon="solar:magnifer-bold"
								className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9A9A9]"
								size={20}
							/>
							<input
								type="text"
								placeholder="Buscar evento, artista o género..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full rounded-lg border border-[#A9A9A9]/30 bg-[#F0EBE3] py-3 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder-[#A9A9A9] transition-all focus:border-[#A6402C] focus:outline-none focus:ring-2 focus:ring-[#A6402C]/20"
							/>
						</div>

						{/* Categorías */}
						<div className="flex flex-wrap gap-2">
							{categorias.map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setFilterCategoria(cat)}
									className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
										filterCategoria === cat
											? "bg-gradient-to-r from-[#A6402C] to-[#803549] text-white shadow-lg shadow-[#A6402C]/30"
											: "border border-[#A9A9A9]/30 bg-white text-[#4A4A4A] hover:border-[#A6402C] hover:shadow-md"
									}`}
								>
									{cat}
								</button>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Tours Grid - Diseño Premium */}
			<section className="py-12 sm:py-16">
				<div className="container mx-auto px-4 lg:px-6">
					{toursFiltrados.length === 0 ? (
						<div className="py-16 text-center">
							<Icon icon="solar:box-minimalistic-bold-duotone" className="mx-auto mb-4 text-[#A9A9A9]" size={80} />
							<h3 className="mb-2 text-xl font-bold text-[#1A1A1A]">No se encontraron eventos</h3>
							<p className="text-[#4A4A4A]">Intenta con otros términos de búsqueda</p>
						</div>
					) : (
						<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
							{toursFiltrados.map((tour) => (
								<Card
									key={tour.id}
									className="group relative overflow-hidden border-[#A9A9A9]/20 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
								>
									{/* Imagen con overlay */}
									<div className="relative h-64 overflow-hidden bg-[#1A1A1A]">
										<img
											src={tour.imagen}
											alt={tour.evento}
											className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										{/* Overlay gradiente */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

										{/* Badge destacado */}
										{tour.destacado && (
											<Badge className="absolute left-3 top-3 bg-gradient-to-r from-[#A6402C] to-[#803549] px-3 py-1 text-xs font-bold text-white shadow-lg">
												<Icon icon="solar:star-bold" className="mr-1 inline" size={12} />
												DESTACADO
											</Badge>
										)}

										{/* Badge categoría */}
										<Badge className="absolute right-3 top-3 border border-white/30 bg-white/20 text-white backdrop-blur-sm">
											{tour.categoria}
										</Badge>

										{/* Info sobre la imagen */}
										<div className="absolute bottom-0 left-0 right-0 p-4">
											<h3 className="mb-1 text-xl font-bold text-white line-clamp-2">{tour.evento}</h3>
											<div className="flex items-center gap-2 text-sm text-white/90">
												<Icon icon="solar:calendar-bold" size={14} />
												<span className="font-medium">{tour.fecha}</span>
											</div>
										</div>
									</div>

									{/* Contenido */}
									<div className="p-5">
										{/* Artistas */}
										<div className="mb-4 flex flex-wrap gap-1">
											{tour.artistas.map((artista) => (
												<span key={artista} className="text-sm font-medium text-[#803549]">
													{artista}
													{tour.artistas.indexOf(artista) < tour.artistas.length - 1 && (
														<span className="mx-1 text-[#A9A9A9]">•</span>
													)}
												</span>
											))}
										</div>

										{/* Detalles */}
										<div className="mb-4 space-y-2.5 border-t border-[#A9A9A9]/20 pt-4 text-sm text-[#4A4A4A]">
											<div className="flex items-center gap-2">
												<Icon icon="solar:map-point-bold" size={18} className="text-[#A6402C]" />
												<span className="flex-1 font-medium">{tour.ubicacion}</span>
											</div>
											<div className="flex items-center gap-2">
												<Icon icon="solar:bus-bold" size={18} className="text-[#A6402C]" />
												<span className="flex-1">Salidas: {tour.salidas.join(", ")}</span>
											</div>
											<div className="flex items-center gap-2">
												<Icon icon="solar:users-group-rounded-bold" size={18} className="text-[#A6402C]" />
												<span className="flex-1 font-medium text-green-600">
													{tour.disponibles} lugares disponibles
												</span>
											</div>
										</div>

										{/* Footer con precio y botón */}
										<div className="flex items-center justify-between gap-4 border-t border-[#A9A9A9]/20 pt-4">
											<div>
												<div className="text-xs font-medium uppercase text-[#A9A9A9]">Desde</div>
												<div className="text-2xl font-extrabold text-[#A6402C]">
													${tour.precio}
													<span className="ml-1 text-sm font-normal text-[#A9A9A9]">MXN</span>
												</div>
											</div>
											<button
												type="button"
												onClick={handleReservar}
												className="group/btn flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#A6402C]/30 transition-all hover:shadow-xl hover:shadow-[#A6402C]/40 hover:scale-105 active:scale-95"
											>
												Reservar
												<Icon
													icon="solar:arrow-right-bold"
													size={16}
													className="transition-transform group-hover/btn:translate-x-1"
												/>
											</button>
										</div>
									</div>

									{/* Indicador de popularidad */}
									{tour.disponibles < 20 && (
										<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#A6402C] to-[#803549] px-4 py-2 text-center text-xs font-bold text-white">
											<Icon icon="solar:fire-bold" className="mr-1 inline animate-pulse" size={14} />
											ÚLTIMOS LUGARES - ¡RESERVA YA!
										</div>
									)}
								</Card>
							))}
						</div>
					)}

					{/* CTA Final */}
					{toursFiltrados.length > 0 && (
						<div className="mt-16 rounded-2xl bg-gradient-to-r from-[#1A1A1A] via-[#803549] to-[#A6402C] p-8 text-center text-white shadow-2xl sm:p-12">
							<Icon icon="solar:star-circle-bold" className="mx-auto mb-4 text-white" size={48} />
							<h2 className="mb-4 text-2xl font-bold sm:text-3xl">¿No encontraste tu evento favorito?</h2>
							<p className="mx-auto mb-6 max-w-2xl text-white/90">
								Contáctanos y organizamos el transporte para el concierto que tú elijas. Viajes grupales, corporativos y
								personalizados.
							</p>
							<button
								type="button"
								onClick={handleEventoPersonalizado}
								className="rounded-lg bg-white px-8 py-3 font-bold text-[#A6402C] shadow-lg transition-all hover:bg-[#F0EBE3] hover:shadow-xl hover:scale-105"
							>
								Solicitar Evento Personalizado
							</button>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
