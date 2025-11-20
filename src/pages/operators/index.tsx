import { Navigate } from "react-router";

export default function OperatorsIndexPage() {
	// Redirigir automáticamente a la lista de operadores
	return <Navigate to="/operators/list" replace />;
}
