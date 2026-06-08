import * as apiClient from './apiClient.js';

// НАЛАШТУВАННЯ ТА URL-АДРЕСИ АРІ
const API_URL_SOFTWARE = 'http://localhost:3000/api/v1/software';
const API_URL_USERS = 'http://localhost:3000/api/users';
const API_URL_CATEGORIES = 'http://localhost:3000/api/categories';

// Загальний стан додатка
const state = {
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
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const userEmailDisplay = document.getElementById('userEmailDisplay');

// DOM Елементи форми входу
const modalTitle = document.getElementById('modalTitle');
const nameField = document.getElementById('nameField');
const loginNameInput = document.getElementById('loginName');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const actionBtn = document.getElementById('actionBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const guestBtn = document.getElementById('guestBtn');
const logoutBtn = document.getElementById('logoutBtn');

let isLoginMode = true; // За замовчуванням стоїть режим "Вхід"

// Перемикання між Входом та Реєстрацією
toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    // Очищаємо помилку при перемиканні режимів
    document.getElementById('loginEmailError').innerText = "";
    
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
    const emailError = document.getElementById('loginEmailError');

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
            const response = await fetch(API_URL_USERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, role: 'user' }) 
            });

            if (response.ok) {
                sessionStorage.setItem('currentUserEmail', email);
                sessionStorage.setItem('currentUserName', name);
                sessionStorage.setItem('currentUserRole', 'user'); 
                checkAuth();
            } else {
                alert("Помилка реєстрації. Перевірте формат даних.");
            }
        } catch (error) { console.error(error); }

    } else {
        // Перевірка існуючого користувача (Вхід)
        try {
            const response = await fetch(API_URL_USERS);
            if (response.ok) {
                const payload = await response.json();
                const users = payload.data || [];
                const existingUser = users.find(u => u.email === email);
                
                if (existingUser) {
                    sessionStorage.setItem('currentUserEmail', email);
                    sessionStorage.setItem('currentUserName', existingUser.name);
                    sessionStorage.setItem('currentUserRole', existingUser.role);
                    checkAuth();
                } else {
                    alert("Користувача не знайдено! Перевірте дані або зареєструйтеся.");
                }
            } else {
                alert("Не вдалося отримати список користувачів. Спробуйте пізніше.");
            }
        } catch (error) { console.error(error); }
    }
});

// Вхід в систему як "Гість"
guestBtn.addEventListener('click', (e) => {
    e.preventDefault();
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
        
        // Безпечне відображення імені користувача без XSS-уязливості
        userEmailDisplay.innerHTML = '';
        const textNode = document.createTextNode(`Ви увійшли як: \u00A0${name} `);
        const roleSpan = document.createElement('strong');
        roleSpan.textContent = `(${role})`;
        userEmailDisplay.appendChild(textNode);
        userEmailDisplay.appendChild(roleSpan);
        
        logoutBtn.innerText = role === 'guest' ? 'Увійти' : 'Вийти';

        const isAdmin = role === 'admin';
        const isGuest = role === 'guest';

        // Керування відображенням
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? 'block' : 'none');
        document.querySelectorAll('.action-column').forEach(el => el.style.display = isAdmin ? 'table-cell' : 'none');
        document.querySelectorAll('.hide-for-guest').forEach(el => el.style.display = isGuest ? 'none' : 'block');

        // Завантажуємо дані з бекенду
        fetchCategories();
        fetchItems();
        fetchUsers();
    } else {
        loginScreen.style.display = 'flex';
    }
}

// Вихід з кабінету та очищення сесії
logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    loginEmailInput.value = ''; 
    loginPasswordInput.value = '';
    document.getElementById('loginEmailError').innerText = "";
    document.getElementById("itemsTableBody").innerHTML = "";
    document.getElementById("usersTableBody").innerHTML = "";
    checkAuth(); 
});


// ЛОГІКА ДЛЯ SOFTWARE (Програмне забезпечення)
const form = document.getElementById("createForm");
const tableBody = document.getElementById("itemsTableBody");
let editId = null; 

// Отримати весь список ПЗ (GET /api/v1/software)
async function fetchItems() {
    state.itemsStatus = 'loading';
    state.itemsError = '';
    renderItemsStatus();

    try {
        let url = new URL(API_URL_SOFTWARE);
        if (state.license) url.searchParams.append('license', state.license);

        const payload = await apiClient.getList(url);
        state.items = payload?.data || [];
        state.itemsStatus = state.items.length ? 'loaded' : 'empty';
    } catch (error) {
        state.items = [];
        state.itemsStatus = 'error';
        state.itemsError = error.detail || error.message || 'Network error';
    }

    renderItems();
    renderItemsStatus();
}

// Отримати список категорій (GET /api/categories)
async function fetchCategories() {
    try {
        const response = await fetch(API_URL_CATEGORIES);
        if (response.ok) {
            const categories = await response.json();
            state.categories = Array.isArray(categories) ? categories : [];
            populateCategorySelect();
            if (state.items.length > 0) renderItems();
        }
    } catch (error) { console.error(error); }
}

function populateCategorySelect() {
    const select = document.getElementById('categorySelect');
    if (!select) return;
    select.innerHTML = '<option value="">Оберіть категорію</option>';
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function getCategoryName(categoryId) {
    const category = state.categories.find(c => c.id === categoryId);
    return category ? category.name : '-';
}


function clearSoftwareErrors() {
    form.querySelectorAll('.error-text').forEach(el => el.innerText = '');
}

function setSoftwareFieldError(field, message) {
    const el = document.getElementById(`${field}Error`);
    if (el) {
        el.innerText = message;
    } else {
        document.getElementById('softwareFormError').innerText = message;
    }
}

function displaySoftwareErrors(error) {
    const generalError = error.detail || error.message || 'Помилка сервера';
    document.getElementById('softwareFormError').innerText = generalError;

    if (Array.isArray(error.errors)) {
        error.errors.forEach(err => {
            if (err.field) {
                setSoftwareFieldError(err.field, err.message || err.detail || generalError);
            }
        });
    }
}

function validateSoftwareForm(formData) {
    const errors = [];

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
async function addItem(formData) {
    clearSoftwareErrors();
    try {
        await apiClient.create(API_URL_SOFTWARE, formData);
        resetSoftwareForm();
        fetchItems();
    } catch (error) {
        console.error(error);
        displaySoftwareErrors(error);
    }
}

// Оновлення існуючого запису ПЗ (PUT /api/v1/software/:id)
async function saveEditItem(formData) {
    clearSoftwareErrors();
    try {
        await apiClient.update(API_URL_SOFTWARE, editId, formData);
        resetSoftwareForm();
        fetchItems();
    } catch (error) {
        console.error(error);
        displaySoftwareErrors(error);
    }
}

// Видалення запису ПЗ (DELETE /api/v1/software/:id)
async function deleteItem(id) {
    try {
        await apiClient.remove(API_URL_SOFTWARE, id);
        fetchItems();
    } catch (error) {
        console.error(error);
        alert(error.detail || error.message || 'Не вдалося видалити запис');
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
        emptyRow.innerHTML = `<td colspan="8" style="text-align:center; font-style:italic; color:#555;">Немає записів для відображення.</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    filtered.forEach((item) => {
        const row = document.createElement('tr');
        
        const actionHtml = isAdmin ? `
            <td>
                <button type="button" class="edit-btn" data-id="${item.id}" style="color:#3528a8; border-color:#3528a8;">Редагувати</button>
                <button type="button" class="delete-btn" data-id="${item.id}" style="color:red; border-color:red;">Видалити</button>
            </td>
        ` : '';

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.version}</td>
            <td>${item.license}</td>
            <td>${getCategoryName(item.categoryId)}</td>
            <td>${item.seats}</td>
            <td>${item.comment || ''}</td>
            <td><button type="button" class="details-btn" data-id="${item.id}" style="padding:4px 8px; border-color:#3528a8; color:#3528a8; background:#fff;">Деталі</button></td>
            ${actionHtml}
        `;
        tableBody.appendChild(row);
    });
}

// Заповнення форми даними для редагування ПЗ
function startEdit(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    editId = id;
    
    document.getElementById("formTitle").innerText = "Редагувати ПЗ";
    document.getElementById("nameInput").value = item.name;
    document.getElementById("versionInput").value = item.version;
    document.getElementById("licenseSelect").value = item.license;
    document.getElementById("seatsInput").value = item.seats;
    document.getElementById("categorySelect").value = item.categoryId || '';
    document.getElementById("commentInput").value = item.comment || '';
    
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "inline-block";
}

// Очищення форми ПЗ після додавання або редагування
function resetSoftwareForm() {
    editId = null;
    form.reset();
    
    // Очищення червоних написів помилок ПЗ
    const errorElements = form.querySelectorAll('.error-text');
    errorElements.forEach(el => el.innerText = "");

    document.getElementById("formTitle").innerText = "Додати ПЗ";
    document.getElementById("categorySelect").value = '';
    document.getElementById("submitBtn").style.display = "inline-block";
    document.getElementById("saveBtn").style.display = "none";
}

// Обробники подій для ПЗ 
tableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) deleteItem(e.target.getAttribute('data-id'));
    if (e.target.classList.contains('edit-btn')) startEdit(e.target.getAttribute('data-id'));
    if (e.target.classList.contains('details-btn')) fetchItemDetails(e.target.getAttribute('data-id'));
});

function renderItemsStatus() {
    const statusEl = document.getElementById('itemsStatus');
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

async function fetchItemDetails(id) {
    if (!id) return;
    state.selectedItemStatus = 'loading';
    state.selectedItemError = '';
    renderItemDetails();

    try {
        const payload = await apiClient.getById(API_URL_SOFTWARE, id);
        state.selectedItem = payload?.data || null;
        state.selectedItemStatus = state.selectedItem ? 'loaded' : 'empty';
    } catch (error) {
        state.selectedItem = null;
        state.selectedItemStatus = 'error';
        state.selectedItemError = error.detail || error.message || 'Network error';
    }

    renderItemDetails();
}

function renderItemDetails() {
    const detailsContainer = document.getElementById('itemDetailsContainer');
    if (!detailsContainer) return;

    if (state.selectedItemStatus === 'loading') {
        detailsContainer.innerHTML = '<p>Завантаження деталей...</p>';
        return;
    }

    if (state.selectedItemStatus === 'error') {
        detailsContainer.innerHTML = `<p style="color:red; font-weight:bold;">Помилка завантаження деталей: ${state.selectedItemError}</p>`;
        return;
    }

    if (state.selectedItemStatus === 'empty' || !state.selectedItem) {
        detailsContainer.innerHTML = '<p>Деталі не знайдено.</p>';
        return;
    }

    const item = state.selectedItem;
    detailsContainer.innerHTML = `
        <div><strong>Назва:</strong> ${item.name || '-'}</div>
        <div><strong>Версія:</strong> ${item.version || '-'}</div>
        <div><strong>Ліцензія:</strong> ${item.license || '-'}</div>
        <div><strong>Категорія:</strong> ${getCategoryName(item.categoryId) || '-'}</div>
        <div><strong>Місця:</strong> ${item.seats || '-'}</div>
        <div><strong>Коментар:</strong> ${item.comment || '-'}</div>
        <div><strong>ID:</strong> ${item.id || '-'}</div>
    `;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearSoftwareErrors();

    const formData = {
        name: document.getElementById("nameInput").value.trim(),
        version: document.getElementById("versionInput").value.trim(),
        license: document.getElementById("licenseSelect").value,
        seats: Number(document.getElementById("seatsInput").value),
        categoryId: document.getElementById("categorySelect").value || null,
        comment: document.getElementById("commentInput").value.trim()
    };

    const validationErrors = validateSoftwareForm(formData);
    if (validationErrors.length > 0) {
        validationErrors.forEach(err => setSoftwareFieldError(err.field, err.message));
        return;
    }

    if (editId) saveEditItem(formData);
    else addItem(formData);
});

document.getElementById("saveBtn").addEventListener("click", () => form.dispatchEvent(new Event("submit")));
document.getElementById('resetBtn').addEventListener('click', resetSoftwareForm);
document.getElementById('searchInput').addEventListener('input', (e) => { state.search = e.target.value; renderItems(); });
document.getElementById('licenseFilter').addEventListener('change', (e) => { state.license = e.target.value; fetchItems(); });


// ЛОГІКА ДЛЯ USERS (Користувачі)
const userForm = document.getElementById("userForm");
const usersTableBody = document.getElementById("usersTableBody");
let editUserId = null; // ID користувача для редагування

// Отримати список користувачів (GET /api/users)
async function fetchUsers() {
    try {
        const response = await fetch(API_URL_USERS);
        if (response.ok) {
            const payload = await response.json();
            state.users = payload.data || [];
            renderUsers();
        }
    } catch (error) { console.error(error); }
}

// Створення нового користувача адміном (POST /api/users)
async function addUser(formData) {
    try {
        const response = await fetch(API_URL_USERS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (response.ok) fetchUsers(); 
        else alert("Помилка валідації користувача!");
    } catch (error) { console.error(error); }
}

// Оновлення ролі або даних користувача (PUT /api/users/:id)
async function saveEditUser(formData) {
    try {
        const response = await fetch(`${API_URL_USERS}/${editUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            resetUserForm();
            fetchUsers();
            
            // Якщо адмін відредагував власні дані
            const currentEmail = sessionStorage.getItem('currentUserEmail');
            if (formData.email === currentEmail) {
                sessionStorage.setItem('currentUserName', formData.name);
                sessionStorage.setItem('currentUserRole', formData.role);
                checkAuth(); 
            }
        } else alert("Помилка оновлення користувача!");
    } catch (error) { console.error(error); }
}

// Видалення користувача (DELETE /api/users/:id)
async function deleteUser(id) {
    try {
        const response = await fetch(`${API_URL_USERS}/${id}`, { method: 'DELETE' });
        if (response.ok) fetchUsers();
    } catch (error) { console.error(error); }
}

// Відображення списку користувачів у таблиці
function renderUsers() {
    usersTableBody.innerHTML = "";
    const isAdmin = sessionStorage.getItem('currentUserRole') === 'admin';

    state.users.forEach((user) => {
        const row = document.createElement('tr');
        
        const actionHtml = isAdmin ? `
            <td>
                <button type="button" class="edit-user-btn" data-id="${user.id}" style="color:#3528a8; border-color:#3528a8;">Редагувати</button>
                <button type="button" class="delete-user-btn" data-id="${user.id}" style="color:red; border-color:red;">Видалити</button>
            </td>
        ` : '';

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><b>${user.role}</b></td>
            ${actionHtml}
        `;
        usersTableBody.appendChild(row);
    });
}

// Заповнення форми для редагування користувача
function startUserEdit(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    editUserId = id;
    
    document.getElementById("userFormTitle").innerText = "Редагувати користувача";
    document.getElementById("userNameInput").value = user.name;
    document.getElementById("userEmailInput").value = user.email;
    document.getElementById("userRoleSelect").value = user.role;
    
    document.getElementById("userSubmitBtn").style.display = "none";
    document.getElementById("userSaveBtn").style.display = "inline-block";
}

// Очищення форми користувачів
function resetUserForm() {
    editUserId = null;
    userForm.reset();
    
    // Очищення червоного напису перевірки email
    const emailError = document.getElementById("userEmailError");
    if (emailError) emailError.innerText = "";

    document.getElementById("userFormTitle").innerText = "Додати користувача";
    document.getElementById("userSubmitBtn").style.display = "inline-block";
    document.getElementById("userSaveBtn").style.display = "none";
}

// Обробники подій для Користувачів
usersTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-user-btn')) deleteUser(e.target.getAttribute('data-id'));
    if (e.target.classList.contains('edit-user-btn')) startUserEdit(e.target.getAttribute('data-id'));
});

userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("userEmailInput").value.trim();
    const emailError = document.getElementById("userEmailError");
    
    // Кастомна перевірка на @
    emailError.innerText = "";
    if (email !== "" && !email.includes('@')) {
        emailError.innerText = "Email має містити символ '@'";
        return;
    }

    const formData = {
        name: document.getElementById("userNameInput").value.trim(),
        email: email,
        role: document.getElementById("userRoleSelect").value
    };
    
    if (editUserId) saveEditUser(formData);
    else addUser(formData);
    
    if (!editUserId) resetUserForm();
});

document.getElementById("userSaveBtn").addEventListener("click", () => userForm.dispatchEvent(new Event("submit")));
document.getElementById("userResetBtn").addEventListener("click", resetUserForm);

// СТАРТ ДОДАТКА
checkAuth();