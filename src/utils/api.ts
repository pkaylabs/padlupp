// Helper to get token from localStorage
function getAuthToken(): string | null {
	return localStorage.getItem("auth_token");
}

// Helper to add Authorization header if token exists
export function authHeaders(headers: Record<string, string> = {}): Record<string, string> {
	const token = getAuthToken();
	return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}
// const API_BASE_URL = "https://api.padlupp.com/api-v1/";
const API_BASE_URL = "http://10.107.168.119:8000/api-v1/";

export interface LoginRequest {
	email: string;
	password: string;
}

export interface User {
	id: number;
	email: string;
	phone: string;
	name: string;
	avatar: string;
	phone_verified: boolean;
	email_verified: boolean;
}

export interface LoginResponse {
	user: User;
	token: string;
}

export interface ApiError {
	detail: string;
}

// Register endpoint types
export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
}

export type RegisterResponse = LoginResponse;

/**
 * Login user with email and password
 * @param credentials LoginRequest
 * @returns Promise<LoginResponse>
 * @throws ApiError
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
	const response = await fetch(`${API_BASE_URL}auth/login/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(credentials),
	});

	if (response.ok) {
		return response.json();
	} else {
		const error: ApiError = await response.json();
		throw error;
	}
}

/**
 * Register a new user
 * @param payload RegisterRequest
 * @returns Promise<RegisterResponse>
 * @throws ApiError
 */
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
	const response = await fetch(`${API_BASE_URL}onboarding/register/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (response.ok) {
		return response.json();
	} else {
		const error: ApiError = await response.json();
		throw error;
	}
}

export { API_BASE_URL };
