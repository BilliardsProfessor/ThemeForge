ThemeForge.shapePresets = {
    type: "shape",
    schemaVersion: 1,
    saveButton: null,
    feedbackTimerId: null,

    init() {
        this.saveButton = document.querySelector("[data-save-shape-preset]");

        if (!this.saveButton) {
            return;
        }

        this.saveButton.addEventListener("click", () => {
            this.promptToSave();
        });
    },

    async promptToSave() {
        if (!ThemeForge.storage || !ThemeForge.appModal) {
            this.showButtonFeedback("Save unavailable", "error");
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

            this.showButtonFeedback("Preset Saved", "success");
        } catch (error) {
            console.error("Theme Forge could not save the Shape preset.", error);

            this.showButtonFeedback("Save Failed", "error");
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

    cloneShapeValues(shape) {
        if (typeof structuredClone === "function") {
            return structuredClone(shape);
        }

        return JSON.parse(JSON.stringify(shape));
    },

    showButtonFeedback(message, state) {
        if (!this.saveButton) {
            return;
        }

        window.clearTimeout(this.feedbackTimerId);

        this.saveButton.textContent = message;
        this.saveButton.dataset.saveState = state;
        this.saveButton.disabled = true;

        this.feedbackTimerId = window.setTimeout(() => {
            this.saveButton.textContent = "Save as Preset";
            delete this.saveButton.dataset.saveState;
            this.saveButton.disabled = false;
        }, 1800);
    },
};

document.addEventListener("DOMContentLoaded", () => {
    ThemeForge.shapePresets.init();
});
