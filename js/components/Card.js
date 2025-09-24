import { h } from "../lib/h.js";

/**
 * Card component for displaying content in a styled card container
 * @param {Object} props - Card properties
 * @param {string} props.title - Card title
 * @param {string} [props.description] - Card description
 * @param {string} [props.status] - Task status (pending, completed, in-progress)
 * @param {string} [props.priority] - Task priority (low, medium, high)
 * @param {Date|string} [props.createdAt] - Creation date
 * @param {Function} [props.onToggleStatus] - Callback for status toggle
 * @param {Function} [props.onDelete] - Callback for delete action
 * @param {string} [props.className] - Additional CSS classes
 * @returns {HTMLElement} Card element
 */
export function Card({
  title,
  description = "",
  status = "pending",
  priority = "medium",
  createdAt,
  onToggleStatus,
  onDelete,
  className = ""
}) {
  // Format the creation date if provided
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Get status icon and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return { icon: "✅", text: "Completed", class: "status-completed" };
      case "in-progress":
        return { icon: "🔄", text: "In Progress", class: "status-in-progress" };
      default:
        return { icon: "⏳", text: "Pending", class: "status-pending" };
    }
  };

  // Get priority info
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case "high":
        return { icon: "🔴", text: "High", class: "priority-high" };
      case "low":
        return { icon: "🟢", text: "Low", class: "priority-low" };
      default:
        return { icon: "🟡", text: "Medium", class: "priority-medium" };
    }
  };

  const statusInfo = getStatusInfo(status);
  const priorityInfo = getPriorityInfo(priority);

  return h("div", { 
    class: `card task-card ${statusInfo.class} ${className}`.trim() 
  }, [
    // Card header with title and priority
    h("div", { class: "card-header" }, [
      h("h3", { class: "card-title" }, title),
      h("span", { 
        class: `priority-badge ${priorityInfo.class}` 
      }, [
        priorityInfo.icon,
        " ",
        priorityInfo.text
      ])
    ]),

    // Card body with description
    description && h("div", { class: "card-body" }, [
      h("p", { class: "card-description" }, description)
    ]),

    // Card footer with status, date, and actions
    h("div", { class: "card-footer" }, [
      h("div", { class: "card-info" }, [
        h("span", { 
          class: `status-badge ${statusInfo.class}` 
        }, [
          statusInfo.icon,
          " ",
          statusInfo.text
        ]),
        createdAt && h("span", { class: "card-date" }, formatDate(createdAt))
      ]),

      h("div", { class: "card-actions" }, [
        onToggleStatus && h("button", {
          class: "btn btn-sm btn-secondary",
          onclick: onToggleStatus,
          title: "Toggle status"
        }, "Toggle"),
        
        onDelete && h("button", {
          class: "btn btn-sm btn-danger",
          onclick: onDelete,
          title: "Delete task"
        }, "Delete")
      ])
    ])
  ]);
}

/**
 * Simple Card component for basic content display
 * @param {Object} props - Card properties
 * @param {string} [props.title] - Card title
 * @param {string|HTMLElement} [props.content] - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.actions] - Action buttons
 * @returns {HTMLElement} Simple card element
 */
export function SimpleCard({ title, content, className = "", actions = [] }) {
  return h("div", { class: `card simple-card ${className}`.trim() }, [
    title && h("div", { class: "card-header" }, [
      h("h3", { class: "card-title" }, title)
    ]),
    
    content && h("div", { class: "card-body" }, [
      typeof content === "string" 
        ? h("p", {}, content)
        : content
    ]),
    
    actions.length > 0 && h("div", { class: "card-footer" }, [
      h("div", { class: "card-actions" }, actions)
    ])
  ]);
}
