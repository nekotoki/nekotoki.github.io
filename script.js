let currentYear;
let currentMonth;

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    loadTasks();
    renderCalendar();
});

function showPage(page) {
    document.getElementById('tasksPage').style.display = page === 'tasks' ? 'block' : 'none';
    document.getElementById('calendarPage').style.display = page === 'calendar' ? 'block' : 'none';

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab[onclick="showPage('${page}')"]`).classList.add('active');
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks(tasks);
}

function renderTasks(tasks) {
    const activeTaskList = document.getElementById('activeTaskList');
    const expiredTaskList = document.getElementById('expiredTaskList');
    activeTaskList.innerHTML = ""; // クリア
    expiredTaskList.innerHTML = ""; // クリア

    const sortedTasks = tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    sortedTasks.forEach(task => {
        const timeLeft = getRemainingTime(task.dueDate);
        const listItem = createTaskElement(task, timeLeft);
        
        if (timeLeft === "期限切れ") {
            expiredTaskList.appendChild(listItem);
        } else {
            activeTaskList.appendChild(listItem);
        }
    });

    renderCalendar(sortedTasks); // カレンダーを再描画
}

function createTaskElement(task, timeLeft) {
    const listItem = document.createElement('li');
    listItem.classList.add('task-item');

    const taskText = document.createElement('span');
    taskText.textContent = task.text;

    const dueDate = document.createElement('span');
    dueDate.textContent = `締切: ${task.dueDate}`;

    const remainingTime = document.createElement('span');
    remainingTime.textContent = `残り時間: ${timeLeft}`;

    // スタイルの適用
    const daysLeft = Math.floor((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (timeLeft !== "期限切れ") {
        if (daysLeft <= -1) {
            listItem.classList.add('danger');
        } else if (daysLeft <= 1) {
            listItem.classList.add('warning');
        }
    } else {
        listItem.classList.add('expired');
    }

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "削除";
    deleteButton.onclick = function() {
        deleteTask(task);
    };

    listItem.appendChild(taskText);
    listItem.appendChild(dueDate);
    listItem.appendChild(remainingTime);
    listItem.appendChild(deleteButton);
    return listItem;
}

function addTask() {
    const taskSelect = document.getElementById('taskSelect');
    const otherTaskInput = document.getElementById('otherTaskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskText = taskSelect.value === "その他" ? otherTaskInput.value : taskSelect.value;
    const dueDate = dueDateInput.value;

    if (taskText === "" || dueDate === "") {
        alert("課題と締切日を入力してください。");
        return;
    }

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text: taskText, dueDate: dueDate });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(tasks); // 再描画
    taskSelect.value = ""; // 選択をリセット
    otherTaskInput.value = ""; // 入力欄をクリア
    otherTaskInput.style.display = "none"; // 入力欄を隠す
    dueDateInput.value = ""; // 日付欄をクリア
}

function toggleOtherInput() {
    const taskSelect = document.getElementById('taskSelect');
    const otherTaskInput = document.getElementById('otherTaskInput');
    if (taskSelect.value === "その他") {
        otherTaskInput.style.display = "block";
    } else {
        otherTaskInput.style.display = "none";
    }
}

function deleteTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(t => t.text !== task.text || t.dueDate !== task.dueDate);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(tasks); // 再描画
}

function getRemainingTime(dueDate) {
    const now = new Date();
    // 締切日を23:59に設定
    const deadline = new Date(dueDate);
    deadline.setHours(23, 59, 59, 999); // 時間を23:59:59.999に設定

    const timeDiff = deadline - now;

    if (timeDiff < 0) {
        return "期限切れ";
    }

    const days = Math.floor((timeDiff) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}日 ${hours}時間 ${minutes}分`;
}

// カレンダー
function renderCalendar(tasks = []) {
    const calendarContainer = document.getElementById('calendar');
    calendarContainer.innerHTML = ""; // クリア

    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    const currentMonthHeader = document.getElementById('currentMonth');
    currentMonthHeader.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    let row = document.createElement('tr');
    for (let i = 0; i < firstDayOfWeek; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        cell.textContent = day;

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const tasksForDate = tasks.filter(task => task.dueDate === dateStr);
        if (tasksForDate.length > 0) {
            const taskList = document.createElement('ul');
            taskList.style.padding = '0'; // パディングをリセット
            tasksForDate.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.classList.add('task-list-item'); // 赤い文字を適用
                taskItem.textContent = task.text;
                taskList.appendChild(taskItem);
            });
            cell.appendChild(taskList);
        }

        row.appendChild(cell);
        if ((day + firstDayOfWeek) % 7 === 0) {
            table.appendChild(row);
            row = document.createElement('tr');
        }
    }

    while (row.children.length < 7) {
        row.appendChild(document.createElement('td'));
    }
    table.appendChild(row);
    calendarContainer.appendChild(table);
}
