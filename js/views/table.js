import { h, createStore } from "../lib/h.js";
import { createView } from "../lib/lifecycle.js";

/**
 * @typedef {Object} TableRow
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} location
 * @property {string} status
 * @property {string} joinedOn
 */

const rawRows = [
  {
    id: "1",
    name: "Ada Lovelace",
    role: "Mathematician",
    location: "London, UK",
    status: "Active",
    joinedOn: "1843-12-10",
  },
  {
    id: "2",
    name: "Alan Turing",
    role: "Computer Scientist",
    location: "Wilmslow, UK",
    status: "Inactive",
    joinedOn: "1954-06-07",
  },
  {
    id: "3",
    name: "Grace Hopper",
    role: "Rear Admiral",
    location: "New York, USA",
    status: "Active",
    joinedOn: "1992-01-01",
  },
  {
    id: "4",
    name: "Katherine Johnson",
    role: "Aerospace Technologist",
    location: "Hampton, USA",
    status: "Active",
    joinedOn: "2016-02-24",
  },
  {
    id: "5",
    name: "Hedy Lamarr",
    role: "Inventor",
    location: "Vienna, Austria",
    status: "Inactive",
    joinedOn: "2000-01-19",
  },
];

/**
 * Returns the rows sorted by the given sort configuration.
 * @param {TableRow[]} rows - Raw rows to sort.
 * @param {keyof TableRow} sortKey - Property used as sorting key.
 * @param {"asc"|"desc"} sortDirection - Sort direction.
 * @returns {TableRow[]} Sorted row list.
 */
function getSortedRows(rows, sortKey, sortDirection) {
  const sorted = [...rows].sort((a, b) => {
    if (a[sortKey] === b[sortKey]) return 0;
    return a[sortKey] > b[sortKey] ? 1 : -1;
  });
  if (sortDirection === "desc") sorted.reverse();
  return sorted;
}

const tableStore = createStore({
  sortKey: "name",
  sortDirection: "asc",
  rows: rawRows,
  sortedRows: [],
  sortState: "name:asc", // Combined state for reactive bindings
});

/**
 * Column metadata used to render header cells and sorting controls.
 * @type {{ key: keyof TableRow, label: string }[]}
 */
const columnDefinitions = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "joinedOn", label: "Joined" },
];

/**
 * Toggles sorting for a given column key and updates sortedRows.
 * @param {keyof TableRow} columnKey - Column to sort by.
 * @returns {void}
 */
function handleSortChange(columnKey) {
  const state = tableStore.get();
  const isSameColumn = state.sortKey === columnKey;
  const nextDirection =
    isSameColumn && state.sortDirection === "asc" ? "desc" : "asc";

  const sortedRows = getSortedRows(state.rows, columnKey, nextDirection);

  tableStore.update(() => ({
    sortKey: columnKey,
    sortDirection: nextDirection,
    sortedRows,
    sortState: `${columnKey}:${nextDirection}`, // Update combined state
  }));
}

/**
 * Renders the `<tbody>` section for the table with reactive binding.
 * @returns {HTMLElement} Table body element.
 */
function renderTableBody() {
  return h(
    "tbody",
    {},
    h.map(
      "sortedRows",
      (row) =>
        h("tr", { key: row.id }, [
          h("td", {}, row.name),
          h("td", {}, row.role),
          h("td", {}, row.location),
          h("td", {}, row.status),
          h("td", {}, row.joinedOn),
        ]),
      { store: tableStore }
    )
  );
}

/**
 * Builds a sortable header button with reactive indicator.
 * @param {keyof TableRow} columnKey - Column key tied to the button.
 * @param {string} label - Human readable label.
 * @returns {HTMLElement} Button element enabling sort toggle.
 */
function renderSortButton(columnKey, label) {
  return h(
    "button",
    {
      class: "table-sort-button",
      onclick: () => handleSortChange(columnKey),
    },
    [
      label,
      " ",
      h.link(tableStore, "sortState", {
        format(sortState, state) {
          const isActive = state.sortKey === columnKey;
          if (!isActive) return "↕";
          return state.sortDirection === "asc" ? "↑" : "↓";
        },
      }),
    ]
  );
}

/**
 * Builds the complete table element with header and body sections.
 * @returns {HTMLElement} Complete table markup.
 */
function buildTableElement() {
  return h("table", { class: "data-table" }, [
    h(
      "thead",
      {},
      h(
        "tr",
        {},
        h.map(columnDefinitions, (column) =>
          h("th", { scope: "col" }, renderSortButton(column.key, column.label))
        )
      )
    ),
    renderTableBody(),
  ]);
}

/**
 * Renders the table view with controls and reactive metadata.
 * Uses lifecycle hooks to ensure proper initialization.
 */
export const renderTable = createView("table", {
  /**
   * Initialize sortedRows before rendering.
   * @returns {void}
   */
  onInit() {
    const state = tableStore.get();
    // Ensure sortedRows is populated
    if (!state.sortedRows || state.sortedRows.length === 0) {
      const sortedRows = getSortedRows(
        state.rows,
        state.sortKey,
        state.sortDirection
      );
      tableStore.update(() => ({
        sortedRows,
        sortState: `${state.sortKey}:${state.sortDirection}`,
      }));
    }
  },

  /**
   * Called after DOM is mounted and bindings are active.
   * @returns {void}
   */
  onMount() {
    console.log("✅ Table view mounted with reactive bindings");
  },

  /**
   * Render the table view content.
   * @returns {HTMLElement}
   */
  render() {
    return h("div", { class: "page-content" }, [
      h("h1", {}, "Team Directory"),
      h(
        "p",
        { class: "intro" },
        "Sortable table rendered with the h() helper and reactive store bindings."
      ),
      h("div", { class: "table-controls" }, [
        h("p", { class: "control-summary" }, [
          "Sorting by ",
          h.link(tableStore, "sortKey"),
          " (",
          h.link(tableStore, "sortDirection", {
            format(value) {
              return value === "asc" ? "ascending" : "descending";
            },
          }),
          ")",
        ]),
      ]),
      buildTableElement(),
    ]);
  },
});
