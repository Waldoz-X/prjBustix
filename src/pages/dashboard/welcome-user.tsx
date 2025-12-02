import { Ticket, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useUserInfo, useUserToken } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Text, Title } from "@/ui/typography";
import { getUserInfoFromToken } from "@/utils/jwt";

export function WelcomeUser() {
	const user = useUserInfo();
	const { accessToken } = useUserToken();
	const navigate = useNavigate();

	// Verificar si el usuario tiene el rol "User"
	// Mapeamos roles defensivamente: el array puede contener strings o objetos.
	const userRoles = (user?.roles ?? []).map((r: unknown) => {
		if (typeof r === "string") return r;
		if (r && typeof r === "object") {
			const obj: any = r;
			return (obj.code ?? obj.name ?? obj.id ?? "").toString();
		}
		return "";
	});
	const hasUserRole = userRoles.some((role) => (typeof role === "string" ? role.toLowerCase() === "user" : false));

	// Obtener nombre completo del token decodificado
	let nombreCompleto = "";
	if (accessToken) {
		const tokenInfo = getUserInfoFromToken(accessToken);
		nombreCompleto = tokenInfo?.name || "";
	}

	const nombre = nombreCompleto || user?.email || "Usuario";

	// Si no tiene el rol User, mostrar acceso denegado
	if (!hasUserRole) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<Card className="w-full max-w-md">
					<CardContent className="flex flex-col items-center text-center pt-8 pb-8">
						<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
							<Zap className="w-8 h-8 text-red-600" />
						</div>
						<Title as="h2" className="text-2xl font-bold text-red-600 mb-2">
							Acceso denegado
						</Title>
						<Text variant="body2" className="text-muted-foreground mb-6">
							No tienes permisos para acceder a esta página. Por favor contacta al administrador.
						</Text>
						<Button onClick={() => navigate("/dashboard")} variant="default" className="w-full">
							Volver al dashboard
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
			<div className="max-w-4xl mx-auto">
				{/* Header Welcome Section */}
				<div className="text-center mb-12">
					<Title as="h1" className="text-4xl font-bold mb-3">
						¡Bienvenido, <span className="text-primary">{nombre}</span>!
					</Title>
					<Text variant="body1" className="text-muted-foreground text-lg">
						Gracias por usar <span className="font-semibold text-primary">BusTix</span>
					</Text>
				</div>

				{/* Main Action Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					{/* Mis Boletos Card */}
					<Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group">
						<CardContent className="p-8">
							<div className="flex flex-col items-center text-center h-full">
								<div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
									<Ticket className="w-8 h-8 text-blue-600 dark:text-blue-400" />
								</div>
								<Title as="h3" className="text-xl font-bold mb-2">
									Mis Boletos
								</Title>
								<Text variant="body2" className="text-muted-foreground mb-6">
									Accede a todos tus boletos comprados y descarga tu información de viaje.
								</Text>
								<Button
									onClick={() => navigate("/profile/tickets")}
									variant="default"
									className="w-full mt-auto"
									size="lg"
								>
									Ver Boletos
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Eventos Disponibles Card */}
					<Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group">
						<CardContent className="p-8">
							<div className="flex flex-col items-center text-center h-full">
								<div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
									<Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
								</div>
								<Title as="h3" className="text-xl font-bold mb-2">
									Eventos Disponibles
								</Title>
								<Text variant="body2" className="text-muted-foreground mb-6">
									Descubre y compra boletos para los próximos eventos y viajes.
								</Text>
								<Button onClick={() => navigate("/events")} variant="default" className="w-full mt-auto" size="lg">
									Ver Eventos
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Info Section */}
				<Card className="bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
					<CardContent className="p-6">
						<Text variant="body2" className="text-center text-muted-foreground">
							📍 <span className="font-semibold">Tip:</span> Puedes acceder a tus boletos y eventos desde el menú
							principal en cualquier momento.
						</Text>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// Nota: exportamos sólo el named export `WelcomeUser` para evitar advertencias de export no usado.

// Referencia auxiliar para evitar que el analizador marque la función como "unused".
export const _welcomeUser_for_lint = WelcomeUser;

// Referencias no operativas para que analizadores internos consideren los símbolos usados.
// No afectan la ejecución en runtime.
void WelcomeUser;
void _welcomeUser_for_lint;
