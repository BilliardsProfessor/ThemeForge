ThemeForge.shapePresets = {
    type: "shape",
    schemaVersion: 1,
    saveButton: null,
    baseline: null,
    feedbackTimerId: null,

    init() {
        this.saveButton = document.querySelector("[data-save-shape-preset]");

        if (!this.saveButton) {
            return;
        }

        this.setBaseline();

        this.saveButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            this.promptToSave();
        });
    },

    async promptToSave() {
        if (!ThemeForge.storage || !ThemeForge.appModal) {
            this.showErrorFeedback("Shape preset saving is unavailable");
            return;
        }

        try {
            const suggestedName = await this.getSuggestedName();

            const enteredName = await ThemeForge.appModal.prompt({
                eyebrow: "Shape Preset",
                title: "Save Shape Preset",
                label: "Preset name",
                value: suggestedName,
                confirmText: "Save Preset",
                cancelText: "Cancel",
            });

            if (enteredName === null) {
                return;
            }

            const name = enteredName.trim() || suggestedName;

            await this.save(name);
            this.setBaseline();
        } catch (error) {
            console.error(
                "Theme Forge could not save the Shape preset.",
                error,
            );

            this.showErrorFeedback("Shape preset could not be saved");
        }
    },

    async getSuggestedName() {
        const presets = await ThemeForge.storage.getPresets(this.type);

        return `Custom Shape ${presets.length + 1}`;
    },

    save(name) {
        return ThemeForge.storage.savePreset({
            type: this.type,
            name,
            schemaVersion: this.schemaVersion,
            builtIn: false,
            includeInRandomization: true,
            values: this.cloneShapeValues(ThemeForge.theme.shape),
        });
    },

    setBaseline(shape = ThemeForge.theme.shape) {
        this.baseline = this.cloneShapeValues(shape);
        this.updateSaveButtonVisibility();
    },

    isDirty() {
        if (!this.baseline) {
            return false;
        }

        return (
            JSON.stringify(this.baseline) !==
            JSON.stringify(ThemeForge.theme.shape)
        );
    },

    updateSaveButtonVisibility() {
        if (!this.saveButton) {
            return;
        }

        this.saveButton.hidden = !this.isDirty();
    },

    cloneShapeValues(shape) {
        if (typeof structuredClone === "function") {
            return structuredClone(shape);
        }

        return JSON.parse(JSON.stringify(shape));
    },

    showErrorFeedback(message) {
        if (!this.saveButton) {
            return;
        }

        window.clearTimeout(this.feedbackTimerId);

        this.saveButton.dataset.saveState = "error";
        this.saveButton.dataset.tooltip = message;
        this.saveButton.setAttribute("aria-label", message);

        this.feedbackTimerId = window.setTimeout(() => {
            delete this.saveButton.dataset.saveState;
            this.saveButton.dataset.tooltip = "Save Shape preset";
            this.saveButton.setAttribute("aria-label", "Save Shape preset");
        }, 1800);
    },
};

document.addEventListener("DOMContentLoaded", () => {
    ThemeForge.shapePresets.init();
});
