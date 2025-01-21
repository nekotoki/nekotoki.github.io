let currentYear;
let currentMonth;

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    loadTasks();
    renderCalendar();
    renderDeletedTasks(); // 初回に削除リストを表示

    // 定期的に自動削除をチェック
    setInterval(checkForAutoDelete, 60000);  // 1時間ごとにチェック
});

function showPage(page) {
    document.getElementById('tasksPage').style.display = page === 'tasks' ? 'block' : 'none';
    document.getElementById('calendarPage').style.display = page === 'calendar' ? 'block' : 'none';
    document.getElementById('deletedPage').style.display = page === 'deleted' ? 'block' : 'none'; // 削除リストタブの表示

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

        if (task.completed) {
            listItem.classList.add('completed'); // 完了したタスクにクラスを追加
        }

        // タスクの残り時間に応じて色を変更
        if (timeLeft === "残り1日") {
            listItem.classList.add('danger'); // 残り1日なら赤
        } else if (timeLeft === "残り2日") {
            listItem.classList.add('warning'); // 残り2日なら黄色
        } else if (timeLeft === "残り3日") {
            listItem.classList.add('warning'); // 残り3日なら黄色
        }

        if (timeLeft === "期限切れ") {
            expiredTaskList.appendChild(listItem);
        } else {
            activeTaskList.appendChild(listItem);
        }
    });

    renderCalendar(sortedTasks); // カレンダーを再描画
}


function createTaskElement(task) {
    const listItem = document.createElement('li');
    listItem.classList.add('task-item');

    const taskText = document.createElement('span');
    taskText.textContent = task.text;

    const dueDate = document.createElement('span');
    dueDate.textContent = `締切: ${task.dueDate}`;

    // 編集ボタン
    const editButton = document.createElement('button');
    editButton.textContent = "編集";
    editButton.classList.add("editBTN");
    editButton.onclick = function() {
        showEditForm(task); // 編集フォームを表示
    };

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = task.completed || false; 
    checkBox.onclick = function() {
        toggleTaskCompletion(task); 
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "削除";
    deleteButton.classList.add("delBTN");
    deleteButton.onclick = function() {
        deleteTask(task);
    };

    listItem.appendChild(checkBox);
    listItem.appendChild(taskText);
    listItem.appendChild(dueDate);
    listItem.appendChild(editButton); 
    listItem.appendChild(deleteButton);

    return listItem;
}


function showEditForm(task) {
    // 編集フォームを表示してタスク内容をセット
    const editForm = document.getElementById('editForm');
    const taskTextInput = document.getElementById('editTaskText');
    const dueDateInput = document.getElementById('editDueDate');
    
    taskTextInput.value = task.text;
    dueDateInput.value = task.dueDate;

    editForm.style.display = 'block';
    editForm.onsubmit = function(event) {
        event.preventDefault();
        updateTask(task, taskTextInput.value, dueDateInput.value);
        editForm.style.display = 'none';
    };
}

function updateTask(task, newText, newDueDate) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.text === task.text && t.dueDate === task.dueDate);

    if (taskIndex > -1) {
        tasks[taskIndex].text = newText;
        tasks[taskIndex].dueDate = newDueDate;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(tasks); // 再描画
    }
}


function toggleTaskCompletion(task) {
    task.completed = !task.completed; // 完了状態を反転させる

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.text === task.text && t.dueDate === task.dueDate);
    if (taskIndex > -1) {
        tasks[taskIndex] = task; // 完了状態を保存
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    renderTasks(tasks); // 再描画して完了状態を反映
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
    tasks.push({ text: taskText, dueDate: dueDate, completed: false });
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
    const isConfirmed = confirm(`${task.text} を削除しますか？`);

    if (isConfirmed) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(t => t.text !== task.text || t.dueDate !== task.dueDate);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // 削除されたタスクを別のリストに保存（削除日時を追加）
        let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
        const deletedTaskWithDate = { 
            ...task, 
            deletedAt: new Date().toISOString()  // 削除日時を追加
        };
        deletedTasks.push(deletedTaskWithDate);
        localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));

        renderTasks(tasks); // 再描画
        renderDeletedTasks(); // 削除リストを再描画
    }
}

function renderDeletedTasks() {
    const deletedTaskList = document.getElementById('deletedTaskList');
    deletedTaskList.innerHTML = ""; // 既存のリストをクリア

    const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

    // 一括削除ボタンを追加
    
    const bulkDeleteButton = document.createElement('button');
    bulkDeleteButton.textContent = "一括削除";
    bulkDeleteButton.classList.add("ikkatuBTN");
    bulkDeleteButton.onclick = function() {
        if (confirm("削除リストのすべての課題を完全に削除しますか？")) {
            permanentlyDeleteAllTasks();
        }
    };
    deletedTaskList.appendChild(bulkDeleteButton);

    deletedTasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');

        const taskText = document.createElement('span');
        taskText.textContent = task.text;

        const deletedAt = new Date(task.deletedAt);
        const timeLeft = getRemainingTimeForDeletion(deletedAt); // 残り時間を取得

        const remainingTime = document.createElement('span');
        remainingTime.textContent = `自動削除まで: ${timeLeft}`;

        const restoreButton = document.createElement('button');
        restoreButton.textContent = "復元";
        restoreButton.classList.add("hukugenBTN");
        restoreButton.onclick = function() {
            if (confirm("この課題を復元しますか？")) {
                restoreTask(index);
            }
        };

        const permanentDeleteButton = document.createElement('button');
        permanentDeleteButton.textContent = "完全削除";
        permanentDeleteButton.classList.add("kieroBTN");
        permanentDeleteButton.onclick = function() {
            if (confirm("この課題を完全に削除しますか？")) {
                permanentlyDeleteTask(index);
            }
        };

        listItem.appendChild(taskText);
        listItem.appendChild(remainingTime);
        listItem.appendChild(restoreButton);
        listItem.appendChild(permanentDeleteButton);
        deletedTaskList.appendChild(listItem);
    });
}

// 削除までの残り時間を計算
function getRemainingTimeForDeletion(deletedAt) {
    const now = new Date();
    const timeDiff = now - deletedAt;
    const threeDays = 3 * 24 * 60 * 60 * 1000; // 3日間

    if (timeDiff >= threeDays) {
        return "削除済み";
    }

    const remainingTime = threeDays - timeDiff;
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}日 ${hours}時間 ${minutes}分`;
}


// 一括削除処理
function permanentlyDeleteAllTasks() {
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

    // すべての削除されたタスクを削除
    deletedTasks = [];
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));

    renderDeletedTasks(); // 削除リストを再描画
}

function restoreTask(index) {
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const taskToRestore = deletedTasks.splice(index, 1)[0];

    tasks.push(taskToRestore);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));

    renderTasks(tasks); // 再描画
    renderDeletedTasks(); // 削除リストを再描画
}

function permanentlyDeleteTask(index) {
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

    deletedTasks.splice(index, 1);
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));

    renderDeletedTasks(); // 削除リストを再描画
}

function getRemainingTime(dueDate) {
    const now = new Date();
    const deadline = new Date(dueDate);
    deadline.setHours(23, 59, 59, 999); // 時間を23:59:59.999に設定

    const timeDiff = deadline - now;

    if (timeDiff < 0) {
        return "期限切れ";
    }

    const days = Math.floor((timeDiff) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    // 色分けのために残り時間を返す
    if (days === 0) {
        return "残り1日";
    } else if (days === 1) {
        return "残り2日";
    } else if (days === 2) {
        return "残り3日";
    }

    return `${days}日 ${hours}時間 ${minutes}分`;
}


// カレンダー
function renderCalendar() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
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

    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        cell.textContent = day;

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const tasksForDate = tasks.filter(task => task.dueDate === dateStr);

        // 今日の日付と一致する場合にスタイルを適用
        if (todayYear === currentYear && todayMonth === currentMonth && day === todayDate) {
            cell.classList.add('today'); // 今日の日付に 'today' クラスを追加
        }

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

    while (row.children.length < 7) {
        row.appendChild(document.createElement('td'));
    }
    table.appendChild(row);
    calendarContainer.appendChild(table);
}

// 月を変更する関数
function changeMonth(direction) {
    currentMonth += direction; // -1なら前月、1なら次月

    // 月が0未満（1月より前）または12以上（12月より後）にならないように調整
    if (currentMonth < 0) {
        currentMonth = 11;  // 12月
        currentYear--;      // 年を1つ減らす
    } else if (currentMonth > 11) {
        currentMonth = 0;   // 1月
        currentYear++;      // 年を1つ増やす
    }

    renderCalendar(); // カレンダーを再描画
}

function checkForAutoDelete() {
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
    const now = new Date();

    // 期限が過ぎたタスクを削除
    deletedTasks = deletedTasks.filter(task => {
        const deletedAt = new Date(task.deletedAt);
        const timeDiff = now - deletedAt;
        const threeDays = 3 * 24 * 60 * 60 * 1000; // 3日間

        if (timeDiff >= threeDays) {
            return false; // 3日以上経過したタスクは削除
        }
        return true;
    });

    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
    renderDeletedTasks(); // 再描画
}

document.addEventListener('DOMContentLoaded', () => {
    const background = document.getElementById('background');
    const maxSquares = 100; // 最大四角形数
    let squares = []; // 四角形の配列

    // 0.5秒ごとに新しい四角形を追加
    setInterval(() => {
        if (squares.length < maxSquares) {
            createSquare(); // 四角形を追加
        }
    }, 500);

    function createSquare() {
        const square = document.createElement('div');
        square.classList.add('square');

        // ランダムな位置とサイズを設定
        const size = Math.random() * 30 + 20; // 20px〜50px
        const left = Math.random() * 100; // 横位置（0〜100%）
        const animationDelay = Math.random() * 5; // アニメーションの遅延

        // ランダムな回転角度を生成（1000〜10000度）
        const rotation = Math.random() * (10000 - 1000) + 1000;

        square.style.width = `${size}px`;
        square.style.height = `${size}px`;
        square.style.left = `${left}%`;
        square.style.animationDelay = `-${animationDelay}s`;
        square.style.transform = `rotate(${rotation}deg)`; // ランダム回転角度を適用

        background.appendChild(square);

        // 配列に追加
        squares.push(square);

        // アニメーションが終わったら四角形を削除
        square.addEventListener('animationend', () => {
            background.removeChild(square);
            // 配列から削除
            squares = squares.filter(s => s !== square);
        });
    }
});



