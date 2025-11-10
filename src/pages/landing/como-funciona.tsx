// -----------------------------------------------------------------------------
// landing/como-funciona.tsx
// Página de cómo funciona - BusTix - Paleta elegante
// -----------------------------------------------------------------------------
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function ComoFunciona() {
	const pasos = [
		{
			numero: "1",
			titulo: "Explora Eventos",
			descripcion: "Navega por nuestra selección de conciertos y festivales disponibles",
			icono: "solar:calendar-search-bold-duotone",
			imagen: "/src/assets/images/landing/faq/faq_1.png",
			detalles: [
				"Filtra por género musical",
				"Revisa fechas y ubicaciones",
				"Compara precios",
				"Lee reseñas de otros viajeros",
			],
		},
		{
			numero: "2",
			titulo: "Selecciona tu Viaje",
			descripcion: "Elige el evento, fecha y punto de salida que más te convenga",
			icono: "solar:ticket-bold-duotone",
			imagen: "/src/assets/images/landing/faq/faq_2.png",
			detalles: [
				"Múltiples puntos de salida",
				"Opciones de horario flexible",
				"Asientos numerados",
				"Paquetes con hospedaje",
			],
		},
		{
			numero: "3",
			titulo: "Reserva y Paga",
			descripcion: "Completa tu reservación de forma segura con múltiples métodos de pago",
			icono: "solar:card-bold-duotone",
			imagen: "/src/assets/images/landing/faq/faq_3.png",
			detalles: [
				"Pago con tarjeta o transferencia",
				"Plataforma 100% segura",
				"Confirmación instantánea",
				"Boleto digital enviado por email",
			],
		},
		{
			numero: "4",
			titulo: "Prepárate para Viajar",
			descripcion: "Recibe toda la información necesaria para tu viaje",
			icono: "solar:letter-opened-bold-duotone",
			imagen: "/src/assets/images/landing/faq/faq_4.png",
			detalles: [
				"Punto de encuentro exacto",
				"Hora de salida y llegada",
				"Qué llevar y qué no",
				"Contacto de emergencia",
			],
		},
		{
			numero: "5",
			titulo: "Disfruta el Viaje",
			descripcion: "Sube al autobús y relájate mientras te llevamos a tu destino",
			icono: "solar:bus-bold-duotone",
			imagen: "/src/assets/images/landing/faq/faq_5.png",
			detalles: ["WiFi gratis a bordo", "Asientos cómodos", "Aire acondicionado", "Servicio de snacks"],
		},
		{
			numero: "6",
			titulo: "Vive la Experiencia",
			descripcion: "Llega al evento, disfruta y nosotros te llevamos de regreso",
			icono: "solar:star-bold-duotone",
			imagen: "/src/assets/images/landing/faq/faq_6.png",
			detalles: [
				"Entrada directa al evento",
				"Zona de estacionamiento VIP",
				"Regreso coordinado",
				"Sin preocupaciones",
			],
		},
	];

	const faqs = [
		{
			pregunta: "¿Qué incluye el precio del boleto?",
			respuesta:
				"El precio incluye transporte redondo (ida y vuelta), asiento numerado, WiFi, seguro de viajero y coordinación de entrada al evento.",
		},
		{
			pregunta: "¿Puedo cancelar mi reservación?",
			respuesta:
				"Sí, puedes cancelar hasta 48 horas antes de la salida con reembolso del 80%. Cancelaciones dentro de las 48 horas no tienen reembolso.",
		},
		{
			pregunta: "¿Qué pasa si pierdo el autobús?",
			respuesta:
				"Te recomendamos llegar 15 minutos antes. Si pierdes la salida, no hay reembolso, pero podemos intentar reubicarte en otro viaje disponible.",
		},
		{
			pregunta: "¿Puedo llevar equipaje?",
			respuesta:
				"Sí, puedes llevar una mochila o bolso personal. Maletas grandes solo si contratas el servicio con hospedaje.",
		},
		{
			pregunta: "¿Los autobuses tienen baño?",
			respuesta:
				"Algunos sí. Se especifica en la descripción del tour. Hacemos paradas de descanso cada 2-3 horas en viajes largos.",
		},
		{
			pregunta: "¿Qué medidas de seguridad tienen?",
			respuesta:
				"Todos nuestros conductores están certificados, las unidades tienen mantenimiento regular, seguro de viajero y GPS en tiempo real.",
		},
	];

	return (
		<div className="min-h-screen bg-[#F0EBE3]">
			{/* Hero */}
			<section className="relative overflow-hidden bg-gradient-to-r from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] py-20 text-white sm:py-28">
				{/* Background Image */}
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
					style={{
						backgroundImage: "url('/src/assets/images/landing/landing_1.png')",
						backgroundBlendMode: "overlay",
					}}
				/>

				{/* Dark overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 via-[#4A4A4A]/70 to-[#1A1A1A]/80" />

				<div className="container relative z-10 mx-auto px-4 text-center lg:px-6">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A6402C]/30 bg-[#A6402C]/10 px-4 py-2 backdrop-blur-sm">
						<Icon icon="solar:star-bold" className="text-[#A6402C]" size={20} />
						<span className="text-sm font-medium text-[#F0EBE3]">Solo 6 pasos para tu aventura</span>
					</div>

					<Icon icon="solar:question-circle-bold-duotone" className="mx-auto mb-6 text-[#A6402C]" size={64} />

					<h1 className="mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
						¿Cómo{" "}
						<span className="bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-transparent">
							Funciona?
						</span>
					</h1>

					<p className="mx-auto max-w-2xl text-base leading-relaxed text-[#A9A9A9] sm:text-lg">
						Viajar con BusTix es simple, seguro y emocionante. Sigue estos pasos y prepárate para vivir una experiencia
						inolvidable
					</p>
				</div>

				<div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-[#A6402C]/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#803549]/10 blur-3xl" />
			</section>

			{/* Pasos */}
			<section className="py-12 sm:py-16 lg:py-20">
				<div className="container mx-auto max-w-6xl px-4 lg:px-6">
					<div className="space-y-8 sm:space-y-12">
						{pasos.map((paso, index) => (
							<div
								key={paso.numero}
								className={`flex flex-col gap-6 lg:flex-row lg:items-center ${
									index % 2 === 1 ? "lg:flex-row-reverse" : ""
								}`}
							>
								{/* Contenido */}
								<div className="flex-1">
									<Card className="group border-2 border-[#A9A9A9]/10 bg-white p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:border-[#A6402C]/30 hover:shadow-2xl hover:shadow-[#A6402C]/20 sm:p-8">
										<div className="relative mb-4">
											<div className="absolute -left-2 -top-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#A6402C] to-[#803549] text-xl font-bold text-white shadow-xl transition-all duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-2xl">
												{paso.numero}
											</div>
											<div className="pl-16">
												<h3 className="text-xl font-bold text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#A6402C] sm:text-2xl">
													{paso.titulo}
												</h3>
												<p className="text-sm text-[#4A4A4A] sm:text-base">{paso.descripcion}</p>
											</div>
										</div>
										<ul className="space-y-2">
											{paso.detalles.map((detalle) => (
												<li key={detalle} className="flex items-start gap-2 text-sm sm:text-base">
													<Icon
														icon="solar:check-circle-bold"
														size={18}
														className="mt-0.5 flex-shrink-0 text-green-600"
													/>
													<span className="text-[#4A4A4A]">{detalle}</span>
												</li>
											))}
										</ul>
									</Card>
								</div>

								{/* Imagen */}
								<div className="flex justify-center lg:w-2/5">
									<Card className="group relative overflow-hidden border-2 border-[#A9A9A9]/10 bg-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/20">
										<div className="relative h-64 overflow-hidden sm:h-80">
											<img
												src={paso.imagen}
												alt={paso.titulo}
												className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
											/>
											{/* Overlay con gradiente */}
											<div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-[#1A1A1A]/20 to-transparent" />

											{/* Icono en esquina inferior izquierda */}
											<div className="absolute bottom-4 left-4">
												<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#4A4A4A] shadow-2xl transition-all duration-300 group-hover:scale-110">
													<Icon icon={paso.icono} size={28} className="text-[#A6402C]" />
												</div>
											</div>
										</div>
									</Card>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQs */}
			<section className="bg-white py-12 sm:py-16">
				<div className="container mx-auto max-w-4xl px-4 lg:px-6">
					<div className="mb-8 text-center sm:mb-12">
						<h2 className="mb-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
							Preguntas <span className="text-[#A6402C]">Frecuentes</span>
						</h2>
						<p className="text-sm text-[#4A4A4A] sm:text-base">Todo lo que necesitas saber sobre viajar con BusTix</p>
					</div>
					<div className="space-y-4">
						{faqs.map((faq) => (
							<Card
								key={faq.pregunta}
								className="group border-2 border-[#A9A9A9]/10 bg-[#F0EBE3] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#A6402C]/30 hover:shadow-xl hover:shadow-[#A6402C]/10"
							>
								<h3 className="mb-3 flex items-start gap-3 text-base font-semibold text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#A6402C] sm:text-lg">
									<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 transition-all duration-300 group-hover:scale-110 group-hover:from-[#A6402C]/20 group-hover:to-[#803549]/20">
										<Icon icon="solar:question-circle-bold" className="text-[#A6402C]" size={16} />
									</div>
									{faq.pregunta}
								</h3>
								<p className="pl-9 text-sm leading-relaxed text-[#4A4A4A] sm:text-base">{faq.respuesta}</p>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-12 sm:py-16">
				<div className="container mx-auto max-w-4xl px-4 lg:px-6">
					<Card className="relative overflow-hidden border-2 border-[#A6402C]/30 bg-gradient-to-br from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] p-8 text-center shadow-2xl sm:p-12">
						{/* Decorative elements */}
						<div className="pointer-events-none absolute -left-20 top-0 h-60 w-60 rounded-full bg-[#A6402C]/20 blur-3xl" />
						<div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-[#803549]/20 blur-3xl" />

						<div className="relative">
							<Icon icon="solar:rocket-bold-duotone" className="mx-auto mb-6 text-[#A6402C]" size={64} />
							<h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
								¿Listo para tu{" "}
								<span className="bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-transparent">
									Primera Aventura?
								</span>
							</h2>
							<p className="mb-8 text-sm text-[#A9A9A9] sm:text-base lg:text-lg">
								Explora nuestros tours y reserva tu lugar ahora. La experiencia de tu vida está a un clic de distancia
							</p>
							<a
								href="/tours"
								className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-8 py-3.5 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/50 hover:brightness-110"
								style={{ color: "#FFFFFF" }}
							>
								<Icon
									icon="solar:ticket-bold"
									size={20}
									className="text-white transition-transform duration-300 group-hover:rotate-12"
								/>
								Ver Tours Disponibles
								<Icon
									icon="solar:arrow-right-bold"
									size={20}
									className="text-white transition-transform duration-300 group-hover:translate-x-1"
								/>
							</a>
						</div>
					</Card>
				</div>
			</section>
		</div>
	);
}
