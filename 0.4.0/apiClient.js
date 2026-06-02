const defaultHeaders = {
    'Content-Type': 'application/json'
};

class ApiClientError extends Error {
    constructor(problem) {
        super(problem.detail || 'API request failed');
        this.name = 'ApiClientError';
        this.status = problem.status;
        this.title = problem.title;
        this.detail = problem.detail;
        this.errors = problem.errors || [];
    }
}

async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
        try {
            payload = await response.json();
        } catch (err) {
            payload = null;
        }
    }

    if (response.ok) {
        return payload;
    }

    const errorBody = payload && payload.error ? payload.error : payload;
    const problem = {
        status: response.status,
        title: errorBody?.title || errorBody?.code || response.statusText || 'ERROR',
        detail: errorBody?.detail || errorBody?.message || response.statusText || 'Server error',
        errors: Array.isArray(errorBody?.errors) ? errorBody.errors : Array.isArray(errorBody?.details) ? errorBody.details : []
    };

    throw new ApiClientError(problem);
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        ...options
    });
    return parseResponse(response);
}

export async function getList(url) {
    return request(url);
}

export async function getById(url, id) {
    return request(`${url}/${id}`);
}

export async function create(url, data) {
    return request(url, { method: 'POST', body: JSON.stringify(data) });
}

export async function update(url, id, data) {
    return request(`${url}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function remove(url, id) {
    return request(`${url}/${id}`, { method: 'DELETE' });
}

export { ApiClientError };
