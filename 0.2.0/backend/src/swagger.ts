export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'OAP 2026 Backend API',
        version: '1.0.0',
        description: 'OpenAPI документація для лабораторної роботи 0.2.0',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Локальний сервер'
        }
    ],
    components: {
        schemas: {
            Software: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'c1b3c5a2-3d2e-4f2b-9e1a-7b4a9d8f6c2b' },
                    name: { type: 'string', example: 'Visual Studio Code' },
                    version: { type: 'string', example: '1.0.0' },
                    license: { type: 'string', example: 'Free' },
                    seats: { type: 'integer', example: 10 },
                    comment: { type: 'string', example: 'Редактор коду' }
                },
                required: ['id', 'name', 'version', 'license', 'seats', 'comment']
            },
            SoftwareCreate: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                    license: { type: 'string', enum: ['Free', 'Commercial'] },
                    seats: { type: 'integer', minimum: 1 },
                    comment: { type: 'string' }
                },
                required: ['name', 'version', 'license', 'seats', 'comment']
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'b2f7c6d9-1e3f-4b5a-8c7d-2e1f0a9b8c7d' },
                    name: { type: 'string', example: 'Ivan' },
                    email: { type: 'string', example: 'ivan@example.com' },
                    role: { type: 'string', enum: ['admin', 'user'], example: 'admin' }
                },
                required: ['id', 'name', 'email', 'role']
            },
            UserCreate: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['admin', 'user'] }
                },
                required: ['name', 'email', 'role']
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: {
                        type: 'object',
                        properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            details: { type: 'array', items: { type: 'object' } }
                        }
                    }
                }
            }
        }
    },
    paths: {
        '/api/software': {
            get: {
                summary: 'Отримати список ПЗ',
                parameters: [
                    { name: 'license', in: 'query', schema: { type: 'string' }, description: 'Фільтр за ліцензією' },
                    { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Номер сторінки' },
                    { name: 'pageSize', in: 'query', schema: { type: 'integer' }, description: 'Кількість записів на сторінку' },
                    { name: 'sortBy', in: 'query', schema: { type: 'string' }, description: 'Поле для сортування' },
                    { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Напрям сортування' }
                ],
                responses: {
                    '200': {
                        description: 'Список ПЗ',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        items: { type: 'array', items: { $ref: '#/components/schemas/Software' } },
                                        total: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Створити нове ПЗ',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SoftwareCreate' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'ПЗ створено',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Software' }
                            }
                        }
                    },
                    '400': { description: 'Помилка валідації', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/software/{id}': {
            get: {
                summary: 'Отримати ПЗ за ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'ПЗ знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Software' } } } },
                    '404': { description: 'Не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            put: {
                summary: 'Оновити ПЗ',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SoftwareCreate' } } }
                },
                responses: {
                    '200': { description: 'ПЗ оновлено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Software' } } } },
                    '400': { description: 'Помилка валідації', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    '404': { description: 'Не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                summary: 'Видалити ПЗ',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '204': { description: 'ПЗ видалено' },
                    '404': { description: 'Не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/users': {
            get: {
                summary: 'Отримати список користувачів',
                responses: {
                    '200': {
                        description: 'Список користувачів',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/User' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Створити користувача',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserCreate' }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Користувача створено', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    '400': { description: 'Помилка валідації', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/users/{id}': {
            get: {
                summary: 'Отримати користувача за ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Користувача знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    '404': { description: 'Не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            put: {
                summary: 'Оновити користувача',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCreate' } } }
                },
                responses: {
                    '200': { description: 'Користувача оновлено', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    '400': { description: 'Помилка валідації', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    '404': { description: 'Не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                summary: 'Видалити користувача',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '204': { description: 'Користувача видалено' },
                    '404': { description: 'Не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        }
    }
};
