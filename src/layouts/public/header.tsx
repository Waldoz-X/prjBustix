// filepath: c:\Users\sierr\WebstormProjects\prjbustix\src\layouts\public\header.tsx
// -----------------------------------------------------------------------------
// public/header.tsx
// Header profesional para BusTix - Paleta elegante - Totalmente Responsivo
// -----------------------------------------------------------------------------
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Icon } from "@/components/icon";
import Logo from "@/components/logo";

export default function PublicHeader() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const navigate = useNavigate();

	const navLinks = [
		{ name: "Inicio", path: "/" },
		{ name: "Sobre Nosotros", path: "/sobre-nosotros" },
		{ name: "Servicios", path: "/servicios" },
		{ name: "Tours", path: "/tours" },
		{ name: "Galería", path: "/galeria" },
		{ name: "Cómo Funciona", path: "/como-funciona" },
		{ name: "Contacto", path: "/contacto" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b border-[#4A4A4A]/20 bg-[#F0EBE3]/95 shadow-sm backdrop-blur-md">
			<div className="w-full">
				<nav className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
					{/* Logo - Pegado a la izquierda */}
					<div className="flex flex-shrink-0 items-center transition-opacity hover:opacity-80">
						<Logo size={28} className="sm:hidden" />
						<Logo size={36} className="hidden sm:block lg:hidden" />
						<Logo size={40} className="hidden lg:block" />
					</div>

					{/* Desktop Navigation - Centrado */}
					<div className="hidden flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className="whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium text-[#4A4A4A] no-underline transition-all hover:bg-white hover:text-[#A6402C] hover:no-underline xl:px-3 xl:text-sm"
								style={{ color: "#4A4A4A" }}
							>
								{link.name}
							</Link>
						))}
					</div>

					{/* Auth Buttons Desktop - Pegado a la derecha */}
					<div className="hidden flex-shrink-0 items-center gap-2 lg:flex">
						<button
							type="button"
							onClick={() => navigate("/auth/login")}
							className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-[#4A4A4A] transition-all hover:bg-white hover:text-[#1A1A1A] xl:px-4 xl:py-2 xl:text-sm"
						>
							Iniciar Sesión
						</button>
						<button
							type="button"
							onClick={() => navigate("/register")}
							className="whitespace-nowrap rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg xl:px-4 xl:py-2 xl:text-sm"
						>
							Registrarse
						</button>
					</div>

					{/* Mobile Menu Button - Pegado a la derecha */}
					<button
						type="button"
						className="flex-shrink-0 rounded-lg p-1 text-[#4A4A4A] transition-colors hover:bg-white hover:text-[#A6402C] sm:p-1.5 lg:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						<Icon icon={mobileMenuOpen ? "solar:close-square-bold" : "solar:hamburger-menu-bold"} size={24} />
					</button>
				</nav>
			</div>

			{/* Mobile Menu con animación */}
			<div
				className={`overflow-hidden border-t border-[#4A4A4A]/20 bg-[#F0EBE3] transition-all duration-300 ease-in-out lg:hidden ${
					mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="w-full space-y-0.5 px-4 py-3 sm:space-y-1 sm:px-6 sm:py-4">
					{navLinks.map((link) => (
						<Link
							key={link.path}
							to={link.path}
							className="block rounded-lg px-3 py-2 text-sm font-medium text-[#4A4A4A] no-underline transition-colors hover:bg-white hover:text-[#A6402C] hover:no-underline sm:px-4 sm:py-2.5 sm:text-base"
							style={{ color: "#4A4A4A" }}
							onClick={() => setMobileMenuOpen(false)}
						>
							{link.name}
						</Link>
					))}
					<div className="flex flex-col gap-2 border-t border-[#4A4A4A]/20 pt-3 sm:pt-4">
						<button
							type="button"
							onClick={() => {
								setMobileMenuOpen(false);
								navigate("/auth/login");
							}}
							className="w-full rounded-lg border border-[#A9A9A9] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-all hover:border-[#A6402C] hover:bg-white hover:text-[#1A1A1A] sm:py-2.5 sm:text-base"
						>
							Iniciar Sesión
						</button>
						<button
							type="button"
							onClick={() => {
								setMobileMenuOpen(false);
								navigate("/register");
							}}
							className="w-full rounded-lg bg-gradient-to-r from-[#A6402C] to-[#803549] px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg sm:py-2.5 sm:text-base"
						>
							Registrarse
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
