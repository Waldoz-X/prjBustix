import { useQuery } from "@tanstack/react-query";
import { Calendar, Heart, Ticket, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import boletosService from "@/api/services/boletosService";
import eventosService, { type EventoDto } from "@/api/services/eventosService";
import { useUserInfo, useUserToken } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Text, Title } from "@/ui/typography";
import { getUserInfoFromToken } from "@/utils/jwt";

export default function UserDashboard() {
	const user = useUserInfo();
	const { accessToken } = useUserToken();
	const navigate = useNavigate();

	// Verificar si el usuario tiene el rol "User"
	const userRoles = user?.roles?.map((r) => (typeof r === "string" ? r : r?.code || r?.name || r?.id || "")) || [];
	const hasUserRole = userRoles.some((role) => role.toLowerCase() === "user");

	// Obtener nombre completo del token
	let nombreCompleto = "";
	let email = "";
	if (accessToken) {
		const tokenInfo = getUserInfoFromToken(accessToken);
		nombreCompleto = tokenInfo?.name || "";
		email = tokenInfo?.email || "";
	}

	const nombre = nombreCompleto || user?.email || "Usuario";

	// Fetch: Mis boletos pagados
	const { data: misBoletos = [], isLoading: isLoadingBoletos } = useQuery({
		queryKey: ["my-tickets"],
		queryFn: boletosService.getMisBoletos,
		enabled: hasUserRole,
	});

	// Fetch: Próximos eventos
	const { data: proximosEventos = [], isLoading: isLoadingEventos } = useQuery<EventoDto[]>({
		queryKey: ["upcoming-events"],
		queryFn: () => eventosService.getAllEventos(),
		enabled: hasUserRole,
	});

	// Si no tiene el rol User, mostrar acceso denegado
	if (!hasUserRole) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<Card className="w-full max-w-md">
					<CardContent className="flex flex-col items-center text-center pt-8 pb-8">
						<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
							<Heart className="w-8 h-8 text-red-600" />
						</div>
						<Title as="h2" className="text-2xl font-bold text-red-600 mb-2">
							Acceso denegado
						</Title>
						<Text variant="body2" className="text-muted-foreground mb-6">
							No tienes permisos para acceder a esta página.
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
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-8 mb-8">
				<div>
					<Title as="h1" className="text-3xl font-bold mb-2">
						¡Bienvenido, <span className="text-primary">{nombre}</span>!
					</Title>
					<Text variant="body1" className="text-muted-foreground">
						{email}
					</Text>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Mis boletos */}
				<Card className="hover:shadow-lg transition-all">
					<CardContent className="flex flex-col items-center justify-center p-6">
						<div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
							<Ticket className="w-6 h-6 text-blue-600" />
						</div>
						<Title as="h3" className="text-2xl font-bold">
							{misBoletos.length}
						</Title>
						<Text variant="body2" className="text-muted-foreground text-center">
							Boletos Comprados
						</Text>
					</CardContent>
				</Card>

				{/* Próximos viajes */}
				<Card className="hover:shadow-lg transition-all">
					<CardContent className="flex flex-col items-center justify-center p-6">
						<div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
							<Calendar className="w-6 h-6 text-green-600" />
						</div>
						<Title as="h3" className="text-2xl font-bold">
							{proximosEventos.length}
						</Title>
						<Text variant="body2" className="text-muted-foreground text-center">
							Eventos Disponibles
						</Text>
					</CardContent>
				</Card>

				{/* Favoritos */}
				<Card className="hover:shadow-lg transition-all">
					<CardContent className="flex flex-col items-center justify-center p-6">
						<div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-3">
							<Heart className="w-6 h-6 text-red-600" />
						</div>
						<Title as="h3" className="text-2xl font-bold">
							0
						</Title>
						<Text variant="body2" className="text-muted-foreground text-center">
							Favoritos
						</Text>
					</CardContent>
				</Card>
			</div>

			{/* Main Actions Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Mis Boletos */}
				<Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2">
							<Ticket className="w-5 h-5" />
							Mis Boletos
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Text variant="body2" className="text-muted-foreground">
							{isLoadingBoletos
								? "Cargando boletos..."
								: `Tienes ${misBoletos.length} boleto${misBoletos.length !== 1 ? "s" : ""} comprado${misBoletos.length !== 1 ? "s" : ""}.`}
						</Text>
						<Button onClick={() => navigate("/profile/tickets")} variant="default" className="w-full">
							Ver Mis Boletos
						</Button>
					</CardContent>
				</Card>

				{/* Explorar Eventos */}
				<Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2">
							<Calendar className="w-5 h-5" />
							Explorar Eventos
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Text variant="body2" className="text-muted-foreground">
							{isLoadingEventos
								? "Cargando eventos..."
								: `Hay ${proximosEventos.length} evento${proximosEventos.length !== 1 ? "s" : ""} disponible${proximosEventos.length !== 1 ? "s" : ""}.`}
						</Text>
						<Button onClick={() => navigate("/events")} variant="default" className="w-full">
							Ver Eventos
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5" />
						Actividad Reciente
					</CardTitle>
				</CardHeader>
				<CardContent>
					{misBoletos.length === 0 ? (
						<div className="text-center py-8">
							<Text variant="body2" className="text-muted-foreground mb-4">
								No tienes boletos aún. ¡Comienza a explorar eventos!
							</Text>
							<Button onClick={() => navigate("/events")} variant="outline">
								Comprar Boleto
							</Button>
						</div>
					) : (
						<div className="space-y-3">
							{misBoletos.slice(0, 3).map((boleto, index) => (
								<div
									key={`${boleto.boletoID}-${index}`}
									className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
								>
									<div className="flex-1">
										<Text variant="body2" className="font-semibold">
											Viaje #{boleto.viajeID}
										</Text>
										<Text variant="body2" className="text-xs text-muted-foreground">
											Parada: {boleto.paradaAbordaje}
										</Text>
									</div>
									<Text variant="body2" className="text-sm font-medium text-primary">
										{new Date(boleto.fechaCompra).toLocaleDateString("es-MX")}
									</Text>
								</div>
							))}
							{misBoletos.length > 3 && (
								<Button onClick={() => navigate("/profile/tickets")} variant="outline" className="w-full mt-3">
									Ver todos ({misBoletos.length})
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
