const { createApp, ref, reactive, computed, onMounted } = Vue;

createApp({
    setup() {
        // Основний стан застосунку
        const items = ref([]);
        const filters = reactive({ search: '', license: '' });
        const form = reactive({
            id: null,
            name: '',
            version: '',
            license: '',
            seats: 1,
            comment: ''
        });
        const errors = reactive({ name: '', version: '', license: '', seats: '', comment: '' });
        const isEditing = ref(false);

        // Завантаження даних із localStorage при старті
        function loadFromStorage() {
            const data = localStorage.getItem('softwareItemsVue');
            if (data) {
                try {
                    items.value = JSON.parse(data);
                } catch (e) {
                    items.value = [];
                }
            }
        }

        // Збереження даних у localStorage
        function saveToStorage() {
            localStorage.setItem('softwareItemsVue', JSON.stringify(items.value));
        }

        // Відфільтровані елементи для таблиці
        const filteredItems = computed(() => {
            return items.value.filter(item => {
                const searchMatch = filters.search.trim() === '' || item.name.toLowerCase().includes(filters.search.toLowerCase());
                const licenseMatch = filters.license === '' || item.license === filters.license;
                return searchMatch && licenseMatch;
            });
        });

        // Очищення повідомлень про помилки
        function clearErrors() {
            errors.name = '';
            errors.version = '';
            errors.license = '';
            errors.seats = '';
            errors.comment = '';
        }

        // Перевірка форми перед збереженням
        function validateForm() {
            clearErrors();
            let valid = true;

            if (!form.name.trim()) {
                errors.name = 'Введіть назву ПЗ';
                valid = false;
            }
            if (!form.version.trim()) {
                errors.version = 'Введіть версію';
                valid = false;
            }
            if (!form.license) {
                errors.license = 'Оберіть тип ліцензії';
                valid = false;
            }
            if (!form.seats || Number(form.seats) < 1) {
                errors.seats = 'Введіть число від 1';
                valid = false;
            }

            return valid;
        }

        // Скидання полів форми до початкового стану
        function resetForm() {
            form.id = null;
            form.name = '';
            form.version = '';
            form.license = '';
            form.seats = 1;
            form.comment = '';
            isEditing.value = false;
            clearErrors();
        }

        // Обробник надсилання форми: додавання або редагування
        function submitForm() {
            if (!validateForm()) {
                return;
            }

            const payload = {
                id: form.id || Date.now().toString() + Math.random().toString(16).slice(2),
                name: form.name.trim(),
                version: form.version.trim(),
                license: form.license,
                seats: Number(form.seats),
                comment: form.comment.trim()
            };

            if (isEditing.value) {
                const index = items.value.findIndex(item => item.id === payload.id);
                if (index !== -1) {
                    items.value[index] = payload;
                }
            } else {
                items.value.push(payload);
            }

            saveToStorage();
            resetForm();
        }

        // Видалення елемента з реєстру
        function deleteItem(id) {
            items.value = items.value.filter(item => item.id !== id);
            saveToStorage();
        }

        // Початок редагування елемента
        function editItem(id) {
            const item = items.value.find(i => i.id === id);
            if (!item) return;

            form.id = item.id;
            form.name = item.name;
            form.version = item.version;
            form.license = item.license;
            form.seats = item.seats;
            form.comment = item.comment;
            isEditing.value = true;
        }

        // Завантаження даних з localStorage при монтуванні компонента
        onMounted(loadFromStorage);

        return {
            items,
            filters,
            form,
            errors,
            filteredItems,
            submitForm,
            resetForm,
            deleteItem,
            editItem,
            isEditing
        };
    }
}).mount('#app');
