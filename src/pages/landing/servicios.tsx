// -----------------------------------------------------------------------------
// landing/servicios.tsx
// Página de servicios - BusTix - Paleta elegante
// -----------------------------------------------------------------------------

import { useNavigate } from "react-router";
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function Servicios() {
	const navigate = useNavigate();

	const servicios = [
		{
			icon: "solar:ticket-bold-duotone",
			title: "Eventos Masivos",
			description: "Transporte a conciertos y festivales con rutas fijas y horarios programados",
			features: ["Salidas desde múltiples puntos", "Boleto de ida y vuelta", "WiFi a bordo", "Asientos numerados"],
			color: "from-[#A6402C]/10 to-[#803549]/10",
		},
		{
			icon: "solar:case-round-bold-duotone",
			title: "Viajes Privados",
			description: "Renta de unidades para eventos corporativos, bodas o grupos especiales",
			features: ["Unidades de lujo", "Rutas personalizadas", "Servicio VIP", "Operador certificado"],
			color: "from-[#803549]/10 to-[#A6402C]/10",
		},
		{
			icon: "solar:map-arrow-right-bold-duotone",
			title: "Tours Turísticos",
			description: "Excursiones a destinos turísticos combinados con eventos especiales",
			features: ["Guía especializado", "Paquetes todo incluido", "Hoteles 4 y 5 estrellas", "Experiencias únicas"],
			color: "from-[#A6402C]/10 to-[#4A4A4A]/10",
		},
		{
			icon: "solar:users-group-rounded-bold-duotone",
			title: "Corporativos",
			description: "Soluciones de transporte para empresas y eventos corporativos",
			features: ["Contratos anuales", "Facturación electrónica", "Descuentos por volumen", "Servicio 24/7"],
			color: "from-[#4A4A4A]/10 to-[#803549]/10",
		},
	];

	return (
		<div className="min-h-screen bg-[#F0EBE3]">
			{/* Hero */}
			<section className="bg-gradient-to-r from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] py-16 text-white sm:py-20 lg:py-24">
				<div className="container mx-auto px-4 text-center lg:px-6">
					<h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">Nuestros Servicios</h1>
					<p className="mx-auto max-w-2xl text-base text-[#A9A9A9] sm:text-lg">
						Soluciones de transporte a tu medida para cualquier tipo de evento
					</p>
				</div>
			</section>

			{/* Servicios */}
			<section className="py-12 sm:py-16 lg:py-20">
				<div className="container mx-auto max-w-6xl px-4 lg:px-6">
					<div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
						{servicios.map((servicio) => (
							<Card key={servicio.title} className="overflow-hidden border-[#A9A9A9]/20 bg-white">
								<div className={`bg-gradient-to-br ${servicio.color} p-6 sm:p-8`}>
									<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
										<Icon icon={servicio.icon} size={32} className="text-[#A6402C]" />
									</div>
									<h3 className="mb-2 text-xl font-bold text-[#1A1A1A] sm:text-2xl">{servicio.title}</h3>
									<p className="text-sm text-[#4A4A4A] sm:text-base">{servicio.description}</p>
								</div>
								<div className="p-6">
									<ul className="mb-6 space-y-2">
										{servicio.features.map((feature) => (
											<li key={feature} className="flex items-center gap-2 text-sm sm:text-base">
												<Icon icon="solar:check-circle-bold" size={18} className="text-green-600" />
												<span className="text-[#4A4A4A]">{feature}</span>
											</li>
										))}
									</ul>
									<button
										type="button"
										className="w-full rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-4 py-2.5 font-medium text-white transition-all hover:shadow-lg"
										onClick={() => navigate("/contacto")}
									>
										Solicitar Información
									</button>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Características Adicionales */}
			<section className="bg-white py-12 sm:py-16">
				<div className="container mx-auto max-w-6xl px-4 lg:px-6">
					<h2 className="mb-8 text-center text-2xl font-bold text-[#1A1A1A] sm:mb-12 sm:text-3xl">
						Todas Nuestras Unidades Incluyen
					</h2>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{ icon: "solar:wifi-router-bold-duotone", title: "WiFi Gratuito", desc: "Internet de alta velocidad" },
							{ icon: "solar:snowflake-bold-duotone", title: "Aire Acondicionado", desc: "Viaje confortable" },
							{ icon: "solar:shield-check-bold-duotone", title: "Seguro de Viajero", desc: "Viaja protegido" },
							{ icon: "solar:cup-hot-bold-duotone", title: "Servicio a Bordo", desc: "Snacks y bebidas" },
							{
								icon: "solar:square-academic-cap-bold-duotone",
								title: "Conductores Pro",
								desc: "Certificados y experimentados",
							},
							{ icon: "solar:map-point-wave-bold-duotone", title: "GPS en Tiempo Real", desc: "Rastrea tu viaje" },
						].map((item) => (
							<Card key={item.title} className="border-[#A9A9A9]/20 bg-[#F0EBE3] p-6 text-center">
								<Icon icon={item.icon} size={40} className="mx-auto mb-3 text-[#A6402C]" />
								<h3 className="mb-1 font-semibold text-[#1A1A1A]">{item.title}</h3>
								<p className="text-sm text-[#4A4A4A]">{item.desc}</p>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-12 sm:py-16">
				<div className="container mx-auto max-w-4xl px-4 lg:px-6">
					<Card className="border-[#A6402C]/20 bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 p-6 text-center sm:p-8 lg:p-12">
						<h2 className="mb-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
							¿Necesitas un Servicio Personalizado?
						</h2>
						<p className="mb-6 text-sm text-[#4A4A4A] sm:text-base">
							Contáctanos y diseñaremos una solución a tu medida
						</p>
						<button
							type="button"
							onClick={() => navigate("/contacto")}
							className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
						>
							<Icon icon="solar:letter-bold" size={20} />
							Contactar
						</button>
					</Card>
				</div>
			</section>
		</div>
	);
}
