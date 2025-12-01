import axios from "axios";

/**
 * Obtiene la ciudad a partir de latitud y longitud usando Geoapify
 */
export async function apiReverseGeocode(lat: number, lon: number): Promise<string> {
	try {
		const baseUrl = import.meta.env.VITE_PUBLIC_GEOAPIFY_BASE_URL;
		const apiKey = import.meta.env.VITE_PUBLIC_GEOAPIFY_API_KEY;
		const axiosInstance = axios.create();
		const response = await axiosInstance.get(`${baseUrl}/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`);
		const data = response.data;
		if (data.features && data.features.length > 0) {
			return data.features[0].properties.county || "Ciudad desconocida";
		}
		return "Ciudad desconocida";
	} catch (error: any) {
		return "Ciudad desconocida";
	}
}

/**
 * Obtiene la dirección exacta formateada y el estado a partir de latitud y longitud usando Geoapify
 */
export async function apiGetExactAddress(lat: number, lon: number): Promise<{ address: string; state: string }> {
	try {
		const baseUrl = import.meta.env.VITE_PUBLIC_GEOAPIFY_BASE_URL;
		const apiKey = import.meta.env.VITE_PUBLIC_GEOAPIFY_API_KEY;
		const axiosInstance = axios.create();
		const response = await axiosInstance.get(`${baseUrl}/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`);
		const data = response.data;
		if (typeof window !== "undefined") {
			console.log("Geoapify response", data);
		}
		if (data.features && data.features.length > 0) {
			const props = data.features[0].properties;
			// Prioridad: formatted > street+number > suburb > city > state > country
			let address = "";
			if (props.formatted && !props.formatted.toLowerCase().includes("unnamed")) {
				address = props.formatted;
			} else {
				// Construir dirección lo más completa posible
				address = [props.street, props.housenumber, props.suburb, props.city, props.state, props.country]
					.filter(Boolean)
					.join(", ");
			}
			// Si sigue vacía, usar suburb o city o state o country
			if (!address || address.trim() === "") {
				address = props.suburb || props.city || props.state || props.country || "";
			}
			// Si sigue vacía, intenta con county o postcode
			if (!address || address.trim() === "") {
				address = props.county || props.postcode || "";
			}
			// Si sigue vacía, fallback final
			if (!address || address.trim() === "") {
				address = "Ubicación no disponible";
			}
			const state = props.state || props.county || "Estado desconocido";
			return { address, state };
		}
		return { address: "Ubicación no disponible", state: "Estado desconocido" };
	} catch (error: any) {
		if (typeof window !== "undefined") {
			console.error("Geoapify error", error);
		}
		return { address: "Ubicación no disponible", state: "Estado desconocido" };
	}
}
