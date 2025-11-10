// -----------------------------------------------------------------------------
// landing/index.tsx
// Página principal profesional de BusTix - Paleta elegante
// -----------------------------------------------------------------------------
import { useNavigate } from "react-router";
import event5 from "@/assets/images/landing/event/event_5.png"; // Bad Bunny
// Importar imágenes de eventos para "Eventos Próximos"
import event7 from "@/assets/images/landing/event/event_7.png"; // BABYMETAL
import event8 from "@/assets/images/landing/event/event_8.png"; // Dua Lipa
// Importar imágenes
import landing1 from "@/assets/images/landing/landing_1.png";
import landing2 from "@/assets/images/landing/landing_2.png";
import landing3 from "@/assets/images/landing/landing_3.png";
import landing4 from "@/assets/images/landing/landing_4.png";
import landing5 from "@/assets/images/landing/landing_5.png";
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function LandingPage() {
	const navigate = useNavigate();

	const features = [
		{
			icon: "solar:bus-bold-duotone",
			title: "Transporte Seguro",
			description: "Flota moderna y conductores certificados para tu tranquilidad",
			image: landing2,
		},
		{
			icon: "solar:calendar-mark-bold-duotone",
			title: "Fácil Reservación",
			description: "Reserva tu lugar en minutos desde cualquier dispositivo",
			image: landing3,
		},
		{
			icon: "solar:ticket-bold-duotone",
			title: "Mejores Precios",
			description: "Tarifas competitivas y promociones exclusivas",
			image: landing4,
		},
		{
			icon: "solar:users-group-rounded-bold-duotone",
			title: "Viaja en Grupo",
			description: "Disfruta con amigos y conoce gente nueva",
			image: landing5,
		},
	];

	const popularEvents = [
		{
			title: "BABYMETAL",
			location: "Arena Ciudad de México",
			date: "7 Noviembre 2025",
			image: event7,
			price: "Desde $680",
		},
		{
			title: "Dua Lipa - Future Nostalgia Tour",
			location: "Estadio GNP Seguros",
			date: "1, 2 y 5 Diciembre 2025",
			image: event8,
			price: "Desde $1,150",
		},
		{
			title: "Bad Bunny - Most Wanted Tour",
			location: "Estadio GNP Seguros",
			date: "10-21 Diciembre 2025",
			image: event5,
			price: "Desde $1,350",
		},
	];

	return (
		<div className="flex flex-col bg-[#F0EBE3]">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] py-16 text-white sm:py-20 lg:py-32">
				{/* Background Image */}
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
					style={{
						backgroundImage: `url(${landing1})`,
						backgroundBlendMode: "overlay",
					}}
				/>

				{/* Dark overlay for better text readability */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 via-[#4A4A4A]/70 to-[#1A1A1A]/80" />

				<div className="container relative z-10 mx-auto px-4 lg:px-6">
					<div className="mx-auto max-w-4xl text-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A6402C]/30 bg-[#A6402C]/10 px-4 py-2 backdrop-blur-sm">
							<Icon icon="solar:star-bold" className="text-[#A6402C]" size={20} />
							<span className="text-sm font-medium text-[#F0EBE3]">Viaja con estilo y seguridad</span>
						</div>
						<h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							Tu Viaje al Concierto{" "}
							<span className="bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-transparent">
								Empieza Aquí
							</span>
						</h1>
						<p className="mb-8 text-base text-[#A9A9A9] sm:text-lg lg:text-xl">
							Viaja cómodo y seguro a los mejores eventos. Sin preocupaciones, sin estrés. Solo diversión.
						</p>
						<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
							<button
								type="button"
								className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/50 hover:brightness-110 sm:w-auto"
								onClick={() => navigate("/tours")}
							>
								<Icon
									icon="solar:ticket-bold"
									size={20}
									className="transition-transform duration-300 group-hover:rotate-12"
								/>
								Ver Tours Disponibles
							</button>
							<button
								type="button"
								className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#F0EBE3]/30 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#F0EBE3] hover:bg-white/20 sm:w-auto"
								onClick={() => navigate("/como-funciona")}
							>
								<Icon icon="solar:play-circle-bold" size={20} />
								Cómo Funciona
							</button>
						</div>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#A6402C]/20 blur-3xl" />
				<div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#803549]/20 blur-3xl" />
			</section>

			{/* Features Section */}
			<section className="bg-white py-16 lg:py-24">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl lg:text-4xl">¿Por Qué Elegirnos?</h2>
						<p className="text-base text-[#4A4A4A] sm:text-lg">La mejor experiencia de viaje a eventos masivos</p>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{features.map((feature) => (
							<Card
								key={feature.title}
								className="group overflow-hidden border-[#A9A9A9]/20 bg-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#A6402C]/10"
							>
								<div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10">
									<img
										src={feature.image}
										alt={feature.title}
										className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
									/>
									{/* Overlay más oscuro para mejor contraste */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

									{/* Icono en esquina inferior izquierda con fondo oscuro */}
									<div className="absolute bottom-4 left-4">
										<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#4A4A4A] shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#A6402C]/50">
											<Icon icon={feature.icon} size={24} className="text-[#A6402C]" />
										</div>
									</div>
								</div>
								<div className="p-6 text-center">
									<h3 className="mb-2 text-lg font-semibold text-[#1A1A1A] sm:text-xl">{feature.title}</h3>
									<p className="text-sm text-[#4A4A4A]">{feature.description}</p>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Popular Events Section */}
			<section className="bg-[#F0EBE3] py-16 lg:py-24">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl lg:text-4xl">Eventos Próximos</h2>
						<p className="text-base text-[#4A4A4A] sm:text-lg">Los conciertos y festivales más esperados</p>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{popularEvents.map((event) => (
							<Card
								key={event.title}
								className="overflow-hidden border-[#A9A9A9]/20 bg-white backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/20"
							>
								<div className="relative h-48 overflow-hidden bg-[#1A1A1A]">
									<img
										src={event.image}
										alt={event.title}
										className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
									/>
									{/* Overlay gradiente */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
								</div>
								<div className="p-6">
									<h3 className="mb-2 text-lg font-semibold text-[#1A1A1A] sm:text-xl">{event.title}</h3>
									<div className="mb-4 space-y-1 text-sm text-[#4A4A4A]">
										<div className="flex items-center gap-2">
											<Icon icon="solar:map-point-bold" size={16} className="text-[#A6402C]" />
											{event.location}
										</div>
										<div className="flex items-center gap-2">
											<Icon icon="solar:calendar-bold" size={16} className="text-[#A6402C]" />
											{event.date}
										</div>
									</div>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<span className="text-lg font-bold text-[#A6402C]">{event.price}</span>
										<button
											type="button"
											onClick={() => navigate("/tours")}
											className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
										>
											Reservar
											<Icon icon="solar:arrow-right-bold" size={16} />
										</button>
									</div>
								</div>
							</Card>
						))}
					</div>
					<div className="mt-8 text-center">
						<button
							type="button"
							onClick={() => navigate("/tours")}
							className="inline-flex items-center gap-2 rounded-lg border-2 border-[#4A4A4A] bg-white px-6 py-3 font-medium text-[#1A1A1A] transition-all hover:border-[#A6402C] hover:bg-[#F0EBE3]"
						>
							Ver Todos los Eventos
						</button>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="bg-white py-16 lg:py-24">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl lg:text-4xl">¿Cómo Funciona?</h2>
						<p className="text-base text-[#4A4A4A] sm:text-lg">Simple, rápido y seguro</p>
					</div>
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{
								step: "1",
								title: "Elige tu Evento",
								description: "Selecciona el concierto o festival al que deseas asistir",
								icon: "solar:calendar-search-bold-duotone",
							},
							{
								step: "2",
								title: "Reserva tu Lugar",
								description: "Completa tu reservación de forma rápida y segura",
								icon: "solar:ticket-bold-duotone",
							},
							{
								step: "3",
								title: "Disfruta el Viaje",
								description: "Sube al autobús y disfruta sin preocupaciones",
								icon: "solar:bus-bold-duotone",
							},
						].map((step) => (
							<div key={step.step} className="relative text-center">
								<div className="mb-4 flex justify-center">
									<div className="relative">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#A6402C] to-[#803549] text-2xl font-bold text-white shadow-lg sm:h-20 sm:w-20">
											{step.step}
										</div>
									</div>
								</div>
								<div className="mb-4">
									<Icon icon={step.icon} size={48} className="mx-auto text-[#A6402C]" />
								</div>
								<h3 className="mb-2 text-lg font-semibold text-[#1A1A1A] sm:text-xl">{step.title}</h3>
								<p className="text-sm text-[#4A4A4A] sm:text-base">{step.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-gradient-to-r from-[#A6402C] via-[#803549] to-[#A6402C] py-16 text-white lg:py-20">
				<div className="container mx-auto px-4 text-center lg:px-6">
					<h2 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">¿Listo para tu Próxima Aventura?</h2>
					<p className="mb-8 text-base text-[#F0EBE3] sm:text-lg">Únete a miles de personas que ya viajan con BusTix</p>
					<button
						type="button"
						onClick={() => navigate("/tours")}
						className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-[#A6402C] shadow-lg transition-all hover:bg-[#F0EBE3] sm:px-8 sm:py-4"
					>
						<Icon icon="solar:ticket-bold" size={20} />
						Explorar Tours
					</button>
				</div>
			</section>
		</div>
	);
}
