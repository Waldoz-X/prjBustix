// -----------------------------------------------------------------------------
// landing/privacidad.tsx
// Página de política de privacidad - BusTix - Paleta elegante
// -----------------------------------------------------------------------------

import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function Privacidad() {
	return (
		<div className="min-h-screen bg-[#F0EBE3]">
			{/* Hero */}
			<section className="bg-gradient-to-r from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] py-16 text-white sm:py-20">
				<div className="container mx-auto max-w-4xl px-4 text-center lg:px-6">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A6402C] to-[#803549] shadow-lg">
						<Icon icon="solar:shield-check-bold" className="text-white" size={32} />
					</div>
					<h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">Política de Privacidad</h1>
					<p className="text-base text-[#A9A9A9] sm:text-lg">Tu privacidad es nuestra prioridad</p>
				</div>
			</section>

			<div className="container mx-auto max-w-4xl px-4 py-12 lg:px-6 lg:py-16">
				<Card className="mb-6 border-[#A9A9A9]/20 bg-white p-6 backdrop-blur-sm">
					<p className="mb-4 text-sm text-[#A9A9A9]">Última actualización: Enero 2025</p>
					<p className="text-sm text-[#4A4A4A] sm:text-base">
						En BusTix valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política
						describe cómo recopilamos, usamos y protegemos tu información.
					</p>
				</Card>

				<div className="space-y-6">
					<Card className="border-[#A9A9A9]/20 bg-white p-6 backdrop-blur-sm">
						<h2 className="mb-4 flex items-center text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
							<span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#A6402C]/10 text-[#A6402C]">
								1
							</span>
							Información que Recopilamos
						</h2>
						<p className="mb-3 text-sm text-[#4A4A4A] sm:text-base">Recopilamos la siguiente información:</p>
						<ul className="space-y-2 text-sm text-[#4A4A4A] sm:text-base">
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Nombre completo y datos de contacto (email, teléfono)</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Información de pago (procesada de forma segura)</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Datos de viaje (destino, fecha, asiento)</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Información de uso del sitio web (cookies, analytics)</span>
							</li>
						</ul>
					</Card>

					<Card className="border-[#A9A9A9]/20 bg-white p-6 backdrop-blur-sm">
						<h2 className="mb-4 flex items-center text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
							<span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#A6402C]/10 text-[#A6402C]">
								2
							</span>
							Uso de la Información
						</h2>
						<p className="mb-3 text-sm text-[#4A4A4A] sm:text-base">Utilizamos tus datos para:</p>
						<ul className="space-y-2 text-sm text-[#4A4A4A] sm:text-base">
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Procesar y confirmar tus reservaciones</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Enviarte actualizaciones sobre tu viaje</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Mejorar nuestros servicios</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Enviarte ofertas y promociones (si lo autorizas)</span>
							</li>
						</ul>
					</Card>

					<Card className="border-[#A9A9A9]/20 bg-white p-6 backdrop-blur-sm">
						<h2 className="mb-4 flex items-center text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
							<span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#A6402C]/10 text-[#A6402C]">
								3
							</span>
							Protección de Datos
						</h2>
						<p className="text-sm text-[#4A4A4A] sm:text-base">
							Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra acceso no
							autorizado, pérdida o alteración. Utilizamos cifrado SSL para todas las transacciones y almacenamiento
							seguro de información.
						</p>
					</Card>

					<Card className="border-[#A9A9A9]/20 bg-white p-6 backdrop-blur-sm">
						<h2 className="mb-4 flex items-center text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
							<span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#A6402C]/10 text-[#A6402C]">
								4
							</span>
							Tus Derechos
						</h2>
						<p className="mb-3 text-sm text-[#4A4A4A] sm:text-base">Tienes derecho a:</p>
						<ul className="space-y-2 text-sm text-[#4A4A4A] sm:text-base">
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Acceder a tus datos personales</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Corregir información incorrecta</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Solicitar la eliminación de tus datos</span>
							</li>
							<li className="flex items-start">
								<Icon icon="solar:check-circle-bold" className="mr-2 mt-0.5 text-[#A6402C]" size={20} />
								<span>Oponerte al procesamiento de tus datos</span>
							</li>
						</ul>
					</Card>

					<Card className="border-[#A6402C]/20 bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 p-6">
						<h2 className="mb-3 flex items-center text-lg font-semibold text-[#1A1A1A] sm:text-xl">
							<Icon icon="solar:letter-bold-duotone" className="mr-2 text-[#A6402C]" size={24} />
							Contacto
						</h2>
						<p className="text-sm text-[#4A4A4A] sm:text-base">
							Para ejercer tus derechos o hacer preguntas sobre esta política, contáctanos en:{" "}
							<a href="mailto:privacidad@bustix.com" className="font-medium text-[#A6402C] hover:text-[#803549]">
								privacidad@bustix.com
							</a>
						</p>
					</Card>
				</div>
			</div>
		</div>
	);
}
