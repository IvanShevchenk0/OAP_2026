import * as apiClient from './apiClient.js';
import type {
    ApiItemResponse,
    ApiListResponse,
    CreateSoftwareDto,
    Software
} from './shared/dtos';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

// НАЛАШТУВАННЯ ТА URL-АДРЕСИ АРІ
const API_URL_SOFTWARE = 'http://localhost:3000/api/v1/software';
const API_URL_USERS = 'http://localhost:3000/api/users';
const API_URL_CATEGORIES = 'http://localhost:3000/api/categories';

// Загальний стан додатка
const state: {
    items: Software[];
    search: string;
    license: string;
    users: any[];
    categories: any[];
    itemsStatus: 'idle' | 'loading' | 'loaded' | 'empty' | 'error';
    itemsError: string;
    selectedItem: Software | null;
    selectedItemStatus: 'idle' | 'loading' | 'loaded' | 'empty' | 'error';
    selectedItemError: string;
} = {
    items: [],
    search: '',
    license: '',
    users: [],
    categories: [],
    itemsStatus: 'idle',
    itemsError: '',
    selectedItem: null,
    selectedItemStatus: 'idle',
    selectedItemError: ''
};

// ЛОГІКА АВТОРИЗАЦІЇ / РЕЄСТРАЦІЇ / ГОСТЯ
const loginScreen = document.getElementById('loginScreen') as HTMLElement;
const dashboardScreen = document.getElementById('dashboardScreen') as HTMLElement;
const userEmailDisplay = document.getElementById('userEmailDisplay') as HTMLElement;

// DOM Елементи форми входу
const modalTitle = document.getElementById('modalTitle') as HTMLElement;
const nameField = document.getElementById('nameField') as HTMLElement;
const loginNameInput = document.getElementById('loginName') as HTMLInputElement;
const loginEmailInput = document.getElementById('loginEmail') as HTMLInputElement;
const loginPasswordInput = document.getElementById('loginPassword') as HTMLInputElement;
const actionBtn = document.getElementById('actionBtn') as HTMLElement;
const toggleAuthMode = document.getElementById('toggleAuthMode') as HTMLElement;
const guestBtn = document.getElementById('guestBtn') as HTMLElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLElement;

let isLoginMode = true; // За замовчуванням стоїть режим "Вхід"

// Перемикання між Входом та Реєстрацією
toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    // Очищаємо помилку при перемиканні режимів
    (document.getElementById('loginEmailError') as HTMLElement).innerText = "";
    
    if (isLoginMode) {
        modalTitle.innerText = "Вхід в систему";
        nameField.style.display = "none";
        actionBtn.innerText = "Увійти";
        toggleAuthMode.innerText = "Немає акаунту? Зареєструватися";
    } else {
        modalTitle.innerText = "Реєстрація";
        nameField.style.display = "block";
        actionBtn.innerText = "Зареєструватися";
        toggleAuthMode.innerText = "Вже є акаунт? Увійти";
    }
});

// Обробка натискання кнопки "Увійти / Зареєструватися"
actionBtn.addEventListener('click', async () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();
    const emailError = document.getElementById('loginEmailError') as HTMLElement;

    // Кастомна перевірка на @ (прибираємо браузерну бульбашку)
    emailError.innerText = "";
    if (email !== "" && !email.includes('@')) {
        emailError.innerText = "Email має містити символ '@'";
        return;
    }

    if (!email || !password) return alert("Будь ласка, заповніть email та пароль!");
    if (password.length < 3) return alert("Пароль має містити хоча б 3 символи!");

    if (!isLoginMode) {
        // Створення нового користувача (Реєстрація)
        const name = loginNameInput.value.trim();
        if (!name) return alert("Введіть ваше ім'я!");

        try {
            // Call server register endpoint. Server returns { user, token }.
            const payload = await apiClient.create<{ user: User; token: string }>(`${location.origin}/api/auth/register`, {
                name,
                email,
                password
            });

            // Store token and basic identity in sessionStorage for UI and future requests
            const user = payload.data.user;
            const token = payload.data.token;
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('currentUserId', user.id);
            sessionStorage.setItem('currentUserEmail', user.email);
            sessionStorage.setItem('currentUserName', user.name);
            sessionStorage.setItem('currentUserRole', user.role);
            checkAuth();
        } catch (error) {
            console.error(error);
            alert("Помилка реєстрації. Перевірте формат даних.");
        }

    } else {
        // Перевірка існуючого користувача (Вхід)
        try {
            // Call server login endpoint. Server returns { user, token } on success.
            const payload = await apiClient.create<{ user: User; token: string }>(`${location.origin}/api/auth/login`, {
                email,
                password
            });

            // Save token and identity to sessionStorage
            const user = payload.data.user;
            const token = payload.data.token;
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('currentUserId', user.id);
            sessionStorage.setItem('currentUserEmail', user.email);
            sessionStorage.setItem('currentUserName', user.name);
            sessionStorage.setItem('currentUserRole', user.role);
            checkAuth();
        } catch (error) {
            console.error(error);
            const msg = getErrorText(error);
            alert(msg || "Не вдалося увійти. Перевірте облікові дані.");
        }
    }
});

// Вхід в систему як "Гість"
guestBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.setItem('currentUserId', 'guest');
    sessionStorage.setItem('currentUserEmail', 'guest');
    sessionStorage.setItem('currentUserName', 'Гість');
    sessionStorage.setItem('currentUserRole', 'guest');
    checkAuth();
});

// Перевірка авторизації та керування правами (RBAC)
function checkAuth() {
    const name = sessionStorage.getItem('currentUserName');
    const role = sessionStorage.getItem('currentUserRole');

    if (name) {
        loginScreen.style.display = 'none'; // Ховаємо модалку
        userEmailDisplay.textContent = '';
        const label = document.createElement('span');
        label.textContent = 'Ви увійшли як: ';
        const identity = document.createElement('strong');
        identity.textContent = `${name} (${role})`;
        userEmailDisplay.appendChild(label);
        userEmailDisplay.appendChild(identity);
        
        logoutBtn.innerText = role === 'guest' ? 'Увійти' : 'Вийти';

        const isAdmin = role === 'admin';
        const isGuest = role === 'guest';

        // Показуємо або ховаємо елементи інтерфейсу залежно від ролі
        document.querySelectorAll<HTMLElement>('.admin-only').forEach(el => el.style.display = isAdmin ? 'block' : 'none');
        document.querySelectorAll<HTMLElement>('.action-column').forEach(el => el.style.display = isAdmin ? 'table-cell' : 'none');
        document.querySelectorAll<HTMLElement>('.hide-for-guest').forEach(el => el.style.display = isGuest ? 'none' : 'block');

        // Завантаження даних після авторизації
        fetchCategories();
        fetchItems();
        fetchUsers();
    } else {
        loginScreen.style.display = 'flex';
    }
}

// Вихід з кабінету та очищення сесії
// Logout button: call server to revoke token then clear client state
logoutBtn.addEventListener('click', () => {
    (async () => {
        try {
            await apiClient.create(`${location.origin}/api/auth/logout`, {});
        } catch (err) {
            // ignore errors on logout
        }
        sessionStorage.clear();
        loginEmailInput.value = ''; 
        loginPasswordInput.value = '';
        (document.getElementById('loginEmailError') as HTMLElement).innerText = "";
        (document.getElementById("itemsTableBody") as HTMLElement).innerHTML = "";
        (document.getElementById("usersTableBody") as HTMLElement).innerHTML = "";
        checkAuth();
    })();
});


// ЛОГІКА ДЛЯ SOFTWARE (Програмне забезпечення)
const form = document.getElementById("createForm") as HTMLFormElement;
const tableBody = document.getElementById("itemsTableBody") as HTMLTableSectionElement;
let editId: string | null = null;

// Отримати весь список ПЗ (GET /api/v1/software)
async function fetchItems() {
    state.itemsStatus = 'loading';
    state.itemsError = '';
    renderItemsStatus();

    try {
        const url = new URL(API_URL_SOFTWARE);
        if (state.license) url.searchParams.append('license', state.license);

        const payload = await apiClient.getList<ApiListResponse<Software>>(url);
        state.items = payload?.data || [];
        state.itemsStatus = state.items.length ? 'loaded' : 'empty';
    } catch (error: unknown) {
        state.items = [];
        state.itemsStatus = 'error';
        state.itemsError = getErrorText(error);
    }

    renderItems();
    renderItemsStatus();
}

// Отримати список категорій (GET /api/categories)
async function fetchCategories() {
    try {
        const payload = await apiClient.getList<ApiListResponse<any>>(API_URL_CATEGORIES);
        state.categories = payload.data || [];
        populateCategorySelect();
        if (state.items.length > 0) renderItems();
    } catch (error) {
        console.error(error);
    }
}

function populateCategorySelect() {
    const select = document.getElementById('categorySelect') as HTMLSelectElement;
    if (!select) return;
    select.innerHTML = '';
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Оберіть категорію';
    select.appendChild(emptyOption);

    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function getCategoryName(categoryId: string | null | undefined) {
    const category = state.categories.find(c => c.id === categoryId);
    return category ? category.name : '-';
}

function getErrorText(error: unknown): string {
    if (error instanceof apiClient.ApiClientError) {
        return error.detail || error.message || 'Помилка сервера';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Помилка сервера';
}

function clearSoftwareErrors() {
    form.querySelectorAll<HTMLElement>('.error-text').forEach(el => el.innerText = '');
}

function setSoftwareFieldError(field: string, message: string) {
    const el = document.getElementById(`${field}Error`);
    if (el) {
        el.innerText = message;
    } else {
        (document.getElementById('softwareFormError') as HTMLElement).innerText = message;
    }
}

function displaySoftwareErrors(error: unknown) {
    const errorText = getErrorText(error);
    (document.getElementById('softwareFormError') as HTMLElement).innerText = errorText;

    if (error instanceof apiClient.ApiClientError && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
            if (err.field) {
                setSoftwareFieldError(err.field, err.message || errorText);
            }
        });
    }
}

function validateSoftwareForm(formData: CreateSoftwareDto) {
    const errors: Array<{ field: string; message: string }> = [];

    if (!formData.name) {
        errors.push({ field: 'name', message: 'Назва обов’язкова.' });
    } else if (formData.name.length > 100) {
        errors.push({ field: 'name', message: 'Назва повинна бути не більше 100 символів.' });
    }

    if (!formData.version) {
        errors.push({ field: 'version', message: 'Версія обов’язкова.' });
    } else if (formData.version.length > 50) {
        errors.push({ field: 'version', message: 'Версія повинна бути не більше 50 символів.' });
    }

    if (!formData.license) {
        errors.push({ field: 'license', message: 'Оберіть тип ліцензії.' });
    }

    if (!Number.isInteger(formData.seats) || formData.seats < 1 || formData.seats > 1000) {
        errors.push({ field: 'seats', message: 'Кількість місць має бути цілим числом від 1 до 1000.' });
    }

    if (formData.comment && formData.comment.length > 300) {
        errors.push({ field: 'comment', message: 'Коментар не може перевищувати 300 символів.' });
    }

    return errors;
}

// Створення нового запису ПЗ (POST /api/v1/software)
async function addItem(formData: CreateSoftwareDto) {
    clearSoftwareErrors();
    try {
        await apiClient.create<ApiItemResponse<Software>>(API_URL_SOFTWARE, formData);
        resetSoftwareForm();
        fetchItems();
    } catch (error: unknown) {
        console.error(error);
        displaySoftwareErrors(error as Error);
    }
}

// Оновлення існуючого запису ПЗ (PUT /api/v1/software/:id)
async function saveEditItem(formData: CreateSoftwareDto) {
    if (!editId) return;
    clearSoftwareErrors();
    try {
        await apiClient.update<ApiItemResponse<Software>>(API_URL_SOFTWARE, editId, formData);
        resetSoftwareForm();
        fetchItems();
    } catch (error: unknown) {
        console.error(error);
        displaySoftwareErrors(error as Error);
    }
}

// Видалення запису ПЗ (DELETE /api/v1/software/:id)
async function deleteItem(id: string | null) {
    if (!id) return;
    try {
        await apiClient.remove(API_URL_SOFTWARE, id);
        fetchItems();
    } catch (error: unknown) {
        console.error(error);
        alert(getErrorText(error) || 'Не вдалося видалити запис');
    }
}

// Відображення списку ПЗ у HTML-таблиці
function renderItems() {
    tableBody.innerHTML = "";
    const isAdmin = sessionStorage.getItem('currentUserRole') === 'admin';
    
    let filtered = state.items;
    if (state.search) filtered = filtered.filter(item => item.name.toLowerCase().includes(state.search.toLowerCase()));
    
    if (filtered.length === 0 && state.itemsStatus === 'loaded') {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 8;
        emptyCell.style.textAlign = 'center';
        emptyCell.style.fontStyle = 'italic';
        emptyCell.style.color = '#555';
        emptyCell.textContent = 'Немає записів для відображення.';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
    }

    filtered.forEach((item) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        const versionCell = document.createElement('td');
        versionCell.textContent = item.version;
        const licenseCell = document.createElement('td');
        licenseCell.textContent = item.license;
        const categoryCell = document.createElement('td');
        categoryCell.textContent = getCategoryName(item.categoryId);
        const seatsCell = document.createElement('td');
        seatsCell.textContent = String(item.seats);
        const commentCell = document.createElement('td');
        commentCell.textContent = item.comment || '';

        const detailsCell = document.createElement('td');
        const detailsButton = document.createElement('button');
        detailsButton.type = 'button';
        detailsButton.className = 'details-btn';
        detailsButton.dataset.id = item.id;
        detailsButton.style.padding = '4px 8px';
        detailsButton.style.borderColor = '#3528a8';
        detailsButton.style.color = '#3528a8';
        detailsButton.style.background = '#fff';
        detailsButton.textContent = 'Деталі';
        detailsCell.appendChild(detailsButton);

        row.append(nameCell, versionCell, licenseCell, categoryCell, seatsCell, commentCell, detailsCell);

        if (isAdmin) {
            const actionsCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'edit-btn';
            editButton.dataset.id = item.id;
            editButton.style.color = '#3528a8';
            editButton.style.borderColor = '#3528a8';
            editButton.textContent = 'Редагувати';

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-btn';
            deleteButton.dataset.id = item.id;
            deleteButton.style.color = 'red';
            deleteButton.style.borderColor = 'red';
            deleteButton.textContent = 'Видалити';

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);
        }

        tableBody.appendChild(row);
    });
}

// Заповнення форми даними для редагування ПЗ
function startEdit(id: string) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    editId = id;

    const formTitle = document.getElementById("formTitle") as HTMLElement | null;
    const nameInput = document.getElementById("nameInput") as HTMLInputElement | null;
    const versionInput = document.getElementById("versionInput") as HTMLInputElement | null;
    const licenseSelect = document.getElementById("licenseSelect") as HTMLSelectElement | null;
    const seatsInput = document.getElementById("seatsInput") as HTMLInputElement | null;
    const categorySelect = document.getElementById("categorySelect") as HTMLSelectElement | null;
    const commentInput = document.getElementById("commentInput") as HTMLInputElement | null;
    const submitBtn = document.getElementById("submitBtn") as HTMLElement | null;
    const saveBtn = document.getElementById("saveBtn") as HTMLElement | null;

    if (formTitle) formTitle.innerText = "Редагувати ПЗ";
    if (nameInput) nameInput.value = item.name;
    if (versionInput) versionInput.value = item.version;
    if (licenseSelect) licenseSelect.value = item.license;
    if (seatsInput) seatsInput.value = String(item.seats);
    if (categorySelect) categorySelect.value = item.categoryId || '';
    if (commentInput) commentInput.value = item.comment || '';
    if (submitBtn) submitBtn.style.display = "none";
    if (saveBtn) saveBtn.style.display = "inline-block";
}

// Очищення форми ПЗ після додавання або редагування
function resetSoftwareForm() {
    editId = null;
    form.reset();
    
    // Очищення червоних написів помилок ПЗ
    const errorElements = form.querySelectorAll<HTMLElement>('.error-text');
    errorElements.forEach(el => el.innerText = "");

    const formTitle = document.getElementById("formTitle") as HTMLElement | null;
    const categorySelect = document.getElementById("categorySelect") as HTMLSelectElement | null;
    const submitBtn = document.getElementById("submitBtn") as HTMLElement | null;
    const saveBtn = document.getElementById("saveBtn") as HTMLElement | null;

    if (formTitle) formTitle.innerText = "Додати ПЗ";
    if (categorySelect) categorySelect.value = '';
    if (submitBtn) submitBtn.style.display = "inline-block";
    if (saveBtn) saveBtn.style.display = "none";
}

// Обробники подій для ПЗ 
tableBody.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const id = target.getAttribute('data-id');
    if (!id) return;

    if (target.classList.contains('delete-btn')) deleteItem(id);
    if (target.classList.contains('edit-btn')) startEdit(id);
    if (target.classList.contains('details-btn')) fetchItemDetails(id);
});

function renderItemsStatus() {
    const statusEl = document.getElementById('itemsStatus') as HTMLElement;
    if (!statusEl) return;
    if (state.itemsStatus === 'loading') {
        statusEl.textContent = 'Завантаження списку...';
        statusEl.style.color = '#3528a8';
    } else if (state.itemsStatus === 'empty') {
        statusEl.textContent = 'Немає даних.';
        statusEl.style.color = '#555';
    } else if (state.itemsStatus === 'error') {
        statusEl.textContent = `Помилка завантаження: ${state.itemsError}`;
        statusEl.style.color = 'red';
    } else {
        statusEl.textContent = '';
    }
}

async function fetchItemDetails(id: string) {
    if (!id) return;
    state.selectedItemStatus = 'loading';
    state.selectedItemError = '';
    renderItemDetails();

    try {
        const payload = await apiClient.getById<ApiItemResponse<Software>>(API_URL_SOFTWARE, id);
        state.selectedItem = payload?.data || null;
        state.selectedItemStatus = state.selectedItem ? 'loaded' : 'empty';
    } catch (error: unknown) {
        state.selectedItem = null;
        state.selectedItemStatus = 'error';
        state.selectedItemError = error instanceof apiClient.ApiClientError
            ? error.detail
            : error instanceof Error
            ? error.message
            : 'Network error';
    }

    renderItemDetails();
}

function renderItemDetails() {
    const detailsContainer = document.getElementById('itemDetailsContainer') as HTMLElement;

    if (!detailsContainer) return;

    detailsContainer.textContent = '';

    if (state.selectedItemStatus === 'loading') {
        const loading = document.createElement('p');
        loading.textContent = 'Завантаження деталей...';
        detailsContainer.appendChild(loading);
        return;
    }

    if (state.selectedItemStatus === 'error') {
        const errorMessage = document.createElement('p');
        errorMessage.style.color = 'red';
        errorMessage.style.fontWeight = 'bold';
        errorMessage.textContent = `Помилка завантаження деталей: ${state.selectedItemError}`;
        detailsContainer.appendChild(errorMessage);
        return;
    }

    if (state.selectedItemStatus === 'empty' || !state.selectedItem) {
        const empty = document.createElement('p');
        empty.textContent = 'Деталі не знайдено.';
        detailsContainer.appendChild(empty);
        return;
    }

    const item = state.selectedItem;
    const details = [
        { label: 'Назва', value: item.name || '-' },
        { label: 'Версія', value: item.version || '-' },
        { label: 'Ліцензія', value: item.license || '-' },
        { label: 'Категорія', value: getCategoryName(item.categoryId) || '-' },
        { label: 'Місця', value: String(item.seats || '-') },
        { label: 'Коментар', value: item.comment || '-' },
        { label: 'ID', value: item.id || '-' }
    ];

    details.forEach(detail => {
        const row = document.createElement('div');
        const label = document.createElement('strong');
        label.textContent = `${detail.label}: `;
        row.appendChild(label);
        row.appendChild(document.createTextNode(detail.value));
        detailsContainer.appendChild(row);
    });
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearSoftwareErrors();

    const nameInput = document.getElementById("nameInput") as HTMLInputElement;
    const versionInput = document.getElementById("versionInput") as HTMLInputElement;
    const licenseSelect = document.getElementById("licenseSelect") as HTMLSelectElement;
    const seatsInput = document.getElementById("seatsInput") as HTMLInputElement;
    const categorySelect = document.getElementById("categorySelect") as HTMLSelectElement;
    const commentInput = document.getElementById("commentInput") as HTMLInputElement;

    const formData: CreateSoftwareDto = {
        name: nameInput.value.trim(),
        version: versionInput.value.trim(),
        license: licenseSelect.value,
        seats: Number(seatsInput.value),
        categoryId: categorySelect.value || null,
        comment: commentInput.value.trim()
    };

    const validationErrors = validateSoftwareForm(formData);
    if (validationErrors.length > 0) {
        validationErrors.forEach(err => setSoftwareFieldError(err.field, err.message));
        return;
    }

    if (editId) saveEditItem(formData);
    else addItem(formData);
});

(document.getElementById("saveBtn") as HTMLElement).addEventListener("click", () => form.dispatchEvent(new Event("submit")));
(document.getElementById('resetBtn') as HTMLElement).addEventListener('click', resetSoftwareForm);
(document.getElementById('searchInput') as HTMLInputElement).addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement | null;
    if (!target) return;
    state.search = target.value;
    renderItems();
});
(document.getElementById('licenseFilter') as HTMLSelectElement).addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement | null;
    if (!target) return;
    state.license = target.value;
    fetchItems();
});


// ЛОГІКА ДЛЯ USERS (Користувачі)
const userForm = document.getElementById("userForm") as HTMLFormElement;
const usersTableBody = document.getElementById("usersTableBody") as HTMLTableSectionElement;
let editUserId: string | null = null; // ID користувача для редагування

// Отримати список користувачів (GET /api/users)
async function fetchUsers() {
    try {
        const payload = await apiClient.getList<ApiListResponse<User>>(API_URL_USERS);
        state.users = payload.data || [];
        renderUsers();
    } catch (error) {
        console.error(error);
    }
}

// Створення нового користувача адміном (POST /api/users)
async function addUser(formData: { name: string; email: string; role: string }) {
    try {
        await apiClient.create<ApiItemResponse<User>>(API_URL_USERS, formData);
        fetchUsers();
    } catch (error) {
        console.error(error);
        alert("Помилка валідації користувача!");
    }
}

// Оновлення ролі або даних користувача (PUT /api/users/:id)
async function saveEditUser(formData: { name: string; email: string; role: string }) {
    if (!editUserId) return;
    try {
        await apiClient.update<ApiItemResponse<User>>(API_URL_USERS, editUserId, formData);
        resetUserForm();
        fetchUsers();
        
        // Якщо адмін відредагував власні дані
        const currentEmail = sessionStorage.getItem('currentUserEmail');
        if (formData.email === currentEmail) {
            sessionStorage.setItem('currentUserName', formData.name);
            sessionStorage.setItem('currentUserRole', formData.role);
            checkAuth(); 
        }
    } catch (error) {
        console.error(error);
        alert("Помилка оновлення користувача!");
    }
}

// Видалення користувача (DELETE /api/users/:id)
async function deleteUser(id: string | null) {
    if (!id) return;
    try {
        await apiClient.remove(API_URL_USERS, id);
        fetchUsers();
    } catch (error) {
        console.error(error);
    }
}

// Відображення списку користувачів у таблиці
function renderUsers() {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = "";
    const isAdmin = sessionStorage.getItem('currentUserRole') === 'admin';

    state.users.forEach((user) => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = user.name;
        const emailCell = document.createElement('td');
        emailCell.textContent = user.email;
        const roleCell = document.createElement('td');
        const roleStrong = document.createElement('strong');
        roleStrong.textContent = user.role;
        roleCell.appendChild(roleStrong);

        row.append(nameCell, emailCell, roleCell);

        if (isAdmin) {
            const actionsCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'edit-user-btn';
            editButton.dataset.id = user.id;
            editButton.style.color = '#3528a8';
            editButton.style.borderColor = '#3528a8';
            editButton.textContent = 'Редагувати';

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-user-btn';
            deleteButton.dataset.id = user.id;
            deleteButton.style.color = 'red';
            deleteButton.style.borderColor = 'red';
            deleteButton.textContent = 'Видалити';

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);
        }

        usersTableBody.appendChild(row);
    });
}

// Заповнення форми для редагування користувача
function startUserEdit(id: string) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    editUserId = id;
    
    const formTitle = document.getElementById("userFormTitle") as HTMLElement | null;
    const userNameInput = document.getElementById("userNameInput") as HTMLInputElement | null;
    const userEmailInput = document.getElementById("userEmailInput") as HTMLInputElement | null;
    const userRoleSelect = document.getElementById("userRoleSelect") as HTMLSelectElement | null;
    const userSubmitBtn = document.getElementById("userSubmitBtn") as HTMLElement | null;
    const userSaveBtn = document.getElementById("userSaveBtn") as HTMLElement | null;

    if (formTitle) formTitle.innerText = "Редагувати користувача";
    if (userNameInput) userNameInput.value = user.name;
    if (userEmailInput) userEmailInput.value = user.email;
    if (userRoleSelect) userRoleSelect.value = user.role;
    if (userSubmitBtn) userSubmitBtn.style.display = "none";
    if (userSaveBtn) userSaveBtn.style.display = "inline-block";
}

// Очищення форми користувачів
function resetUserForm() {
    editUserId = null;
    if (userForm) userForm.reset();
    
    // Очищення червоного напису перевірки email
    const emailError = document.getElementById("userEmailError") as HTMLElement | null;
    if (emailError) emailError.innerText = "";

    const formTitle = document.getElementById("userFormTitle") as HTMLElement | null;
    const userSubmitBtn = document.getElementById("userSubmitBtn") as HTMLElement | null;
    const userSaveBtn = document.getElementById("userSaveBtn") as HTMLElement | null;

    if (formTitle) formTitle.innerText = "Додати користувача";
    if (userSubmitBtn) userSubmitBtn.style.display = "inline-block";
    if (userSaveBtn) userSaveBtn.style.display = "none";
}

// Обробники подій для Користувачів
usersTableBody.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const id = target.getAttribute('data-id');
    if (!id) return;

    if (target.classList.contains('delete-user-btn')) deleteUser(id);
    if (target.classList.contains('edit-user-btn')) startUserEdit(id);
});

userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const userEmailInput = document.getElementById("userEmailInput") as HTMLInputElement;
    const userNameInput = document.getElementById("userNameInput") as HTMLInputElement;
    const userRoleSelect = document.getElementById("userRoleSelect") as HTMLSelectElement;
    const emailError = document.getElementById("userEmailError") as HTMLElement | null;

    const email = userEmailInput.value.trim();
    if (emailError) emailError.innerText = "";
    
    // Кастомна перевірка на @
    if (email !== "" && !email.includes('@')) {
        if (emailError) emailError.innerText = "Email має містити символ '@'";
        return;
    }

    const formData = {
        name: userNameInput.value.trim(),
        email: email,
        role: userRoleSelect.value
    };
    
    if (editUserId) saveEditUser(formData);
    else addUser(formData);
    
    if (!editUserId) resetUserForm();
});

const userSaveBtn = document.getElementById("userSaveBtn") as HTMLElement | null;
const userResetBtn = document.getElementById("userResetBtn") as HTMLElement | null;
if (userSaveBtn) userSaveBtn.addEventListener("click", () => userForm.dispatchEvent(new Event("submit")));
if (userResetBtn) userResetBtn.addEventListener("click", resetUserForm);

// СТАРТ ДОДАТКА
checkAuth();