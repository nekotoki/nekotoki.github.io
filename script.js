let currentYear;
let currentMonth;

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    loadTasks();
    renderCalendar();
});

// 月を変更する
function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(); // カレンダーを再描画
}

// カレンダーの描画
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
                taskItem.classList.add('task-list-item');
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
