// НАЛАШТУВАННЯ ТА URL-АДРЕСИ АРІ
const API_URL_SOFTWARE = 'http://localhost:3000/api/software';
const API_URL_USERS = 'http://localhost:3000/api/users';

// Загальний стан додатка
const state = { items: [], search: '', license: '', users: [] };

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
                const users = await response.json();
                const existingUser = users.find(u => u.email === email);
                
                if (existingUser) {
                    sessionStorage.setItem('currentUserEmail', email);
                    sessionStorage.setItem('currentUserName', existingUser.name);
                    sessionStorage.setItem('currentUserRole', existingUser.role);
                    checkAuth();
                } else {
                    alert("Користувача не знайдено! Перевірте дані або зареєструйтеся.");
                }
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
        userEmailDisplay.innerHTML = `Ви увійшли як: &nbsp; ${name} <b>(${role})</b>`;
        
        logoutBtn.innerText = role === 'guest' ? 'Увійти' : 'Вийти';

        const isAdmin = role === 'admin';
        const isGuest = role === 'guest';

        // Керування відображенням
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? 'block' : 'none');
        document.querySelectorAll('.action-column').forEach(el => el.style.display = isAdmin ? 'table-cell' : 'none');
        document.querySelectorAll('.hide-for-guest').forEach(el => el.style.display = isGuest ? 'none' : 'block');

        // Завантажуємо дані з бекенду
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

// Отримати весь список ПЗ (GET /api/software)
async function fetchItems() {
    try {
        let url = new URL(API_URL_SOFTWARE);
        if (state.license) url.searchParams.append('license', state.license);
        
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            state.items = data.items || [];
            renderItems();
        }
    } catch (error) { console.error(error); }
}

// Створення нового запису ПЗ (POST /api/software)
async function addItem(formData) {
    try {
        const response = await fetch(API_URL_SOFTWARE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (response.ok) fetchItems(); 
        else alert("Помилка валідації ПЗ!");
    } catch (error) { console.error(error); }
}

// Оновлення існуючого запису ПЗ (PUT /api/software/:id)
async function saveEditItem(formData) {
    try {
        const response = await fetch(`${API_URL_SOFTWARE}/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            resetSoftwareForm();
            fetchItems();
        } else alert("Помилка оновлення ПЗ!");
    } catch (error) { console.error(error); }
}

// Видалення запису ПЗ (DELETE /api/software/:id)
async function deleteItem(id) {
    try {
        const response = await fetch(`${API_URL_SOFTWARE}/${id}`, { method: 'DELETE' });
        if (response.ok) fetchItems();
    } catch (error) { console.error(error); }
}

// Відображення списку ПЗ у HTML-таблиці
function renderItems() {
    tableBody.innerHTML = "";
    const isAdmin = sessionStorage.getItem('currentUserRole') === 'admin';
    
    let filtered = state.items;
    if (state.search) filtered = filtered.filter(item => item.name.toLowerCase().includes(state.search.toLowerCase()));
    
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
            <td>${item.seats}</td>
            <td>${item.comment || ''}</td>
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
    document.getElementById("submitBtn").style.display = "inline-block";
    document.getElementById("saveBtn").style.display = "none";
}

// Обробники подій для ПЗ 
tableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) deleteItem(e.target.getAttribute('data-id'));
    if (e.target.classList.contains('edit-btn')) startEdit(e.target.getAttribute('data-id'));
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = {
        name: document.getElementById("nameInput").value.trim(),
        version: document.getElementById("versionInput").value.trim(),
        license: document.getElementById("licenseSelect").value,
        seats: Number(document.getElementById("seatsInput").value),
        comment: document.getElementById("commentInput").value.trim()
    };
    
    if (editId) saveEditItem(formData);
    else addItem(formData);
    
    if (!editId) resetSoftwareForm();
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
            state.users = await response.json();
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