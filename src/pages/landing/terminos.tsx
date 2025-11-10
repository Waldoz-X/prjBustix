// -----------------------------------------------------------------------------
// landing/terminos.tsx
// Página de términos y condiciones
// -----------------------------------------------------------------------------
import { Card } from "@/ui/card";

export default function Terminos() {
	return (
		<div className="py-16">
			<div className="container mx-auto max-w-4xl px-4">
				<h1 className="mb-8 text-4xl font-bold">Términos y Condiciones</h1>

				<Card className="mb-6 p-6">
					<p className="mb-4 text-sm text-muted-foreground">Última actualización: Enero 2025</p>
					<p className="text-muted-foreground">
						Al utilizar los servicios de Vamos al Concierto, aceptas los siguientes términos y condiciones. Por favor,
						léelos cuidadosamente.
					</p>
				</Card>

				<div className="space-y-6">
					<section>
						<h2 className="mb-3 text-2xl font-semibold">1. Servicios</h2>
						<p className="text-muted-foreground">
							Vamos al Concierto ofrece servicios de transporte terrestre a eventos masivos, conciertos y festivales.
							Nuestros servicios incluyen transporte de ida y vuelta, asientos numerados y cobertura de seguro de
							viajero.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-2xl font-semibold">2. Reservaciones</h2>
						<p className="text-muted-foreground mb-2">
							Las reservaciones se confirman mediante el pago completo del boleto. Una vez confirmada, recibirás un
							correo electrónico con tu boleto digital.
						</p>
						<ul className="list-disc list-inside space-y-1 text-muted-foreground">
							<li>Los boletos son personales e intransferibles</li>
							<li>Debes presentar identificación oficial al abordar</li>
							<li>Se requiere llegar 15 minutos antes de la salida</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 text-2xl font-semibold">3. Cancelaciones y Reembolsos</h2>
						<p className="text-muted-foreground mb-2">Políticas de cancelación:</p>
						<ul className="list-disc list-inside space-y-1 text-muted-foreground">
							<li>Más de 7 días antes del evento: Reembolso del 100%</li>
							<li>Entre 3 y 7 días: Reembolso del 80%</li>
							<li>Entre 48 y 72 horas: Reembolso del 50%</li>
							<li>Menos de 48 horas: Sin reembolso</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 text-2xl font-semibold">4. Responsabilidades</h2>
						<p className="text-muted-foreground">
							Vamos al Concierto no se hace responsable por objetos perdidos, eventos cancelados por el organizador, o
							retrasos causados por condiciones climáticas o de tráfico. El usuario es responsable de sus pertenencias
							durante todo el viaje.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-2xl font-semibold">5. Conducta del Pasajero</h2>
						<p className="text-muted-foreground mb-2">Los pasajeros deben:</p>
						<ul className="list-disc list-inside space-y-1 text-muted-foreground">
							<li>Respetar al personal y otros pasajeros</li>
							<li>No consumir alcohol en exceso</li>
							<li>No fumar dentro de las unidades</li>
							<li>Seguir las instrucciones del personal</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 text-2xl font-semibold">6. Privacidad</h2>
						<p className="text-muted-foreground">
							Consulta nuestra Política de Privacidad para conocer cómo manejamos tus datos personales.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-2xl font-semibold">7. Modificaciones</h2>
						<p className="text-muted-foreground">
							Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados
							a través de nuestro sitio web.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-2xl font-semibold">8. Contacto</h2>
						<p className="text-muted-foreground">
							Para cualquier duda sobre estos términos, contáctanos en: info@vamosalconcierto.com
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
