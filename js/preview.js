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
    title: "Info",
    message: "Your theme is ready to preview and export.",
  },
};

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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-toast-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      showToastSet(button.dataset.toastDemo);
    });
  });
});
