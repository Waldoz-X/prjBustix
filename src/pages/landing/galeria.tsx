// -----------------------------------------------------------------------------
// landing/galeria.tsx
// Página de galería - BusTix - Paleta elegante
// -----------------------------------------------------------------------------

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";

export default function Galeria() {
	const [categoriaActiva, setCategoriaActiva] = useState("Todos");
	const [imagenSeleccionada, setImagenSeleccionada] = useState<number | null>(null);

	const categorias = ["Todos", "Eventos", "Unidades", "Experiencias"];

	const imagenes = [
		{
			id: 1,
			titulo: "Corona Capital 2024",
			categoria: "Eventos",
			url: "https://www.proceso.com.mx/u/fotografias/m/2025/2/21/f1280x720-217461_349136_5050.jpg",
		},
		{
			id: 2,
			titulo: "Twenty One Pilots",
			categoria: "Eventos",
			url: "https://images.squarespace-cdn.com/content/v1/5fdc546c242e893f6740387d/da846a9e-62cf-44d5-ba95-cc6c3abaa7c4/20240920-1Twenty-One-Pilots-Clancy-Tour-TD-Garden-Sony-006.jpg",
		},
		{
			id: 3,
			titulo: "Kanye West",
			categoria: "Eventos",
			url: "https://www.yaconic.com/wp-content/uploads/2025/11/kanye-west--768x512.webp",
		},
		{
			id: 4,
			titulo: "Radiohead",
			categoria: "Eventos",
			url: "https://www.sopitas.com/wp-content/uploads/2023/01/radiohead-planes-2023.jpeg",
		},
		{
			id: 5,
			titulo: "Foo Fighters",
			categoria: "Eventos",
			url: "https://muzikalia.com/wp-content/uploads/2022/03/FOOFIGHTERS-MEX-OCESA2-800x445.jpg",
		},
		{
			id: 6,
			titulo: "Experiencia en Vivo",
			categoria: "Experiencias",
			url: "https://bucket-tnq5c9.s3.amazonaws.com/wp-content/uploads/2022/03/17214956/destacada1..jpg",
		},
		{
			id: 7,
			titulo: "Concierto Masivo",
			categoria: "Eventos",
			url: "https://adrnetworks.mx/wp-content/uploads/2024/11/image-243-1024x682.png",
		},
		{
			id: 8,
			titulo: "Energía en el Escenario",
			categoria: "Experiencias",
			url: "https://i.ytimg.com/vi/wgh4-IHUusM/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBbnRCxTfPg5p1hQCBh5Qw2EH8FWw",
		},
		{
			id: 9,
			titulo: "Momentos Inolvidables",
			categoria: "Experiencias",
			url: "https://endorfinacultural.com/wp-content/uploads/2023/09/374566528_10231704128524532_1356370215540982475_n.jpg",
		},
		{
			id: 10,
			titulo: "Idolos MX",
			categoria: "Eventos",
			url: "https://idolosmx.com/wp-content/uploads/2023/09/374651669_10231704125604459_6133434575764531402_n-1024x683.jpg",
		},
		{
			id: 11,
			titulo: "Babymetal",
			categoria: "Eventos",
			url: "https://www.sopitas.com/wp-content/uploads/2025/11/babymetalmexico01.jpg",
		},
		{
			id: 12,
			titulo: "Babymetal Live",
			categoria: "Eventos",
			url: "https://www.sopitas.com/wp-content/uploads/2025/11/babymetalmexico09.jpg",
		},
		{
			id: 13,
			titulo: "Imagine Dragons",
			categoria: "Eventos",
			url: "https://assets.ejecentral.com.mx/dims4/default/00a674f/2147483647/strip/true/crop/1280x672+0+24/resize/1200x630!/quality/90/?url=https%3A%2F%2Fk3-prod-ejecentral.s3.us-west-2.amazonaws.com%2Fbrightspot%2Fdd%2F52%2Fa622349dc67e0182894f0ed959cc%2Fpreventa-de-imagine-dragons-en-cdmx.jpg",
		},
		{
			id: 14,
			titulo: "Gran Ambiente",
			categoria: "Experiencias",
			url: "https://i0.wp.com/imgsonica.s3.amazonaws.com/u/fotografias/m/2023/5/17/f768x1-39907_40034_5050.jpg?w=780&ssl=1",
		},
		{
			id: 15,
			titulo: "Nuestras Unidades",
			categoria: "Unidades",
			url: "https://i.pinimg.com/736x/7d/06/cb/7d06cb09883db732a70031b7a93b40ea.jpg",
		},
		{
			id: 16,
			titulo: "Concierto en Vivo",
			categoria: "Eventos",
			url: "https://photos.bandsintown.com/large/14512123.jpeg",
		},
		{
			id: 17,
			titulo: "Festival de Música",
			categoria: "Eventos",
			url: "https://elnacionalperiodico.mx/wp-content/uploads/2025/07/KK-11.jpg",
		},
		{
			id: 18,
			titulo: "Espectáculo",
			categoria: "Eventos",
			url: "https://tvazteca.brightspotcdn.com/dims4/default/09337bf/2147483647/strip/true/crop/1920x1080+0+0/resize/928x522!/format/webp/quality/90/?url=http%3A%2F%2Ftv-azteca-brightspot.s3.amazonaws.com%2Fcc%2F25%2F906ff9074d139ba896ac7f4e27f8%2Fproyecto-nuevo-2025-02-04t150430-066.jpg",
		},
		{
			id: 19,
			titulo: "Noche Mágica",
			categoria: "Experiencias",
			url: "https://enfoquemonterrey.com.mx/wp-content/uploads/2025/05/502620cca9b63e8848f002b361b55d71-1.jpg",
		},
		{
			id: 20,
			titulo: "Gran Escenario",
			categoria: "Eventos",
			url: "https://res.cloudinary.com/hello-tickets/image/upload/ar_9:5,c_limit,f_auto,q_auto,w_1300/v1750145908/njebi5mpsimboqapz6gg.jpg",
		},
		{
			id: 21,
			titulo: "Deftones",
			categoria: "Eventos",
			url: "https://preview.redd.it/early-2000s-deftones-concert-photos-venue-identification-v0-w62ok1m908hf1.jpg?width=640&crop=smart&auto=webp&s=2fcd1c38b23a0ea800f2c7d1524537fbde4b3b2b",
		},
		{
			id: 22,
			titulo: "Dua Lipa",
			categoria: "Eventos",
			url: "https://offloadmedia.feverup.com/cdmxsecreta.com/wp-content/uploads/2021/12/11034336/dua-lipa-1024x683.jpg",
		},
		{
			id: 23,
			titulo: "Luces y Sonido",
			categoria: "Experiencias",
			url: "https://concentrika.ucentral.edu.co/wp-content/uploads/2022/11/vckugc.jpg",
		},
		{
			id: 24,
			titulo: "Multitud Eufórica",
			categoria: "Experiencias",
			url: "https://tvazteca.brightspotcdn.com/dims4/default/733d48b/2147483647/strip/true/crop/1280x720+0+0/resize/928x522!/format/webp/quality/70/?url=http%3A%2F%2Ftv-azteca-brightspot.s3.amazonaws.com%2F2c%2Ff6%2Fca114d55458c8b02b05a7ec16b6b%2Fportada-2025-12-02t082603-523.jpg",
		},
		{
			id: 25,
			titulo: "Rock en Vivo",
			categoria: "Eventos",
			url: "https://cloudfront-eu-central-1.images.arcpublishing.com/prisaradio/P4XJANOJBZOM5J5VK37K4FL2FM.jpg",
		},
		{
			id: 26,
			titulo: "Clásicos del Rock",
			categoria: "Eventos",
			url: "https://static.emol.cl/emol50/Fotos/2018/10/03/file_20181003014841.jpg",
		},
		{
			id: 27,
			titulo: "30 Seconds to Mars",
			categoria: "Eventos",
			url: "https://storage.googleapis.com/stateless-elclubdelrock-com/2014/07/30-seconds-to-mars.jpg",
		},
		{
			id: 28,
			titulo: "Estadio Lleno",
			categoria: "Experiencias",
			url: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/EAIAZGKCXVG4VBUI2JZYRVNAFY.jpg",
		},
		{
			id: 29,
			titulo: "Linkin Park",
			categoria: "Eventos",
			url: "https://blogcostasalvaje.files.wordpress.com/2015/07/linkinpark3.jpg",
		},
		{
			id: 30,
			titulo: "Linkin Park Live",
			categoria: "Eventos",
			url: "https://offloadmedia.feverup.com/guadalajarasecreta.com/wp-content/uploads/2024/11/14100524/Linkin-Park.jpg",
		},
		{
			id: 31,
			titulo: "Atmósfera Única",
			categoria: "Experiencias",
			url: "https://images.squarespace-cdn.com/content/v1/57ae4d335016e1690c435b51/1746027381514-4R306ENEPB57GVJ7JKXD/IMG_3817-Enhanced-NR.jpg?format=500w",
		},
		{
			id: 32,
			titulo: "Recuerdos",
			categoria: "Experiencias",
			url: "https://images.squarespace-cdn.com/content/v1/6091d047f84a401eacaf886f/1711519000841-GK6DYGY7F2FQBSYCO6D0/IMG_7389.jpeg",
		},
	];

	const imagenesFiltradas =
		categoriaActiva === "Todos" ? imagenes : imagenes.filter((img) => img.categoria === categoriaActiva);

	const imagenActual = imagenes.find((img) => img.id === imagenSeleccionada);

	return (
		<div className="min-h-screen bg-[#F0EBE3]">
			{/* Hero */}
			<section className="bg-gradient-to-r from-[#1A1A1A] via-[#4A4A4A] to-[#1A1A1A] py-16 text-white sm:py-20">
				<div className="container mx-auto px-4 text-center lg:px-6">
					<m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
						<Icon icon="solar:gallery-bold-duotone" className="mx-auto mb-4 text-[#A6402C]" size={56} />
						<h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">Galería</h1>
						<p className="mx-auto max-w-2xl text-base text-[#A9A9A9] sm:text-lg">
							Momentos inolvidables capturados en nuestros viajes
						</p>
					</m.div>
				</div>
			</section>

			{/* Filtros */}
			<section className="sticky top-0 z-10 border-b border-[#A9A9A9]/20 bg-white/80 backdrop-blur-md py-6">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="flex flex-wrap justify-center gap-2">
						{categorias.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setCategoriaActiva(cat)}
								className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
									categoriaActiva === cat
										? "bg-[#A6402C] text-white shadow-lg scale-105"
										: "bg-[#F0EBE3] text-[#4A4A4A] hover:bg-[#E0DBCF] hover:scale-105"
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
					<m.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						<AnimatePresence mode="popLayout">
							{imagenesFiltradas.map((imagen) => (
								<m.div
									layout
									key={imagen.id}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.3 }}
									onClick={() => setImagenSeleccionada(imagen.id)}
									className="cursor-pointer"
								>
									<Card className="group relative overflow-hidden rounded-xl border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
										<div className="aspect-[4/3] overflow-hidden bg-gray-100">
											<img
												src={imagen.url}
												alt={imagen.titulo}
												className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
												loading="lazy"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
											<div className="absolute bottom-0 left-0 right-0 translate-y-full p-6 transition-transform duration-300 group-hover:translate-y-0">
												<h3 className="text-lg font-bold text-white">{imagen.titulo}</h3>
												<p className="text-sm text-[#F0EBE3]">{imagen.categoria}</p>
											</div>
										</div>
									</Card>
								</m.div>
							))}
						</AnimatePresence>
					</m.div>
				</div>
			</section>

			{/* Lightbox */}
			<AnimatePresence>
				{imagenSeleccionada && imagenActual && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
						onClick={() => setImagenSeleccionada(null)}
					>
						<m.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-lg bg-transparent shadow-2xl"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								type="button"
								onClick={() => setImagenSeleccionada(null)}
								className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
							>
								<Icon icon="solar:close-circle-bold" size={32} />
							</button>
							<img
								src={imagenActual.url}
								alt={imagenActual.titulo}
								className="max-h-[85vh] w-full object-contain rounded-lg"
							/>
							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
								<h2 className="text-2xl font-bold">{imagenActual.titulo}</h2>
								<p className="text-gray-300">{imagenActual.categoria}</p>
							</div>
						</m.div>
					</m.div>
				)}
			</AnimatePresence>

			{/* CTA */}
			<section className="bg-gradient-to-r from-[#A6402C] via-[#803549] to-[#A6402C] py-12 text-white sm:py-16">
				<div className="container mx-auto px-4 text-center lg:px-6">
					<m.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="mb-4 text-2xl font-bold sm:text-3xl">Crea Tus Propios Recuerdos</h2>
						<p className="mb-6 text-sm text-[#F0EBE3] sm:text-base">
							Únete a nuestros próximos viajes y vive experiencias increíbles
						</p>
						<a
							href="/events"
							className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A6402C] to-[#803549] px-8 py-3 font-bold !text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#A6402C]/50 hover:brightness-110"
						>
							<Icon icon="solar:ticket-bold" size={20} className="!text-white" />
							Ver Eventos
						</a>
					</m.div>
				</div>
			</section>
		</div>
	);
}
