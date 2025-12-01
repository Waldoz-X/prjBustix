import { Loader } from "lucide-react";

interface LoadingScreenProps {
	message?: string;
}

export const LoadingScreen = ({ message = "Procesando pago..." }: LoadingScreenProps) => {
	return (
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
			<div className="bg-white rounded-lg p-12 text-center shadow-2xl animate-in fade-in duration-300 max-w-sm">
				<div className="flex justify-center mb-6">
					<Loader className="w-16 h-16 text-blue-600 animate-spin" />
				</div>
				<p className="text-lg font-semibold text-gray-900 mb-2">{message}</p>
				<p className="text-sm text-gray-500">Por favor espera mientras procesamos tu compra</p>
			</div>
		</div>
	);
};
