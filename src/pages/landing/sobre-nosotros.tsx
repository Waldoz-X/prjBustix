// -----------------------------------------------------------------------------
// landing/sobre-nosotros.tsx
// Página sobre nosotros - BusTix - Paleta elegante
// -----------------------------------------------------------------------------

// Importar imágenes
import about1 from "@/assets/images/landing/about/about_1.png";
import about2 from "@/assets/images/landing/about/about_2.png";
import about3 from "@/assets/images/landing/about/about_3.png";
import about4 from "@/assets/images/landing/about/about_4.png";
import about5 from "@/assets/images/landing/about/about_5.png";
import about6 from "@/assets/images/landing/about/about_6.png";
import about7 from "@/assets/images/landing/about/about_7.png";
import about8 from "@/assets/images/landing/about/about_8.png";
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function SobreNosotros() {
	const milestones = [
		{
			year: "2019",
			title: "Fundación",
			description: "Nace BusTix con la visión de revolucionar el transporte a eventos masivos en México.",
			icon: "solar:rocket-bold-duotone",
			image: about5,
		},
		{
			year: "2020",
			title: "Expansión",
			description: "Alcanzamos 10 ciudades y transportamos a 5,000 personas a sus eventos favoritos.",
			icon: "solar:map-arrow-up-bold-duotone",
			image: about3,
		},
		{
			year: "2022",
			title: "Innovación",
			description: "Lanzamos nuestra plataforma digital y sistema de reservaciones en tiempo real.",
			icon: "solar:smartphone-bold-duotone",
			image: about2,
		},
		{
			year: "2024",
			title: "Líder del Mercado",
			description: "50,000+ viajeros felices nos posicionan como #1 en transporte a eventos.",
			icon: "solar:cup-star-bold-duotone",
			image: about4,
		},
	];

	const valores = [
		{
			icon: "solar:shield-check-bold-duotone",
			title: "Seguridad Primero",
			description: "Conductores certificados, unidades con mantenimiento preventivo y seguro de viajero incluido.",
			stats: "0 accidentes",
		},
		{
			icon: "solar:star-bold-duotone",
			title: "Excelencia",
			description: "Superamos expectativas con servicio de primera clase, puntualidad y atención al detalle.",
			stats: "98% satisfacción",
		},
		{
			icon: "solar:users-group-rounded-bold-duotone",
			title: "Comunidad",
			description: "Creamos conexiones entre personas que comparten la pasión por la música y eventos en vivo.",
			stats: "50,000+ viajeros",
		},
		{
			icon: "solar:leaf-bold-duotone",
			title: "Sostenibilidad",
			description: "Viajes compartidos que reducen la huella de carbono y promueven el transporte responsable.",
			stats: "-40% emisiones",
		},
	];

	const equipo = [
		{
			nombre: "Carlos Méndez",
			puesto: "CEO & Fundador",
			descripcion: "Visionario del transporte inteligente",
			imagen: about6,
			frase: '"Conectamos personas con sus pasiones"',
		},
		{
			nombre: "Ana Rodríguez",
			puesto: "Directora de Operaciones",
			descripcion: "Experta en logística y excelencia",
			imagen: about7,
			frase: '"La perfección está en los detalles"',
		},
		{
			nombre: "Miguel Torres",
			puesto: "Director de Tecnología",
			descripcion: "Innovador de soluciones digitales",
			imagen: about8,
			frase: '"La tecnología al servicio de la experiencia"',
		},
	];

	const stats = [
		{ numero: "50K+", label: "Viajeros Felices", icon: "solar:users-group-rounded-bold" },
		{ numero: "500+", label: "Eventos Cubiertos", icon: "solar:ticket-bold" },
		{ numero: "15", label: "Ciudades", icon: "solar:map-point-bold" },
		{ numero: "98%", label: "Satisfacción", icon: "solar:star-bold" },
	];

	return (
		<div className="min-h-screen bg-[#F0EBE3]">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-r from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] py-20 text-white sm:py-28 lg:py-32">
				{/* Background Image */}
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
					style={{
						backgroundImage: `url(${about1})`,
						backgroundBlendMode: "overlay",
					}}
				/>

				{/* Dark overlay for better text readability */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 via-[#4A4A4A]/70 to-[#1A1A1A]/80" />

				<div className="container relative z-10 mx-auto max-w-5xl px-4 text-center lg:px-6">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A6402C]/30 bg-[#A6402C]/10 px-4 py-2 backdrop-blur-sm">
						<Icon icon="solar:star-bold" className="text-[#A6402C]" size={20} />
						<span className="text-sm font-medium text-[#F0EBE3]">Líderes en Transporte a Eventos</span>
					</div>
					<h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
						Más que Transporte,{" "}
						<span className="bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-transparent">
							Una Experiencia
						</span>
					</h1>
					<p className="mx-auto max-w-2xl text-base leading-relaxed text-[#A9A9A9] sm:text-lg">
						Desde 2019, conectamos a miles de personas con los mejores eventos de música y entretenimiento. Nuestra
						misión es simple: hacer que cada viaje sea tan memorable como el evento mismo.
					</p>
				</div>

				<div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-[#A6402C]/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#803549]/10 blur-3xl" />
			</section>

			{/* Stats Section */}
			<section className="relative -mt-16 px-4 lg:px-6">
				<div className="container mx-auto max-w-6xl">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{stats.map((stat) => (
							<Card
								key={stat.label}
								className="group relative overflow-hidden border-[#A9A9A9]/20 bg-white p-6 text-center shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/30"
							>
								{/* Background gradient animado */}
								<div className="absolute inset-0 bg-gradient-to-br from-[#A6402C]/0 to-[#803549]/0 transition-all duration-300 group-hover:from-[#A6402C]/10 group-hover:to-[#803549]/10" />

								{/* Decoración de fondo */}
								<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#A6402C]/5 transition-all duration-300 group-hover:scale-150 group-hover:bg-[#A6402C]/10" />

								<div className="relative">
									{/* Icono con animación */}
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 transition-all duration-300 group-hover:scale-110 group-hover:from-[#A6402C]/20 group-hover:to-[#803549]/20">
										<Icon
											icon={stat.icon}
											size={32}
											className="text-[#A6402C] transition-all duration-300 group-hover:scale-110"
										/>
									</div>

									{/* Número con gradiente */}
									<div className="mb-2 bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
										{stat.numero}
									</div>

									{/* Label */}
									<div className="text-sm font-medium text-[#4A4A4A] transition-colors duration-300 group-hover:text-[#1A1A1A]">
										{stat.label}
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Timeline Section */}
			<section className="py-16 sm:py-20 lg:py-24">
				<div className="container mx-auto max-w-6xl px-4 lg:px-6">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
							Nuestra <span className="text-[#A6402C]">Historia</span>
						</h2>
						<p className="mx-auto max-w-2xl text-[#4A4A4A]">
							Un viaje de pasión, innovación y compromiso con nuestros viajeros
						</p>
					</div>

					<div className="relative">
						<div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-[#A6402C] via-[#803549] to-[#A6402C] sm:left-1/2" />

						<div className="space-y-12">
							{milestones.map((milestone, index) => (
								<div
									key={milestone.year}
									className={`relative flex flex-col items-start gap-6 sm:flex-row sm:items-center ${
										index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
									}`}
								>
									<div className="absolute left-8 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#F0EBE3] bg-gradient-to-br from-[#A6402C] to-[#803549] shadow-lg sm:left-1/2">
										<span className="text-sm font-bold text-white">{milestone.year}</span>
									</div>

									<div
										className={`ml-20 w-full sm:ml-0 sm:w-5/12 ${index % 2 === 0 ? "sm:mr-auto sm:pr-12" : "sm:ml-auto sm:pl-12"}`}
									>
										<Card className="group overflow-hidden border-[#A9A9A9]/20 bg-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
											{/* Imagen */}
											<div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10">
												<img
													src={milestone.image}
													alt={milestone.title}
													className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

												{/* Icono en esquina inferior izquierda */}
												<div className="absolute bottom-3 left-3">
													<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A1A1A] to-[#4A4A4A] shadow-xl">
														<Icon icon={milestone.icon} size={24} className="text-[#A6402C]" />
													</div>
												</div>
											</div>

											{/* Contenido */}
											<div className="p-6">
												<h3 className="mb-2 text-xl font-bold text-[#A6402C]">{milestone.title}</h3>
												<p className="text-sm text-[#4A4A4A]">{milestone.description}</p>
											</div>
										</Card>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Valores Section */}
			<section className="bg-white py-16 sm:py-20">
				<div className="container mx-auto max-w-6xl px-4 lg:px-6">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
							Nuestros <span className="text-[#A6402C]">Valores</span>
						</h2>
						<p className="mx-auto max-w-2xl text-[#4A4A4A]">Los principios que guían cada decisión que tomamos</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{valores.map((valor) => (
							<Card
								key={valor.title}
								className="group relative overflow-hidden border-2 border-[#A9A9A9]/10 bg-[#F0EBE3] p-6 transition-all duration-300 hover:scale-105 hover:border-[#A6402C]/30 hover:shadow-2xl hover:shadow-[#A6402C]/20"
							>
								{/* Gradiente de fondo animado */}
								<div className="absolute inset-0 bg-gradient-to-br from-[#A6402C]/0 via-transparent to-[#803549]/0 transition-all duration-500 group-hover:from-[#A6402C]/10 group-hover:to-[#803549]/10" />

								{/* Decoración circular */}
								<div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#A6402C]/5 to-[#803549]/5 transition-all duration-500 group-hover:scale-150 group-hover:from-[#A6402C]/10 group-hover:to-[#803549]/10" />

								<div className="relative">
									{/* Icono con fondo animado */}
									<div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-[#A6402C]/20 group-hover:to-[#803549]/20 group-hover:shadow-xl group-hover:shadow-[#A6402C]/30">
										<Icon
											icon={valor.icon}
											className="text-[#A6402C] transition-transform duration-300 group-hover:scale-110"
											size={32}
										/>
									</div>

									{/* Título */}
									<h3 className="mb-3 text-lg font-bold text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#A6402C]">
										{valor.title}
									</h3>

									{/* Descripción */}
									<p className="mb-4 text-sm leading-relaxed text-[#4A4A4A]">{valor.description}</p>

									{/* Stats con badge */}
									<div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A6402C]/10 to-[#803549]/10 px-3 py-1.5 text-xs font-semibold text-[#A6402C] transition-all duration-300 group-hover:from-[#A6402C]/20 group-hover:to-[#803549]/20">
										<Icon icon="solar:graph-up-bold" size={14} />
										{valor.stats}
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Equipo Section */}
			<section className="py-16 sm:py-20">
				<div className="container mx-auto max-w-6xl px-4 lg:px-6">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
							El <span className="text-[#A6402C]">Equipo</span>
						</h2>
						<p className="mx-auto max-w-2xl text-[#4A4A4A]">Las mentes detrás de la mejor experiencia de viaje</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{equipo.map((miembro) => (
							<Card
								key={miembro.nombre}
								className="group overflow-hidden border-[#A9A9A9]/20 bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/20"
							>
								<div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10">
									<img
										src={miembro.imagen}
										alt={miembro.nombre}
										className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/50 to-transparent" />

									{/* Nombre y puesto sobre la imagen */}
									<div className="absolute bottom-0 left-0 right-0 p-6">
										<h3 className="mb-1 text-xl font-bold text-white">{miembro.nombre}</h3>
										<p className="text-sm font-medium text-[#A6402C]">{miembro.puesto}</p>
									</div>
								</div>
								<div className="p-6">
									<p className="mb-3 text-sm text-[#4A4A4A]">{miembro.descripcion}</p>
									<div className="border-l-2 border-[#A6402C] pl-3">
										<p className="text-xs italic text-[#4A4A4A]">{miembro.frase}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 sm:py-20">
				<div className="container mx-auto max-w-4xl px-4 lg:px-6">
					<Card className="relative overflow-hidden border-[#A6402C]/30 bg-gradient-to-br from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] p-8 text-center shadow-2xl sm:p-12">
						{/* Decorative elements */}
						<div className="pointer-events-none absolute -left-20 top-0 h-60 w-60 rounded-full bg-[#A6402C]/20 blur-3xl" />
						<div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-[#803549]/20 blur-3xl" />

						<div className="relative">
							<Icon icon="solar:heart-bold-duotone" className="mx-auto mb-6 text-[#A6402C]" size={64} />
							<h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
								Únete a la Familia{" "}
								<span className="bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-transparent">
									BusTix
								</span>
							</h2>
							<p className="mb-8 text-sm text-[#A9A9A9] sm:text-base lg:text-lg">
								Más de 50,000 personas ya confían en nosotros. ¿Estás listo para vivir tu próxima aventura?
							</p>
							<a
								href="/tours"
								className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-8 py-3 font-medium shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/50 hover:brightness-110"
								style={{ color: "#FFFFFF" }}
							>
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
