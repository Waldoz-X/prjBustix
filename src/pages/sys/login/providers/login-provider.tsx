import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

export enum LoginStateEnum {
	LOGIN = 0,
	REGISTER = 1,
	RESET_PASSWORD = 2,
	MOBILE = 3,
	QR_CODE = 4,
}

interface LoginStateContextType {
	loginState: LoginStateEnum;
	setLoginState: (loginState: LoginStateEnum) => void;
	backToLogin: () => void;
}
const LoginStateContext = createContext<LoginStateContextType>({
	loginState: LoginStateEnum.LOGIN,
	setLoginState: () => {},
	backToLogin: () => {},
});

export function useLoginStateContext() {
	return useContext(LoginStateContext);
}

interface LoginProviderProps extends PropsWithChildren {
	initialLoginState?: LoginStateEnum;
}

export function LoginProvider({ children, initialLoginState = LoginStateEnum.LOGIN }: LoginProviderProps) {
	const [loginState, setLoginState] = useState(initialLoginState);

	function backToLogin() {
		setLoginState(LoginStateEnum.LOGIN);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: loginState is intentionally excluded to prevent infinite loops
	const value: LoginStateContextType = useMemo(() => ({ loginState, setLoginState, backToLogin }), [loginState]);

	return <LoginStateContext.Provider value={value}>{children}</LoginStateContext.Provider>;
}
