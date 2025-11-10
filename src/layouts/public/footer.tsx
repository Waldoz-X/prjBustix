// filepath: c:\Users\sierr\WebstormProjects\prjbustix\src\layouts\public\footer.tsx
// -----------------------------------------------------------------------------
// public/footer.tsx
// Footer profesional para BusTix - Paleta elegante - Totalmente Responsivo
// -----------------------------------------------------------------------------
import { Link } from "react-router";
import { Icon } from "@/components/icon";
import Logo from "@/components/logo";

export default function PublicFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-[#4A4A4A]/20 bg-[#1A1A1A]">
			<div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
				<div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-10">
					{/* Columna 1: Logo y descripción */}
					<div className="space-y-3 sm:space-y-4">
						<div className="flex items-center">
							<Logo size={28} className="sm:hidden" />
							<Logo size={36} className="hidden sm:block lg:hidden" />
							<Logo size={40} className="hidden lg:block" />
						</div>
						<p className="text-xs leading-relaxed text-[#A9A9A9] sm:text-sm lg:pr-4">
							Tu mejor opción para viajes a eventos masivos. Comodidad, seguridad y diversión garantizada.
						</p>
						{/* Redes Sociales */}
						<div className="flex flex-wrap gap-2">
							<a
								href="https://facebook.com"
								target="_blank"
								rel="noopener noreferrer"
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A4A4A] text-[#A9A9A9] transition-all hover:bg-[#A6402C] hover:text-white sm:h-9 sm:w-9"
								aria-label="Facebook"
							>
								<Icon icon="solar:facebook-bold" size={16} className="sm:h-[18px] sm:w-[18px]" />
							</a>
							<a
								href="https://instagram.com"
								target="_blank"
								rel="noopener noreferrer"
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A4A4A] text-[#A9A9A9] transition-all hover:bg-[#A6402C] hover:text-white sm:h-9 sm:w-9"
								aria-label="Instagram"
							>
								<Icon icon="solar:instagram-bold" size={16} className="sm:h-[18px] sm:w-[18px]" />
							</a>
							<a
								href="https://twitter.com"
								target="_blank"
								rel="noopener noreferrer"
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A4A4A] text-[#A9A9A9] transition-all hover:bg-[#A6402C] hover:text-white sm:h-9 sm:w-9"
								aria-label="Twitter"
							>
								<Icon icon="solar:twitter-bold" size={16} className="sm:h-[18px] sm:w-[18px]" />
							</a>
							<a
								href="https://linkedin.com"
								target="_blank"
								rel="noopener noreferrer"
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A4A4A] text-[#A9A9A9] transition-all hover:bg-[#A6402C] hover:text-white sm:h-9 sm:w-9"
								aria-label="LinkedIn"
							>
								<Icon icon="solar:linkedin-bold" size={16} className="sm:h-[18px] sm:w-[18px]" />
							</a>
						</div>
					</div>

					{/* Columna 2: Enlaces Rápidos */}
					<div>
						<h3 className="mb-2.5 text-xs font-semibold text-[#F0EBE3] sm:mb-3 sm:text-sm">Enlaces Rápidos</h3>
						<ul className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
							<li>
								<Link
									to="/"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Inicio
								</Link>
							</li>
							<li>
								<Link
									to="/sobre-nosotros"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Sobre Nosotros
								</Link>
							</li>
							<li>
								<Link
									to="/servicios"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Servicios
								</Link>
							</li>
							<li>
								<Link
									to="/tours"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Tours Disponibles
								</Link>
							</li>
							<li>
								<Link
									to="/galeria"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Galería
								</Link>
							</li>
						</ul>
					</div>

					{/* Columna 3: Más Información */}
					<div>
						<h3 className="mb-2.5 text-xs font-semibold text-[#F0EBE3] sm:mb-3 sm:text-sm">Información</h3>
						<ul className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
							<li>
								<Link
									to="/como-funciona"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Cómo Funciona
								</Link>
							</li>
							<li>
								<Link
									to="/contacto"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Contacto
								</Link>
							</li>
							<li>
								<Link
									to="/terminos"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Términos y Condiciones
								</Link>
							</li>
							<li>
								<Link
									to="/privacidad"
									className="text-[#A9A9A9] no-underline transition-colors hover:text-[#A6402C] hover:no-underline"
									style={{ color: "#A9A9A9" }}
								>
									Política de Privacidad
								</Link>
							</li>
						</ul>
					</div>

					{/* Columna 4: Contacto */}
					<div>
						<h3 className="mb-2.5 text-xs font-semibold text-[#F0EBE3] sm:mb-3 sm:text-sm">Contacto</h3>
						<ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
							<li className="flex items-start gap-2 text-[#A9A9A9]">
								<Icon icon="solar:letter-bold" className="mt-0.5 flex-shrink-0 text-[#A6402C]" size={16} />
								<span className="break-all">contacto@bustix.com</span>
							</li>
							<li className="flex items-start gap-2 text-[#A9A9A9]">
								<Icon icon="solar:phone-bold" className="mt-0.5 flex-shrink-0 text-[#A6402C]" size={16} />
								<span className="whitespace-nowrap">+52 (55) 1234-5678</span>
							</li>
							<li className="flex items-start gap-2 text-[#A9A9A9]">
								<Icon icon="solar:map-point-bold" className="mt-0.5 flex-shrink-0 text-[#A6402C]" size={16} />
								<span>Ciudad de México, México</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-6 border-t border-[#4A4A4A] pt-5 sm:mt-8 sm:pt-6 lg:mt-10 lg:pt-8">
					<div className="flex flex-col items-center justify-between gap-2.5 text-xs text-[#A9A9A9] sm:flex-row sm:gap-4 sm:text-sm">
						<p className="text-center sm:text-left">© {currentYear} BusTix. Todos los derechos reservados.</p>
						<div className="flex flex-wrap justify-center gap-3 sm:gap-4">
							<Link
								to="/terminos"
								className="text-[#A9A9A9] no-underline hover:text-[#A6402C] hover:no-underline"
								style={{ color: "#A9A9A9" }}
							>
								Términos
							</Link>
							<Link
								to="/privacidad"
								className="text-[#A9A9A9] no-underline hover:text-[#A6402C] hover:no-underline"
								style={{ color: "#A9A9A9" }}
							>
								Privacidad
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
