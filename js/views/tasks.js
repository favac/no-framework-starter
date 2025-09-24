import { h, mount } from "../lib/h.js";
import { createPersistentStore } from "../hmr-store.js";
import { Card, SimpleCard } from "../components/Card.js";

// Local store for tasks
const tasksStore = createPersistentStore("tasks", {
  tasks: [
    {
      id: 1,
      title: "Learn Component Architecture",
      description: "Understand how to create reusable components in this no-framework setup",
      status: "completed",
      priority: "high",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Build Card Component",
      description: "Create a flexible Card component that can display different types of content",
      status: "completed",
      priority: "high",
      createdAt: "2024-01-16"
    },
    {
      id: 3,
      title: "Implement Task Management",
      description: "Add functionality to create, update, and delete tasks using the Card component",
      status: "in-progress",
      priority: "medium",
      createdAt: "2024-01-17"
    },
    {
      id: 4,
      title: "Add Filtering and Sorting",
      description: "Implement filters to show tasks by status and priority, with sorting options",
      status: "pending",
      priority: "medium",
      createdAt: "2024-01-18"
    },
    {
      id: 5,
      title: "Style the Interface",
      description: "Polish the UI with better styling and responsive design",
      status: "pending",
      priority: "low",
      createdAt: "2024-01-19"
    }
  ],
  filter: "all", // all, pending, in-progress, completed
  nextId: 6
});

/**
 * Toggle task status between pending -> in-progress -> completed -> pending
 * @param {number} taskId - ID of the task to toggle
 */
function toggleTaskStatus(taskId) {
  tasksStore.set(state => {
    const tasks = state.tasks.map(task => {
      if (task.id === taskId) {
        let newStatus;
        switch (task.status) {
          case "pending":
            newStatus = "in-progress";
            break;
          case "in-progress":
            newStatus = "completed";
            break;
          case "completed":
            newStatus = "pending";
            break;
          default:
            newStatus = "pending";
        }
        return { ...task, status: newStatus };
      }
      return task;
    });
    return { ...state, tasks };
  });
}

/**
 * Delete a task by ID
 * @param {number} taskId - ID of the task to delete
 */
function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasksStore.set(state => ({
      ...state,
      tasks: state.tasks.filter(task => task.id !== taskId)
    }));
  }
}

/**
 * Add a new task
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string} priority - Task priority
 */
function addTask(title, description, priority = "medium") {
  if (!title.trim()) return;
  
  tasksStore.set(state => ({
    ...state,
    tasks: [
      ...state.tasks,
      {
        id: state.nextId,
        title: title.trim(),
        description: description.trim(),
        status: "pending",
        priority,
        createdAt: new Date().toISOString().split('T')[0]
      }
    ],
    nextId: state.nextId + 1
  }));
}

/**
 * Set the current filter
 * @param {string} filter - Filter type (all, pending, in-progress, completed)
 */
function setFilter(filter) {
  tasksStore.set(state => ({ ...state, filter }));
}

/**
 * Create the add task form
 * @returns {HTMLElement} Form element
 */
function createAddTaskForm() {
  return h("div", { class: "add-task-form" }, [
    h("h3", {}, "Add New Task"),
    h("div", { class: "form-group" }, [
      h("input", {
        type: "text",
        id: "task-title",
        placeholder: "Task title...",
        class: "form-input"
      }),
    ]),
    h("div", { class: "form-group" }, [
      h("textarea", {
        id: "task-description",
        placeholder: "Task description (optional)...",
        class: "form-input",
        rows: 3
      }),
    ]),
    h("div", { class: "form-group" }, [
      h("select", { id: "task-priority", class: "form-input" }, [
        h("option", { value: "low" }, "Low Priority"),
        h("option", { value: "medium", selected: true }, "Medium Priority"),
        h("option", { value: "high" }, "High Priority")
      ])
    ]),
    h("button", {
      class: "btn btn-primary",
      onclick: () => {
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const priority = document.getElementById("task-priority").value;
        
        addTask(title, description, priority);
        
        // Clear form
        document.getElementById("task-title").value = "";
        document.getElementById("task-description").value = "";
        document.getElementById("task-priority").value = "medium";
      }
    }, "Add Task")
  ]);
}

/**
 * Create filter buttons
 * @param {string} currentFilter - Currently active filter
 * @returns {HTMLElement} Filter buttons container
 */
function createFilterButtons(currentFilter) {
  const filters = [
    { key: "all", label: "All Tasks" },
    { key: "pending", label: "Pending" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" }
  ];

  return h("div", { class: "filter-buttons" }, [
    h("h4", {}, "Filter Tasks:"),
    h("div", { class: "button-group" }, 
      filters.map(filter => 
        h("button", {
          class: `btn btn-sm ${currentFilter === filter.key ? 'btn-primary' : 'btn-secondary'}`,
          onclick: () => setFilter(filter.key)
        }, filter.label)
      )
    )
  ]);
}

/**
 * Filter tasks based on current filter
 * @param {Array} tasks - All tasks
 * @param {string} filter - Current filter
 * @returns {Array} Filtered tasks
 */
function filterTasks(tasks, filter) {
  if (filter === "all") return tasks;
  return tasks.filter(task => task.status === filter);
}

/**
 * Create task statistics
 * @param {Array} tasks - All tasks
 * @returns {HTMLElement} Statistics element
 */
function createTaskStats(tasks) {
  const stats = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const total = tasks.length;
  const completed = stats.completed || 0;
  const inProgress = stats["in-progress"] || 0;
  const pending = stats.pending || 0;

  return h("div", { class: "task-stats" }, [
    h("h4", {}, "Task Statistics"),
    h("div", { class: "stats-grid" }, [
      h("div", { class: "stat-item" }, [
        h("span", { class: "stat-number" }, total),
        h("span", { class: "stat-label" }, "Total")
      ]),
      h("div", { class: "stat-item" }, [
        h("span", { class: "stat-number" }, completed),
        h("span", { class: "stat-label" }, "Completed")
      ]),
      h("div", { class: "stat-item" }, [
        h("span", { class: "stat-number" }, inProgress),
        h("span", { class: "stat-label" }, "In Progress")
      ]),
      h("div", { class: "stat-item" }, [
        h("span", { class: "stat-number" }, pending),
        h("span", { class: "stat-label" }, "Pending")
      ])
    ])
  ]);
}

/**
 * Render the tasks view
 */
export function renderTasks() {
  const state = tasksStore.get();
  const filteredTasks = filterTasks(state.tasks, state.filter);

  const content = h("div", { class: "page-content" }, [
    h("h1", {}, "📋 Task Management Demo"),
    h("p", {}, "This view demonstrates how to create and use reusable components. Each task is displayed using our Card component."),

    // Component explanation card
    SimpleCard({
      title: "🧩 Component Architecture",
      content: h("div", {}, [
        h("p", {}, "This demo shows how to:"),
        h("ul", {}, [
          h("li", {}, "Create reusable components (Card.js)"),
          h("li", {}, "Pass props to components"),
          h("li", {}, "Handle component events and callbacks"),
          h("li", {}, "Manage component state with stores"),
          h("li", {}, "Compose components in views")
        ]),
        h("p", {}, [
          "Check out ",
          h("code", {}, "js/components/Card.js"),
          " to see the component implementation!"
        ])
      ]),
      className: "info-card"
    }),

    // Task statistics
    createTaskStats(state.tasks),

    // Add task form
    SimpleCard({
      title: "➕ Add New Task",
      content: createAddTaskForm(),
      className: "add-task-card"
    }),

    // Filter buttons
    createFilterButtons(state.filter),

    // Tasks list
    h("div", { class: "tasks-section" }, [
      h("h2", {}, `${filteredTasks.length} ${state.filter === 'all' ? 'Total' : state.filter.charAt(0).toUpperCase() + state.filter.slice(1)} Tasks`),
      
      filteredTasks.length === 0 
        ? h("p", { class: "no-tasks" }, `No ${state.filter === 'all' ? '' : state.filter + ' '}tasks found.`)
        : h("div", { class: "tasks-grid" }, 
            filteredTasks.map(task => 
              Card({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                createdAt: task.createdAt,
                onToggleStatus: () => toggleTaskStatus(task.id),
                onDelete: () => deleteTask(task.id)
              })
            )
          )
    ])
  ]);

  mount(document.getElementById("main-content"), content);
}

// Subscribe to store changes to re-render when tasks change
tasksStore.subscribe(() => {
  // Only re-render if we're currently on the tasks view
  if (window.location.hash === '#tasks' || 
      (window.location.hash === '' && window.location.pathname === '/tasks')) {
    renderTasks();
  }
});
