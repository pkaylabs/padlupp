const API_BASE_URL = "https://api.padlupp.com/api-v1/";

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

export { API_BASE_URL };
