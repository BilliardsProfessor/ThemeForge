ThemeForge.appModal = {
  activeResolver: null,
  lastTrigger: null,

  init() {
    const { layer, closeButton } = this.getElements();

    closeButton?.addEventListener("click", () => {
      this.close(null);
    });

    layer?.addEventListener("click", (event) => {
      if (event.target === layer) {
        this.close(null);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && layer && !layer.hidden) {
        this.close(null);
      }
    });
  },

  getElements() {
    return {
      layer: document.querySelector("#appModalLayer"),
      modal: document.querySelector("#appModal"),
      eyebrow: document.querySelector("#appModalEyebrow"),
      title: document.querySelector("#appModalTitle"),
      body: document.querySelector("#appModalBody"),
      footer: document.querySelector("#appModalFooter"),
      closeButton: document.querySelector("[data-app-modal-close]"),
    };
  },

  open({ eyebrow = "", title = "", body, footer = [], initialFocusElement = null, modalClass = "" }) {
    const elements = this.getElements();

    if (!elements.layer) return;

    if (!elements.layer.hidden) {
      this.close(null);
    }

    this.lastTrigger = document.activeElement;
    elements.modal.className = modalClass ? `app-modal ${modalClass}` : "app-modal";
    elements.eyebrow.textContent = eyebrow;
    elements.eyebrow.hidden = !eyebrow;
    elements.title.textContent = title;

    this.replaceContent(elements.body, body);
    this.replaceContent(elements.footer, footer);
    elements.footer.hidden = !this.hasContent(footer);

    elements.layer.hidden = false;

    const focusTarget =
      initialFocusElement ||
      elements.body.querySelector("input, button, select, textarea, a[href]") ||
      elements.footer.querySelector("button") ||
      elements.closeButton;

    focusTarget?.focus();
  },

  close(result = null) {
    const elements = this.getElements();

    if (!elements.layer || elements.layer.hidden) return;

    const resolver = this.activeResolver;

    elements.layer.hidden = true;
    this.activeResolver = null;
    this.replaceContent(elements.body, []);
    this.replaceContent(elements.footer, []);

    if (this.lastTrigger) {
      this.lastTrigger.focus();
      this.lastTrigger = null;
    }

    if (resolver) {
      resolver(result);
    }
  },

  prompt({ eyebrow = "", title = "", label = "", value = "", confirmText = "OK", cancelText = "Cancel" }) {
    const { layer } = this.getElements();

    if (!layer) return Promise.resolve(null);

    return new Promise((resolve) => {
      const form = document.createElement("form");
      const field = document.createElement("label");
      const labelText = document.createElement("span");
      const input = document.createElement("input");
      const cancelButton = document.createElement("button");
      const confirmButton = document.createElement("button");

      form.className = "app-modal-form";
      field.className = "app-modal-field";
      labelText.textContent = label;
      input.type = "text";
      input.value = value;

      cancelButton.type = "button";
      cancelButton.className = "app-modal-secondary-action";
      cancelButton.textContent = cancelText;
      cancelButton.addEventListener("click", () => {
        this.close(null);
      });

      confirmButton.type = "button";
      confirmButton.className = "app-modal-primary-action";
      confirmButton.textContent = confirmText;
      confirmButton.addEventListener("click", () => {
        this.close(input.value);
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.close(input.value);
      });

      field.append(labelText, input);
      form.append(field);

      this.open({
        eyebrow,
        title,
        body: form,
        footer: [cancelButton, confirmButton],
        initialFocusElement: input,
      });

      this.activeResolver = resolve;
      input.select();
    });
  },

  replaceContent(container, content) {
    if (!container) return;

    container.replaceChildren();

    if (Array.isArray(content)) {
      container.append(...content);
      return;
    }

    if (content instanceof Node) {
      container.append(content);
      return;
    }

    if (content) {
      container.textContent = content;
    }
  },

  hasContent(content) {
    if (Array.isArray(content)) return content.length > 0;

    return Boolean(content);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ThemeForge.appModal.init();
});
