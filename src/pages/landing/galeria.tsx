// -----------------------------------------------------------------------------
// landing/galeria.tsx
// Página de galería - BusTix - Paleta elegante
// -----------------------------------------------------------------------------

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function Galeria() {
	const [categoriaActiva, setCategoriaActiva] = useState("Todos");

	const categorias = ["Todos", "Eventos", "Unidades", "Experiencias"];

	const imagenes = [
		{ id: 1, titulo: "Corona Capital 2024", categoria: "Eventos", emoji: "🎸" },
		{ id: 2, titulo: "Nuestros Autobuses", categoria: "Unidades", emoji: "🚌" },
		{ id: 3, titulo: "Vive Latino", categoria: "Eventos", emoji: "🎤" },
		{ id: 4, titulo: "Interior Premium", categoria: "Unidades", emoji: "💺" },
		{ id: 5, titulo: "EDC México", categoria: "Eventos", emoji: "🎧" },
		{ id: 6, titulo: "Viajeros Felices", categoria: "Experiencias", emoji: "😊" },
		{ id: 7, titulo: "Hell & Heaven", categoria: "Eventos", emoji: "🤘" },
		{ id: 8, titulo: "Servicio a Bordo", categoria: "Experiencias", emoji: "☕" },
		{ id: 9, titulo: "Pa'l Norte", categoria: "Eventos", emoji: "🌵" },
	];

	const imagenesFiltradas =
		categoriaActiva === "Todos" ? imagenes : imagenes.filter((img) => img.categoria === categoriaActiva);

	return (
		<div className="min-h-screen bg-[#F0EBE3]">
			{/* Hero */}
			<section className="bg-gradient-to-r from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] py-16 text-white sm:py-20">
				<div className="container mx-auto px-4 text-center lg:px-6">
					<Icon icon="solar:gallery-bold-duotone" className="mx-auto mb-4 text-[#A6402C]" size={56} />
					<h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">Galería</h1>
					<p className="mx-auto max-w-2xl text-base text-[#A9A9A9] sm:text-lg">
						Momentos inolvidables capturados en nuestros viajes
					</p>
				</div>
			</section>

			{/* Filtros */}
			<section className="border-b border-[#A9A9A9]/20 bg-white py-6">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="flex flex-wrap justify-center gap-2">
						{categorias.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setCategoriaActiva(cat)}
								className={`rounded-lg px-4 py-2 text-sm font-medium transition-all sm:px-6 ${
									categoriaActiva === cat
										? "bg-gradient-to-r from-[#A6402C] to-[#803549] text-white shadow-md"
										: "border border-[#A9A9A9]/30 bg-[#F0EBE3] text-[#4A4A4A] hover:border-[#A6402C]"
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</section>

			{/* Galería */}
			<section className="py-12 sm:py-16">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{imagenesFiltradas.map((imagen) => (
							<Card
								key={imagen.id}
								className="group overflow-hidden border-[#A9A9A9]/20 bg-white transition-all hover:shadow-lg"
							>
								<div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-[#A6402C]/10 to-[#803549]/10 text-6xl transition-transform group-hover:scale-105 sm:text-7xl">
									{imagen.emoji}
									<div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
									<div className="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform group-hover:translate-y-0">
										<h3 className="text-sm font-semibold text-white sm:text-base">{imagen.titulo}</h3>
										<p className="text-xs text-[#F0EBE3]">{imagen.categoria}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="bg-gradient-to-r from-[#A6402C] via-[#803549] to-[#A6402C] py-12 text-white sm:py-16">
				<div className="container mx-auto px-4 text-center lg:px-6">
					<h2 className="mb-4 text-2xl font-bold sm:text-3xl">Crea Tus Propios Recuerdos</h2>
					<p className="mb-6 text-sm text-[#F0EBE3] sm:text-base">
						Únete a nuestros próximos viajes y vive experiencias increíbles
					</p>
					<a
						href="/tours"
						className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-[#A6402C] transition-all hover:bg-[#F0EBE3]"
					>
						<Icon icon="solar:ticket-bold" size={20} />
						Ver Tours
					</a>
				</div>
			</section>
		</div>
	);
}
