// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useNavigate } from "react-router";
import { useUserInfo, useUserToken } from "@/store/userStore";

export function WelcomeUser() {
	const user = useUserInfo();
	const { accessToken } = useUserToken();
	const navigate = useNavigate();

	// 🔍 DEBUG: Ver roles en consola
	console.log("WelcomeUser - User info:", user);
	console.log("WelcomeUser - User roles:", user?.roles);
	console.log("WelcomeUser - Token:", accessToken);

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

	console.log("🔍 User roles mapped:", userRoles);
	console.log("🔍 Has 'User' role:", hasUserRole);

	// Intentar obtener el nombre completo del token decodificado
	let nombreCompleto = "";
	if (accessToken) {
		try {
			const payload = JSON.parse(atob(accessToken.split(".")[1]));
			nombreCompleto = payload.name || "";
		} catch {
			nombreCompleto = "";
		}
	}

	const nombre = nombreCompleto || user?.username || user?.email || "Usuario";

	// Si no tiene el rol User, mostrar acceso denegado
	if (!hasUserRole) {
		return (
			<div className="flex flex-col items-center justify-center h-screen gap-6">
				<h2 className="text-3xl font-bold mb-2 text-red-600">Acceso denegado</h2>
				<p className="text-lg text-muted-foreground mb-4 text-center">No tienes permisos para acceder a esta página.</p>
				<button
					type="button"
					className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
					onClick={() => navigate("/dashboard")}
				>
					Volver al inicio
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen gap-6">
			<h2 className="text-3xl font-bold mb-2">¡Bienvenido, {nombre}!</h2>
			<p className="text-lg text-muted-foreground mb-4 text-center">
				Gracias por usar <span className="font-semibold">BusTix</span>.<br />
				Aquí podrás gestionar tus boletos y participar en eventos exclusivos.
			</p>
			<div className="flex gap-4">
				<button
					type="button"
					className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
					onClick={() => navigate("/profile/tickets")}
				>
					Ver mis boletos
				</button>
				<button
					type="button"
					className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
					onClick={() => navigate("/dashboard/events/buy-events")}
				>
					Ver eventos
				</button>
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
