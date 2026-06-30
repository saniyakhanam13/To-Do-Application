/* -------------------------------------------------------------
 * VortexTodo - JavaScript Application Logic
 * Implements CRUD, localStorage persistence, advanced filters,
 * multi-criteria sorting, search, stats computations, theme toggling,
 * sound effects, and CSS animation handlers.
 * ------------------------------------------------------------- */

// --- Application State ---
let state = {
  tasks: [],
  filter: 'all',          // 'all' | 'active' | 'completed'
  sortBy: 'createdAt-desc', // 'createdAt-desc' | 'createdAt-asc' | 'dueDate-asc' | 'priority-desc'
  searchQuery: '',
  theme: 'dark'
};

// --- Seed Data (Displayed on first launch) ---
const seedTasks = [
  {
    id: 'seed-task-1',
    title: '🚀 Welcome to VortexTodo!',
    description: 'Explore the interface, try light/dark mode, and play around with task options.',
    category: 'Personal',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: false,
    createdAt: Date.now() - 3600000 * 2 // 2 hours ago
  },
  {
    id: 'seed-task-2',
    title: '💼 Weekly sync with team',
    description: 'Prepare project updates and review milestone achievements.',
    category: 'Work',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    completed: false,
    createdAt: Date.now() - 3600000 * 5 // 5 hours ago
  },
  {
    id: 'seed-task-3',
    title: '🛒 Get groceries',
    description: 'Buy organic milk, eggs, whole grain bread, and avocados.',
    category: 'Shopping',
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (Overdue)
    completed: true,
    createdAt: Date.now() - 86400000 // 1 day ago
  }
];

// --- Priority Weights (For Sorting) ---
const priorityWeights = {
  high: 3,
  medium: 2,
  low: 1
};

// --- DOM Element Selectors ---
const DOM = {
  todoForm: document.getElementById('todo-form'),
  taskTitleInput: document.getElementById('task-title-input'),
  taskDescInput: document.getElementById('task-desc-input'),
  taskCategorySelect: document.getElementById('task-category-select'),
  taskPrioritySelect: document.getElementById('task-priority-select'),
  taskDateInput: document.getElementById('task-date-input'),
  
  todoList: document.getElementById('todo-list'),
  emptyState: document.getElementById('empty-state'),
  emptyStateDetail: document.getElementById('empty-state-detail'),
  
  // Dashboard
  statRadialProgress: document.getElementById('stat-radial-progress'),
  statProgressPercent: document.getElementById('stat-progress-percent'),
  statProgressText: document.getElementById('stat-progress-text'),
  statTotalTasks: document.getElementById('stat-total-tasks'),
  statPendingTasks: document.getElementById('stat-pending-tasks'),
  statCompletedTasks: document.getElementById('stat-completed-tasks'),
  currentDateString: document.getElementById('current-date-string'),
  
  // Controls
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  filterTabs: document.querySelectorAll('.filter-tab'),
  sortSelect: document.getElementById('sort-select'),
  clearCompletedBtn: document.getElementById('clear-completed-btn'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  
  // Modal
  editTaskModal: document.getElementById('edit-task-modal'),
  editTodoForm: document.getElementById('edit-todo-form'),
  editTaskId: document.getElementById('edit-task-id'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editTaskCategorySelect: document.getElementById('edit-task-category-select'),
  editTaskPrioritySelect: document.getElementById('edit-task-priority-select'),
  editTaskDateInput: document.getElementById('edit-task-date-input'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  
  // Feedback Systems
  toastContainer: document.getElementById('toast-container'),
  soundComplete: document.getElementById('sound-complete'),
  soundDelete: document.getElementById('sound-delete')
};

// --- Initialization ---
function init() {
  setupDateHeader();
  loadStateFromLocalStorage();
  registerEventListeners();
  render();
}

// --- Date Header Setup ---
function setupDateHeader() {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const today = new Date();
  DOM.currentDateString.textContent = today.toLocaleDateString('en-US', options);
}

// --- Local Storage Management ---
function loadStateFromLocalStorage() {
  // Load tasks
  const savedTasks = localStorage.getItem('vortextodo-tasks');
  if (savedTasks) {
    try {
      state.tasks = JSON.parse(savedTasks);
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      state.tasks = [...seedTasks];
    }
  } else {
    // Seed database on first usage
    state.tasks = [...seedTasks];
    saveTasksToStorage();
  }

  // Load theme
  const savedTheme = localStorage.getItem('vortextodo-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', state.theme);
}

function saveTasksToStorage() {
  localStorage.setItem('vortextodo-tasks', JSON.stringify(state.tasks));
}

function saveThemeToStorage() {
  localStorage.setItem('vortextodo-theme', state.theme);
}

// --- Event Binding ---
function registerEventListeners() {
  // Form submits (Create and Update)
  DOM.todoForm.addEventListener('submit', handleCreateTask);
  DOM.editTodoForm.addEventListener('submit', handleUpdateTask);
  
  // Delegated Task Actions (Complete, Edit, Delete)
  DOM.todoList.addEventListener('click', handleTaskActionClick);
  DOM.todoList.addEventListener('change', handleTaskCheckboxChange);
  
  // Filter tabs
  DOM.filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      DOM.filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      e.target.classList.add('active');
      e.target.setAttribute('aria-selected', 'true');
      state.filter = e.target.dataset.filter;
      render();
    });
  });

  // Sorting
  DOM.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    render();
  });

  // Search input
  DOM.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    if (state.searchQuery) {
      DOM.clearSearchBtn.style.display = 'flex';
    } else {
      DOM.clearSearchBtn.style.display = 'none';
    }
    render();
  });

  // Clear Search
  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.searchQuery = '';
    DOM.clearSearchBtn.style.display = 'none';
    render();
  });

  // Clear Completed Tasks
  DOM.clearCompletedBtn.addEventListener('click', handleClearCompleted);

  // Theme Toggler
  DOM.themeToggleBtn.addEventListener('click', handleToggleTheme);

  // Modal close handlers
  DOM.closeModalBtn.addEventListener('click', hideEditModal);
  DOM.cancelEditBtn.addEventListener('click', hideEditModal);
  
  // Close modal on click outside content
  DOM.editTaskModal.addEventListener('click', (e) => {
    if (e.target === DOM.editTaskModal) hideEditModal();
  });

  // Close modal on Escape key press
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.editTaskModal.classList.contains('active')) {
      hideEditModal();
    }
  });
}

// --- CRUD Core Logic ---

// 1. CREATE Task
function handleCreateTask(e) {
  e.preventDefault();
  
  const title = DOM.taskTitleInput.value.trim();
  const description = DOM.taskDescInput.value.trim();
  const category = DOM.taskCategorySelect.value;
  const priority = DOM.taskPrioritySelect.value;
  const dueDate = DOM.taskDateInput.value; // yyyy-mm-dd or empty string
  
  if (!title) return;

  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    title,
    description,
    category,
    priority,
    dueDate,
    completed: false,
    createdAt: Date.now()
  };

  state.tasks.push(newTask);
  saveTasksToStorage();
  
  // UI Reset
  DOM.todoForm.reset();
  
  // Re-render & Toast
  render();
  showToast('Task added successfully!', 'success');
}

// 2. READ (Handled by render loop)

// 3. UPDATE (Completion / Modals)
function handleTaskCheckboxChange(e) {
  if (!e.target.classList.contains('todo-checkbox')) return;
  
  const taskId = e.target.dataset.id;
  const task = state.tasks.find(t => t.id === taskId);
  
  if (task) {
    task.completed = e.target.checked;
    saveTasksToStorage();
    
    // Play completion sound effect (only if checking complete)
    if (task.completed) {
      playSound(DOM.soundComplete);
      showToast(`Task "${truncateText(task.title, 25)}" completed! 🎉`, 'success');
    }
    
    // Render
    render();
  }
}

function handleTaskActionClick(e) {
  // Find closest button or link with action
  const editBtn = e.target.closest('.edit-btn');
  const deleteBtn = e.target.closest('.delete-btn');
  
  if (editBtn) {
    const taskId = editBtn.dataset.id;
    showEditModal(taskId);
  } else if (deleteBtn) {
    const taskId = deleteBtn.dataset.id;
    handleDeleteTask(taskId);
  }
}

// Open Edit Dialog Modal
function showEditModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  DOM.editTaskId.value = task.id;
  DOM.editTaskTitleInput.value = task.title;
  DOM.editTaskDescInput.value = task.description || '';
  DOM.editTaskCategorySelect.value = task.category;
  DOM.editTaskPrioritySelect.value = task.priority;
  DOM.editTaskDateInput.value = task.dueDate || '';
  
  DOM.editTaskModal.classList.add('active');
  DOM.editTaskModal.setAttribute('aria-hidden', 'false');
  DOM.editTaskTitleInput.focus();
}

function hideEditModal() {
  DOM.editTaskModal.classList.remove('active');
  DOM.editTaskModal.setAttribute('aria-hidden', 'true');
  DOM.editTodoForm.reset();
}

// Update task values from Modal Submit
function handleUpdateTask(e) {
  e.preventDefault();
  
  const taskId = DOM.editTaskId.value;
  const title = DOM.editTaskTitleInput.value.trim();
  const description = DOM.editTaskDescInput.value.trim();
  const category = DOM.editTaskCategorySelect.value;
  const priority = DOM.editTaskPrioritySelect.value;
  const dueDate = DOM.editTaskDateInput.value;

  const taskIndex = state.tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1 && title) {
    state.tasks[taskIndex] = {
      ...state.tasks[taskIndex],
      title,
      description,
      category,
      priority,
      dueDate
    };
    
    saveTasksToStorage();
    hideEditModal();
    render();
    showToast('Task updated successfully!', 'success');
  }
}

// 4. DELETE Task
function handleDeleteTask(taskId) {
  const taskIndex = state.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  
  const taskElement = document.querySelector(`.todo-item[data-id="${taskId}"]`);
  
  // Transition out animation before removing from state
  if (taskElement) {
    taskElement.classList.add('deleted');
    playSound(DOM.soundDelete);
    
    // Wait for the exit animation duration (300ms)
    setTimeout(() => {
      state.tasks.splice(taskIndex, 1);
      saveTasksToStorage();
      render();
      showToast('Task deleted.', 'warning');
    }, 300);
  } else {
    state.tasks.splice(taskIndex, 1);
    saveTasksToStorage();
    render();
  }
}

// Clear Completed Tasks
function handleClearCompleted() {
  const completedCount = state.tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear.', 'warning');
    return;
  }
  
  // Animate elements out
  const completedElements = document.querySelectorAll('.todo-item.completed');
  playSound(DOM.soundDelete);
  
  completedElements.forEach(el => {
    el.classList.add('deleted');
  });

  setTimeout(() => {
    state.tasks = state.tasks.filter(t => !t.completed);
    saveTasksToStorage();
    render();
    showToast(`Cleared ${completedCount} completed task(s).`, 'warning');
  }, 300);
}

// --- Theme Toggler ---
function handleToggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  saveThemeToStorage();
  
  showToast(`${state.theme.charAt(0).toUpperCase() + state.theme.slice(1)} mode enabled!`, 'success');
}

// --- Rendering & Filtering Engine ---
function render() {
  let filtered = [...state.tasks];
  
  // A. Filter by Query Search (Title and description)
  if (state.searchQuery) {
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(state.searchQuery) || 
      (task.description && task.description.toLowerCase().includes(state.searchQuery))
    );
  }

  // B. Filter by Tab (All, Active, Completed)
  if (state.filter === 'active') {
    filtered = filtered.filter(task => !task.completed);
  } else if (state.filter === 'completed') {
    filtered = filtered.filter(task => task.completed);
  }

  // C. Sort
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'createdAt-desc':
        return b.createdAt - a.createdAt;
      case 'createdAt-asc':
        return a.createdAt - b.createdAt;
      case 'dueDate-asc':
        // Sort items with dates first, and empty dates at the end
        if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority-desc':
        const diff = priorityWeights[b.priority] - priorityWeights[a.priority];
        if (diff !== 0) return diff;
        return b.createdAt - a.createdAt; // Default sub-sort by creation newest
      default:
        return 0;
    }
  });

  // D. Dynamic DOM Injection
  DOM.todoList.innerHTML = '';
  
  if (filtered.length === 0) {
    DOM.emptyState.style.display = 'flex';
    DOM.todoList.style.display = 'none';
    
    // Set descriptive message based on state
    if (state.searchQuery) {
      DOM.emptyStateDetail.textContent = `No matches found for "${state.searchQuery}". Try a different keyword.`;
    } else if (state.filter === 'active') {
      DOM.emptyStateDetail.textContent = 'Hooray! No pending tasks left.';
    } else if (state.filter === 'completed') {
      DOM.emptyStateDetail.textContent = 'Complete some tasks to view them here.';
    } else {
      DOM.emptyStateDetail.textContent = 'Create a task to kickstart your day.';
    }
  } else {
    DOM.emptyState.style.display = 'none';
    DOM.todoList.style.display = 'flex';
    
    filtered.forEach(task => {
      const taskItem = createTaskDOMElement(task);
      DOM.todoList.appendChild(taskItem);
    });
  }

  // E. Update Dashboard
  updateDashboardStats();
}

// Create Task LI element
function createTaskDOMElement(task) {
  const li = document.createElement('li');
  li.className = `todo-item ${task.completed ? 'completed' : ''}`;
  li.dataset.id = task.id;

  // Safe HTML content assembly (XSS protected through textContent where needed, or structured safely)
  const categoryIcon = getCategoryIcon(task.category);
  const { dateText, dateClass, isOverdue } = processDueDate(task.dueDate, task.completed);
  
  li.innerHTML = `
    <div class="todo-checkbox-wrapper">
      <input type="checkbox" class="todo-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''} aria-label="Mark task completed">
      <div class="checkbox-visual">
        <i class="fa-solid fa-check"></i>
      </div>
    </div>
    <div class="todo-content">
      <div class="todo-title">${escapeHTML(task.title)}</div>
      ${task.description ? `<div class="todo-desc">${escapeHTML(task.description)}</div>` : ''}
      <div class="todo-meta">
        <span class="badge badge-priority-${task.priority}">
          ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <span class="badge badge-category">
          <i class="${categoryIcon}"></i> ${escapeHTML(task.category)}
        </span>
        ${dateText ? `
          <span class="badge badge-date ${dateClass}">
            <i class="fa-regular ${isOverdue ? 'fa-circle-exclamation' : 'fa-calendar'}"></i> ${dateText}
          </span>
        ` : ''}
      </div>
    </div>
    <div class="todo-actions">
      <button class="action-btn edit-btn" data-id="${task.id}" title="Edit Task" aria-label="Edit Task">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="action-btn delete-btn" data-id="${task.id}" title="Delete Task" aria-label="Delete Task">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `;

  return li;
}

// --- Dashboard Statistics Calculations ---
function updateDashboardStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Numbers UI
  DOM.statTotalTasks.textContent = total;
  DOM.statPendingTasks.textContent = pending;
  DOM.statCompletedTasks.textContent = completed;
  DOM.statProgressPercent.textContent = `${percent}%`;

  // Circular / Radial SVG Animation
  const circumference = 251.2; // 2 * pi * r = 2 * 3.14 * 40
  const offset = circumference - (percent / 100) * circumference;
  DOM.statRadialProgress.style.strokeDashoffset = offset;

  // Description greeting message
  let greetingMsg = "Let's complete a task today!";
  if (total === 0) {
    greetingMsg = "No tasks. Add one to start!";
  } else if (percent === 100) {
    greetingMsg = "Incredible job! All items cleared! 🏆";
  } else if (percent >= 75) {
    greetingMsg = "Almost there! Keep pushing!";
  } else if (percent >= 50) {
    greetingMsg = "Halfway done! Great progress!";
  } else if (percent >= 25) {
    greetingMsg = "Nice start! Keep the momentum!";
  }
  DOM.statProgressText.textContent = greetingMsg;
}

// --- Helper Functions ---

// Due Date categorization (Today, Tomorrow, Overdue, or Formatted Date)
function processDueDate(dateString, isCompleted) {
  if (!dateString) return { dateText: '', dateClass: '', isOverdue: false };

  const taskDate = new Date(dateString + 'T00:00:00');
  const today = new Date();
  
  // Normalize comparison dates to Midnight
  today.setHours(0,0,0,0);
  const checkDate = new Date(taskDate);
  checkDate.setHours(0,0,0,0);

  const diffTime = checkDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dateText = '';
  let dateClass = '';
  let isOverdue = false;

  if (diffDays === 0) {
    dateText = 'Today';
    dateClass = 'badge-date-today';
  } else if (diffDays === 1) {
    dateText = 'Tomorrow';
    dateClass = 'badge-date-tomorrow';
  } else if (diffDays === -1) {
    dateText = 'Yesterday';
    dateClass = isCompleted ? '' : 'badge-date-overdue';
    isOverdue = !isCompleted;
  } else if (diffDays < -1) {
    const formatted = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    dateText = `${formatted} (Overdue)`;
    dateClass = isCompleted ? '' : 'badge-date-overdue';
    isOverdue = !isCompleted;
  } else {
    // Upcoming
    dateText = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    dateClass = '';
  }

  return { dateText, dateClass, isOverdue };
}

// Get icon class matching Category option
function getCategoryIcon(category) {
  switch (category) {
    case 'Work': return 'fa-solid fa-briefcase';
    case 'Shopping': return 'fa-solid fa-cart-shopping';
    case 'Health': return 'fa-solid fa-heart-pulse';
    case 'Finance': return 'fa-solid fa-wallet';
    case 'Personal':
    default:
      return 'fa-solid fa-folder';
  }
}

// Safe character escaping for XSS prevention
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function truncateText(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

// Dynamic Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-solid fa-circle-check';
  if (type === 'danger') iconClass = 'fa-solid fa-circle-exclamation';
  else if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
  
  toast.innerHTML = `
    <i class="${iconClass}"></i>
    <span>${message}</span>
  `;
  
  DOM.toastContainer.appendChild(toast);
  
  // Slide out after 3 seconds
  setTimeout(() => {
    toast.classList.add('dismissing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// Play UI feedbacks
function playSound(audioEl) {
  if (!audioEl) return;
  // Reset audio playback position and play
  audioEl.currentTime = 0;
  audioEl.play().catch(err => {
    // Safe fail if browser blocks autoplay audio until user interaction occurs
    console.log('Audio playback blocked or interrupted:', err.message);
  });
}

// Run application
document.addEventListener('DOMContentLoaded', init);
