const state = {
    items: [],
    search: '',
    license: '',
};

const form = document.getElementById("createForm");
const tableBody = document.getElementById("itemsTableBody");

//Завантаження зі сховища
function loadFromStorage() {
    const data = localStorage.getItem('softwareItems');
    if (data) {
        try {
            state.items = JSON.parse(data);
        } catch (e) {
            state.items = [];
        }
    }
}

function saveToStorage() {
    localStorage.setItem('softwareItems', JSON.stringify(state.items));
}

//Рендер таблиці
function render() {
    tableBody.innerHTML = "";
    let filtered = state.items;
    
    if (state.search) {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(state.search.toLowerCase()));
    }
    if (state.license) {
        filtered = filtered.filter(item => item.license === state.license);
    }
    
    filtered.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.version}</td>
            <td>${item.license}</td>
            <td>${item.seats}</td>
            <td>${item.comment}</td>
            <td>
                <button type="button" class="edit-btn" data-id="${item.id}">Редагувати</button>
                <button type="button" class="delete-btn" data-id="${item.id}">Видалити</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

//Обробник кліків по таблиці
tableBody.addEventListener('click', function(e) {
    const target = e.target;
    if (target.classList.contains('delete-btn')) {
        const id = target.getAttribute('data-id');
        state.items = state.items.filter(item => item.id !== id);
        saveToStorage();
        render();
    }
    if (target.classList.contains('edit-btn')) {
        const id = target.getAttribute('data-id');
        startEdit(id);
    }
});

//Пошук та фільтри
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        state.search = e.target.value;
        render();
    });
}

const licenseFilter = document.getElementById('licenseFilter');
if (licenseFilter) {
    licenseFilter.addEventListener('change', (e) => {
        state.license = e.target.value;
        render();
    });
}

//Логіка редагування
let editId = null;

function startEdit(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    editId = id;
    document.getElementById("nameInput").value = item.name;
    document.getElementById("versionInput").value = item.version;
    document.getElementById("licenseSelect").value = item.license;
    document.getElementById("seatsInput").value = item.seats;
    document.getElementById("commentInput").value = item.comment;
    document.getElementById("saveBtn").style.display = "inline-block";
    document.querySelector("button[type='submit']").style.display = "none";
}

function saveEdit() {
    if (!editId) return;
    const formData = readForm();
    if (!validate(formData)) return;
    
    const idx = state.items.findIndex(i => i.id === editId);
    if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...formData };
        saveToStorage();
    }
    
    editId = null;
    form.reset();
    clearErrors();
    document.getElementById("saveBtn").style.display = "none";
    document.querySelector("button[type='submit']").style.display = "inline-block";
    render();
}

//Валідація та читання форми
function clearErrors() {
    document.querySelectorAll(".error-text").forEach(el => el.innerHTML = "");
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
}

function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    input.classList.add("invalid");
    document.getElementById(errorId).innerHTML = message;
}

function readForm() {
    return {
        name: document.getElementById("nameInput").value.trim(),
        version: document.getElementById("versionInput").value.trim(),
        license: document.getElementById("licenseSelect").value,
        seats: document.getElementById("seatsInput").value,
        comment: document.getElementById("commentInput").value.trim(),
    };
}

function validate(formData) {
    let isValid = true;
    clearErrors();
    if (formData.name === "") {
        showError("nameInput", "nameError", "Введіть назву ПЗ");
        isValid = false;
    }
    if (formData.version === "") {
        showError("versionInput", "versionError", "Введіть версію");
        isValid = false;
    }
    if (formData.license === "") {
        showError("licenseSelect", "licenseError", "Оберіть тип ліцензії");
        isValid = false;
    }
    if (formData.seats === "" || Number(formData.seats) < 1) {
        showError("seatsInput", "seatsError", "Введіть число від 1");
        isValid = false;
    }
    return isValid;
}

function addItem(formData) {
    const newItem = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        ...formData
    };
    state.items.push(newItem);
    saveToStorage();
    render();
}

//Обробники кнопок форми
form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (editId) {
        saveEdit();
        return;
    }
    const formData = readForm();
    if (!validate(formData)) return;
    
    addItem(formData);
    form.reset();
    clearErrors();
});

let saveBtn = document.getElementById("saveBtn");
if (!saveBtn) {
    saveBtn = document.createElement("button");
    saveBtn.id = "saveBtn";
    saveBtn.type = "button";
    saveBtn.textContent = "Зберегти";
    saveBtn.style.display = "none";
    form.querySelector(".buttons").appendChild(saveBtn);
}
saveBtn.onclick = saveEdit;

document.getElementById("resetBtn").addEventListener("click", () => {
    form.reset();
    clearErrors();
    if (editId) {
        editId = null;
        document.getElementById("saveBtn").style.display = "none";
        document.querySelector("button[type='submit']").style.display = "inline-block";
    }
});

//Стартовий запуск програми
loadFromStorage();
render();