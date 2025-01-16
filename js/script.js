document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('add-task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskCategorySelect = document.getElementById('task-category');

    const categories = {
        Werk: document.getElementById('category-werk'),
        Persoonlijk: document.getElementById('category-persoonlijk'),
        'Vrije tijd': document.getElementById('category-vrijetijd')
    };

    function checkEmptyCategories() {
        Object.keys(categories).forEach(categoryName => {
            const category = categories[categoryName].querySelector('.task-list');
            const emptyMessage = category.querySelector('.empty-message');

            const hasTasks = Array.from(category.children).some(child => !child.classList.contains('empty-message'));

            if (!hasTasks) {
                if (!emptyMessage) {
                    const message = document.createElement('li');
                    message.textContent = `Geen taken in ${categoryName}`;
                    message.classList.add('empty-message');
                    category.appendChild(message);
                }
            } else if (emptyMessage) {
                category.removeChild(emptyMessage);
            }
        });
    }


    function initializeDragAndDrop() {
        Object.values(categories).forEach(category => {
            category.addEventListener('dragover', (e) => {
                e.preventDefault();
                category.style.backgroundColor = '#e1e1e1';
            });

            category.addEventListener('dragleave', () => {
                category.style.backgroundColor = '';
            });

            category.addEventListener('drop', (e) => {
                e.preventDefault();
                category.style.backgroundColor = '';

                const taskId = e.dataTransfer.getData('text/plain');
                const draggedTask = document.getElementById(taskId);
                const taskList = category.querySelector('.task-list');
                const newCategory = category.querySelector('h3').textContent;


                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const updatedTasks = tasks.map(task => {
                    if (task.name === draggedTask.dataset.name) {
                        task.category = newCategory;
                    }
                    return task;
                });
                localStorage.setItem('tasks', JSON.stringify(updatedTasks));


                taskList.appendChild(draggedTask);
                checkEmptyCategories();
            });
        });
    }

    // Taken laden uit LocalStorage
    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(task => renderTask(task));
    }

    // Taak renderen
    function renderTask(task) {
        const listItem = document.createElement('li');
        listItem.setAttribute('draggable', 'true');
        listItem.setAttribute('id', `task-${Date.now()}`);
        listItem.dataset.name = task.name;

        listItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', listItem.id);
            listItem.style.opacity = '0.5';
        });

        listItem.addEventListener('dragend', () => {
            listItem.style.opacity = '';
        });

        // Task name container
        const taskName = document.createElement('span');
        taskName.textContent = task.name;
        taskName.style.flexGrow = '1';

        // Verwijderknop
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Verwijder';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            deleteTask(task, listItem);
            checkEmptyCategories();
        });

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Voltooid';
        completeButton.classList.add('complete-btn');
        completeButton.addEventListener('click', () => completeTask(listItem));


        listItem.appendChild(taskName);
        listItem.appendChild(completeButton);
        listItem.appendChild(deleteButton);

        categories[task.category].querySelector('.task-list').appendChild(listItem);
        checkEmptyCategories();
    }

    // Taak toevoegen
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskName = taskNameInput.value;
        const taskCategory = taskCategorySelect.value;

        const newTask = {
            name: taskName,
            category: taskCategory
        };

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        renderTask(newTask);

        taskNameInput.value = '';
        taskCategorySelect.value = 'Werk';
    });

    // Taak voltooien of onvoltooien
    function completeTask(taskElement) {
        const isCompleted = taskElement.style.textDecoration === 'line-through';

        if (isCompleted) {
            taskElement.style.textDecoration = '';
            taskElement.style.color = '';
        } else {
            taskElement.style.textDecoration = 'line-through';
            taskElement.style.color = 'gray';
        }
    }

    // Taak verwijderen
    function deleteTask(task, taskElement) {
        taskElement.remove();

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const filteredTasks = tasks.filter(t => t.name !== task.name);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    }

    loadTasks();
    checkEmptyCategories();
    initializeDragAndDrop();
});
