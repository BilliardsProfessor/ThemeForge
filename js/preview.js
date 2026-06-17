const toastMessages = {
  success: {
    title: "Success",
    message: "Your theme changes were saved successfully.",
  },
  warning: {
    title: "Warning",
    message: "Some color combinations may need a contrast review.",
  },
  danger: {
    title: "Danger",
    message: "A required theme token is missing or invalid.",
  },
  info: {
    title: "Simulation complete",
    message: "No data was harmed in this simulation.",
  },
};

let lastModalTrigger = null;

function showToastSet(type) {
  const region = document.querySelector(".preview-toast-region");
  const message = toastMessages[type];

  region.innerHTML = "";

  ["soft", "solid", "outline"].forEach((variant) => {
    const toast = document.createElement("div");

    toast.className = `preview-toast preview-toast-${type} preview-toast-${variant}`;
    toast.innerHTML = `
      <strong>${message.title} ${variant}</strong>
      <p>${message.message}</p>
    `;

    toast.addEventListener("click", () => {
      toast.remove();
    });

    window.setTimeout(() => {
      toast.remove();
    }, 15000);

    region.append(toast);
  });
}

function openPreviewModal() {
  const modalLayer = document.querySelector("#previewModalLayer");
  const closeButton = modalLayer.querySelector("[data-close-preview-modal]");

  lastModalTrigger = document.activeElement;
  modalLayer.hidden = false;
  closeButton.focus();
}

function closePreviewModal() {
  document.querySelector("#previewModalLayer").hidden = true;

  if (lastModalTrigger) {
    lastModalTrigger.focus();
    lastModalTrigger = null;
  }
}

function runPreviewSimulation() {
  closePreviewModal();
  showToastSet("info");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-toast-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      showToastSet(button.dataset.toastDemo);
    });
  });

  document.querySelectorAll("[data-preview-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const previewTabs = button.closest(".preview-tabs");

      previewTabs.dataset.activePreviewTab = button.dataset.previewTab;

      previewTabs.querySelectorAll("[data-preview-tab]").forEach((tabButton) => {
        tabButton.classList.toggle("active", tabButton === button);
      });

      document.querySelectorAll("[data-preview-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.previewPanel !== button.dataset.previewTab;
      });
    });
  });

  document.querySelector("#openPreviewModal")?.addEventListener("click", openPreviewModal);

  document.querySelector("#runPreviewSimulation")?.addEventListener("click", runPreviewSimulation);

  document.querySelectorAll("[data-close-preview-modal]").forEach((button) => {
    button.addEventListener("click", closePreviewModal);
  });

  document.querySelector("#previewModalLayer")?.addEventListener("click", (event) => {
    if (event.target.id === "previewModalLayer") {
      //uncomment the line below to enable closing the modal by clicking outside of it
      //closePreviewModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePreviewModal();
    }
  });
});
