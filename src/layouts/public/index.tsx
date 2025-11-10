// -----------------------------------------------------------------------------
// public/index.tsx
// Layout principal para la landing page pública
// -----------------------------------------------------------------------------
import { Outlet } from "react-router";
import PublicHeader from "./header";
import PublicFooter from "./footer";

export default function PublicLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<PublicHeader />
			<main className="flex-1">
				<Outlet />
			</main>
			<PublicFooter />
		</div>
	);
}
