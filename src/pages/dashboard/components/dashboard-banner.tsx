import type { CSSProperties } from "react";
import { useNavigate } from "react-router";
import bgImg from "@/assets/images/background/banner-1.png";
import Character from "@/assets/images/characters/character_3.png";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { Button } from "@/ui/button";
import { Text, Title } from "@/ui/typography";

export default function DashboardBanner() {
	const navigate = useNavigate();

	const bgStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundImage: `url("${bgImg}")`,
		backgroundSize: "100%",
		backgroundPosition: "50%",
		backgroundRepeat: "no-repeat",
		opacity: 0.5,
	};

	return (
		<div className="relative bg-primary/90 rounded-xl overflow-hidden">
			<div className="p-6 z-2 relative">
				<div className="grid grid-cols-2 gap-4">
					<div className="col-span-2 md:col-span-1">
						<div className="flex flex-col gap-4">
							<Title as="h2" className="text-white">
								Bienvenido a {GLOBAL_CONFIG.appName}
							</Title>
							<Text className="text-white">
								Gestiona tu flota, viajes y eventos de manera eficiente. Accede a todas las herramientas que necesitas
								desde este panel de control.
							</Text>

							<Button
								variant="outline"
								className="w-fit bg-white text-black hover:bg-gray-100 border-none"
								onClick={() => navigate("/trips")}
							>
								<Icon icon="mdi:bus" size={24} />
								<span className="ml-2 font-bold">Ir a Viajes</span>
							</Button>
						</div>
					</div>

					<div className="col-span-2 md:col-span-1">
						<div className="w-full h-full flex items-center justify-end">
							<img src={Character} className="w-56 h-56 object-contain" alt="character" />
						</div>
					</div>
				</div>
			</div>
			<div style={bgStyle} className="z-1" />
		</div>
	);
}
