export interface ApiProblem {
    status: number;
    title: string;
    detail: string;
    errors?: Array<{ field?: string; message: string }>;
}

export class ApiClientError extends Error {
    status: number;
    title: string;
    detail: string;
    errors: Array<{ field?: string; message: string }>;

    constructor(problem: ApiProblem) {
        super(problem.detail || 'API request failed');
        this.name = 'ApiClientError';
        this.status = problem.status;
        this.title = problem.title;
        this.detail = problem.detail;
        this.errors = problem.errors || [];
    }
}

const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
};

async function parseResponse<T>(response: Response): Promise<T> {
    let payload: any = null;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        try {
            payload = await response.json();
        } catch {
            payload = null;
        }
    }

    if (response.ok) {
        return payload as T;
    }

    const errorBody = payload && payload.error ? payload.error : payload;
    throw new ApiClientError({
        status: response.status,
        title: errorBody?.title || errorBody?.code || response.statusText || 'ERROR',
        detail: errorBody?.detail || errorBody?.message || response.statusText || 'Server error',
        errors: Array.isArray(errorBody?.errors)
            ? errorBody.errors
            : Array.isArray(errorBody?.details)
            ? errorBody.details
            : []
    });
}

function getAuthHeaders(): Record<string, string> {
    // If the client has stored a JWT token (sessionStorage.authToken),
    // include it as `Authorization: Bearer <token>` on every request.
    // This keeps auth handling centralised in the client helper.
    const token = sessionStorage.getItem('authToken');
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
}

async function request<T>(url: string | URL, options: RequestInit = {}, timeoutMs = 12000): Promise<T> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: { ...defaultHeaders, ...getAuthHeaders(), ...(options.headers || {}) },
            signal: controller.signal
        });
        return await parseResponse<T>(response);
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new ApiClientError({
                status: 0,
                title: 'REQUEST_ABORTED',
                detail: 'Запит не виконано через таймаут або скасування',
                errors: []
            });
        }

        const message = error instanceof Error ? error.message : 'Network error';
        throw new ApiClientError({
            status: 0,
            title: 'NETWORK_ERROR',
            detail: message,
            errors: []
        });
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export async function getList<T>(url: string | URL): Promise<T> {
    return request<T>(url, { method: 'GET' });
}

export async function getById<T>(url: string, id: string): Promise<T> {
    return request<T>(`${url}/${id}`, { method: 'GET' });
}

export async function create<T>(url: string, data: unknown): Promise<T> {
    return request<T>(url, { method: 'POST', body: JSON.stringify(data) });
}

export async function update<T>(url: string, id: string, data: unknown): Promise<T> {
    return request<T>(`${url}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function remove<T>(url: string, id: string): Promise<T> {
    return request<T>(`${url}/${id}`, { method: 'DELETE' });
}
