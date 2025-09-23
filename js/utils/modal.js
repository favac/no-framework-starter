// Modal utility functions
export function showModal(content) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  if (content instanceof Node) {
    modalBody.replaceChildren(content);
  } else {
    modalBody.innerHTML = content;
  }
  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open

  // Focus the first input in the modal if it exists
  const firstInput = modal.querySelector("input, button, [tabindex]");
  if (firstInput) {
    firstInput.focus();
  }
}

export function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
  document.body.style.overflow = ""; // Re-enable scrolling
}

// Close modal when pressing Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
