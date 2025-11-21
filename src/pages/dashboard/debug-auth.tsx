import { useUserInfo, useUserToken } from "@/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { getUserInfoFromToken } from "@/utils/jwt";

export default function DebugAuth() {
	const userInfo = useUserInfo();
	const { accessToken } = useUserToken();
	const tokenInfo = accessToken ? getUserInfoFromToken(accessToken) : null;

	return (
		<div className="container mx-auto p-8 space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Debug: User Store Info</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="text-xs overflow-auto">{JSON.stringify(userInfo, null, 2)}</pre>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Debug: Token Info (JWT decoded)</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="text-xs overflow-auto">{JSON.stringify(tokenInfo, null, 2)}</pre>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Debug: Raw Token (first 100 chars)</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="text-xs overflow-auto break-all">
						{accessToken ? `${accessToken.substring(0, 100)}...` : "No token"}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
