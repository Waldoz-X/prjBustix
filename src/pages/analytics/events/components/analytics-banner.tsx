import type { CSSProperties } from "react";
import bgImg from "@/assets/images/background/banner-1.png";

import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Text, Title } from "@/ui/typography";

export default function AnalyticsBanner() {
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
							<Title as="h2" className="text-white text-2xl md:text-3xl font-bold">
								Event Analytics Dashboard
							</Title>
							<Text className="text-white/90 text-sm md:text-base">
								Deep dive into your event performance. Track sales, occupancy, and revenue trends to optimize your
								strategy.
							</Text>

							<div className="flex gap-3 mt-2">
								<Button variant="secondary" className="w-fit" onClick={() => window.print()}>
									<Icon icon="solar:printer-outline" size={20} />
									<span className="ml-2 font-semibold">Export Report</span>
								</Button>
							</div>
						</div>
					</div>

					<div className="col-span-2 md:col-span-1 hidden md:block">
						<div className="w-full h-full flex items-center justify-end">
							{/* Placeholder for character or illustration */}
							<div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
								<Icon icon="solar:chart-square-bold-duotone" size={120} className="text-white" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div style={bgStyle} className="z-1" />
		</div>
	);
}
