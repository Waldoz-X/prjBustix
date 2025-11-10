import { useState } from "react";
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function Contacto() {
	const [formData, setFormData] = useState({
		nombre: "",
		email: "",
		telefono: "",
		asunto: "",
		mensaje: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert("Mensaje enviado. Te contactaremos pronto.");
		setFormData({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" });
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const contactInfo = [
		{
			icono: "solar:letter-bold-duotone",
			titulo: "Email",
			info: "contacto@bustix.com",
			link: "mailto:contacto@bustix.com",
		},
		{
			icono: "solar:phone-bold-duotone",
			titulo: "Teléfono",
			info: "+52 (55) 1234-5678",
			link: "tel:+525512345678",
		},
		{
			icono: "solar:map-point-bold-duotone",
			titulo: "Oficina",
			info: "Ciudad de México, México",
			link: "#",
		},
		{
			icono: "solar:clock-circle-bold-duotone",
			titulo: "Horario",
			info: "Lun - Vie: 9:00 - 18:00",
			link: "#",
		},
	];

	return (
		<div className="min-h-screen bg-[#F0EBE3]">
			{/* Hero con imagen de fondo */}
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
						<span className="text-sm font-medium text-[#F0EBE3]">Respuesta en menos de 24 horas</span>
					</div>

					<Icon icon="solar:letter-bold-duotone" className="mx-auto mb-6 text-[#A6402C]" size={64} />

					<h1 className="mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
						Hablemos de tu{" "}
						<span className="bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-transparent">
							Próximo Viaje
						</span>
					</h1>

					<p className="mx-auto max-w-2xl text-base leading-relaxed text-[#A9A9A9] sm:text-lg">
						Nuestro equipo está listo para ayudarte a planificar la experiencia perfecta. Escríbenos y hagamos realidad
						tu próxima aventura
					</p>
				</div>

				<div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-[#A6402C]/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#803549]/10 blur-3xl" />
			</section>

			{/* Sección de confianza */}
			<section className="relative -mt-16 px-4 lg:px-6">
				<div className="container mx-auto max-w-6xl">
					<div className="grid gap-4 sm:grid-cols-3">
						{[
							{
								icon: "solar:users-group-rounded-bold-duotone",
								numero: "50,000+",
								label: "Clientes Satisfechos",
							},
							{
								icon: "solar:star-bold-duotone",
								numero: "4.9/5",
								label: "Calificación Promedio",
							},
							{
								icon: "solar:clock-circle-bold-duotone",
								numero: "< 24h",
								label: "Tiempo de Respuesta",
							},
						].map((stat) => (
							<Card
								key={stat.label}
								className="group relative overflow-hidden border-2 border-[#A9A9A9]/10 bg-white p-6 text-center shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/30"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-[#A6402C]/0 to-[#803549]/0 transition-all duration-300 group-hover:from-[#A6402C]/10 group-hover:to-[#803549]/10" />
								<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#A6402C]/5 transition-all duration-300 group-hover:scale-150 group-hover:bg-[#A6402C]/10" />

								<div className="relative">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 transition-all duration-300 group-hover:scale-110 group-hover:from-[#A6402C]/20 group-hover:to-[#803549]/20">
										<Icon
											icon={stat.icon}
											size={32}
											className="text-[#A6402C] transition-all duration-300 group-hover:scale-110"
										/>
									</div>
									<div className="mb-2 bg-gradient-to-r from-[#A6402C] to-[#803549] bg-clip-text text-4xl font-bold text-transparent">
										{stat.numero}
									</div>
									<div className="text-sm font-medium text-[#4A4A4A] transition-colors duration-300 group-hover:text-[#1A1A1A]">
										{stat.label}
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Contenido Principal */}
			<section className="py-12 sm:py-16 lg:py-20">
				<div className="container mx-auto max-w-6xl px-4 lg:px-6">
					<div className="grid gap-8 lg:grid-cols-3">
						{/* Información de Contacto */}
						<div className="space-y-6 lg:col-span-1">
							<div>
								<h2 className="mb-6 text-2xl font-bold text-[#1A1A1A]">
									Formas de <span className="text-[#A6402C]">Contacto</span>
								</h2>
								<div className="space-y-4">
									{contactInfo.map((item) => (
										<Card
											key={item.titulo}
											className="group relative overflow-hidden border-2 border-[#A9A9A9]/10 bg-white p-5 transition-all duration-300 hover:scale-105 hover:border-[#A6402C]/30 hover:shadow-2xl hover:shadow-[#A6402C]/20"
										>
											{/* Gradiente de fondo animado */}
											<div className="absolute inset-0 bg-gradient-to-br from-[#A6402C]/0 to-[#803549]/0 transition-all duration-300 group-hover:from-[#A6402C]/5 group-hover:to-[#803549]/5" />

											<a href={item.link} className="relative flex items-start gap-4 transition-colors">
												<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-[#A6402C]/20 group-hover:to-[#803549]/20 group-hover:shadow-xl">
													<Icon
														icon={item.icono}
														size={24}
														className="text-[#A6402C] transition-transform duration-300 group-hover:scale-110"
													/>
												</div>
												<div className="flex-1">
													<div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#A9A9A9]">
														{item.titulo}
													</div>
													<div className="text-sm font-semibold text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#A6402C]">
														{item.info}
													</div>
												</div>
												<Icon
													icon="solar:arrow-right-bold"
													size={20}
													className="flex-shrink-0 text-[#A9A9A9] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-[#A6402C]"
												/>
											</a>
										</Card>
									))}
								</div>
							</div>

							{/* Redes Sociales */}
							<Card className="relative overflow-hidden border-2 border-[#A9A9A9]/10 bg-white p-6">
								<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#A6402C]/5" />
								<h3 className="mb-5 text-base font-bold text-[#1A1A1A]">
									Síguenos en <span className="text-[#A6402C]">Redes Sociales</span>
								</h3>
								<div className="flex gap-3">
									{[
										{ icon: "solar:facebook-bold", link: "#", name: "Facebook" },
										{ icon: "solar:instagram-bold", link: "#", name: "Instagram" },
										{ icon: "solar:twitter-bold", link: "#", name: "Twitter" },
										{ icon: "solar:linkedin-bold", link: "#", name: "LinkedIn" },
									].map((social) => (
										<a
											key={social.name}
											href={social.link}
											title={social.name}
											className="group flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EBE3] text-[#4A4A4A] shadow-md transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-[#A6402C] hover:to-[#803549] hover:text-white hover:shadow-xl hover:shadow-[#A6402C]/30"
										>
											<Icon
												icon={social.icon}
												size={22}
												className="transition-transform duration-300 group-hover:scale-110"
											/>
										</a>
									))}
								</div>
							</Card>

							{/* Card adicional de tiempo de respuesta */}
							<Card className="border-2 border-[#A6402C]/20 bg-gradient-to-br from-[#A6402C]/5 to-[#803549]/5 p-6">
								<div className="flex items-start gap-4">
									<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#A6402C] to-[#803549] shadow-lg">
										<Icon icon="solar:clock-circle-bold" size={24} className="text-white" />
									</div>
									<div>
										<h4 className="mb-1 font-bold text-[#1A1A1A]">Respuesta Rápida</h4>
										<p className="text-sm text-[#4A4A4A]">Te respondemos en menos de 24 horas en días hábiles</p>
									</div>
								</div>
							</Card>
						</div>

						{/* Formulario */}
						<div className="lg:col-span-2">
							<Card className="relative overflow-hidden border-2 border-[#A9A9A9]/10 bg-white p-6 shadow-xl sm:p-8">
								{/* Decoración de fondo */}
								<div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#A6402C]/5 blur-3xl" />
								<div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[#803549]/5 blur-3xl" />

								<div className="relative">
									<div className="mb-6 flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10">
											<Icon icon="solar:pen-new-square-bold-duotone" size={24} className="text-[#A6402C]" />
										</div>
										<div>
											<h2 className="text-2xl font-bold text-[#1A1A1A]">
												Envíanos un <span className="text-[#A6402C]">Mensaje</span>
											</h2>
											<p className="text-sm text-[#4A4A4A]">Completa el formulario y te contactaremos pronto</p>
										</div>
									</div>

									<form onSubmit={handleSubmit} className="space-y-6">
										<div className="grid gap-6 sm:grid-cols-2">
											<div className="group">
												<label
													htmlFor="nombre"
													className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4A4A4A]"
												>
													<Icon icon="solar:user-bold-duotone" size={16} className="text-[#A6402C]" />
													Nombre Completo
												</label>
												<input
													type="text"
													id="nombre"
													name="nombre"
													value={formData.nombre}
													onChange={handleChange}
													required
													className="w-full rounded-lg border-2 border-[#A9A9A9]/20 bg-[#F0EBE3] px-4 py-3 text-[#1A1A1A] transition-all focus:border-[#A6402C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#A6402C]/10"
													placeholder="Juan Pérez"
												/>
											</div>
											<div className="group">
												<label
													htmlFor="email"
													className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4A4A4A]"
												>
													<Icon icon="solar:letter-bold-duotone" size={16} className="text-[#A6402C]" />
													Email
												</label>
												<input
													type="email"
													id="email"
													name="email"
													value={formData.email}
													onChange={handleChange}
													required
													className="w-full rounded-lg border-2 border-[#A9A9A9]/20 bg-[#F0EBE3] px-4 py-3 text-[#1A1A1A] transition-all focus:border-[#A6402C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#A6402C]/10"
													placeholder="juan@email.com"
												/>
											</div>
										</div>

										<div className="grid gap-6 sm:grid-cols-2">
											<div className="group">
												<label
													htmlFor="telefono"
													className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4A4A4A]"
												>
													<Icon icon="solar:phone-bold-duotone" size={16} className="text-[#A6402C]" />
													Teléfono
												</label>
												<input
													type="tel"
													id="telefono"
													name="telefono"
													value={formData.telefono}
													onChange={handleChange}
													className="w-full rounded-lg border-2 border-[#A9A9A9]/20 bg-[#F0EBE3] px-4 py-3 text-[#1A1A1A] transition-all focus:border-[#A6402C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#A6402C]/10"
													placeholder="+52 555 123 4567"
												/>
											</div>
											<div className="group">
												<label
													htmlFor="asunto"
													className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4A4A4A]"
												>
													<Icon icon="solar:tag-bold-duotone" size={16} className="text-[#A6402C]" />
													Asunto
												</label>
												<select
													id="asunto"
													name="asunto"
													value={formData.asunto}
													onChange={handleChange}
													required
													className="w-full rounded-lg border-2 border-[#A9A9A9]/20 bg-[#F0EBE3] px-4 py-3 text-[#1A1A1A] transition-all focus:border-[#A6402C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#A6402C]/10"
												>
													<option value="">Selecciona un asunto</option>
													<option value="reservacion">Reservación</option>
													<option value="soporte">Soporte Técnico</option>
													<option value="corporativo">Servicios Corporativos</option>
													<option value="otro">Otro</option>
												</select>
											</div>
										</div>

										<div className="group">
											<label
												htmlFor="mensaje"
												className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4A4A4A]"
											>
												<Icon icon="solar:document-text-bold-duotone" size={16} className="text-[#A6402C]" />
												Mensaje
											</label>
											<textarea
												id="mensaje"
												name="mensaje"
												value={formData.mensaje}
												onChange={handleChange}
												required
												rows={6}
												className="w-full rounded-lg border-2 border-[#A9A9A9]/20 bg-[#F0EBE3] px-4 py-3 text-[#1A1A1A] transition-all focus:border-[#A6402C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#A6402C]/10"
												placeholder="Cuéntanos cómo podemos ayudarte a planificar tu próximo viaje..."
											/>
										</div>

										<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
											<button
												type="submit"
												className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#A6402C]/50 hover:brightness-110"
											>
												<Icon
													icon="solar:paper-plane-bold"
													size={20}
													className="transition-transform duration-300 group-hover:translate-x-1"
												/>
												Enviar Mensaje
											</button>

											<div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
												<Icon icon="solar:shield-check-bold-duotone" size={20} className="text-[#A6402C]" />
												<span>Tus datos están seguros</span>
											</div>
										</div>
									</form>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
