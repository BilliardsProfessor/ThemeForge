ThemeForge.storage = {
    databaseName: "themeForge",
    databaseVersion: 1,

    stores: {
        presets: "presets",
        themes: "themes",
    },

    databasePromise: null,

    openDatabase() {
        if (this.databasePromise) {
            return this.databasePromise;
        }

        this.databasePromise = new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error("IndexedDB is not supported by this browser."));
                return;
            }

            const request = indexedDB.open(this.databaseName, this.databaseVersion);

            request.addEventListener("upgradeneeded", () => {
                this.upgradeDatabase(request.result);
            });

            request.addEventListener("success", () => {
                const database = request.result;

                database.addEventListener("versionchange", () => {
                    database.close();
                    this.databasePromise = null;
                });

                resolve(database);
            });

            request.addEventListener("blocked", () => {
                reject(new Error("Theme Forge storage upgrade was blocked by another open tab."));
            });

            request.addEventListener("error", () => {
                reject(request.error || new Error("Theme Forge storage could not be opened."));
            });
        }).catch((error) => {
            this.databasePromise = null;
            throw error;
        });

        return this.databasePromise;
    },

    upgradeDatabase(database) {
        if (!database.objectStoreNames.contains(this.stores.presets)) {
            const presetStore = database.createObjectStore(this.stores.presets, {
                keyPath: "id",
            });

            presetStore.createIndex("type", "type", {
                unique: false,
            });

            presetStore.createIndex("updatedAt", "updatedAt", {
                unique: false,
            });
        }

        if (!database.objectStoreNames.contains(this.stores.themes)) {
            const themeStore = database.createObjectStore(this.stores.themes, {
                keyPath: "id",
            });

            themeStore.createIndex("updatedAt", "updatedAt", {
                unique: false,
            });
        }
    },

    createId(prefix) {
        if (crypto.randomUUID) {
            return `${prefix}-${crypto.randomUUID()}`;
        }

        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    },

    cloneValue(value) {
        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value));
    },

    prepareRecord(record, prefix) {
        const now = new Date().toISOString();
        const preparedRecord = this.cloneValue(record);

        preparedRecord.id = preparedRecord.id || this.createId(prefix);
        preparedRecord.createdAt = preparedRecord.createdAt || now;
        preparedRecord.updatedAt = now;

        return preparedRecord;
    },

    async runRequest(storeName, mode, operation) {
        const database = await this.openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);

            let request;

            try {
                request = operation(store);
            } catch (error) {
                reject(error);
                return;
            }

            request.addEventListener("success", () => {
                resolve(request.result);
            });

            request.addEventListener("error", () => {
                reject(request.error || new Error(`Theme Forge could not access ${storeName}.`));
            });

            transaction.addEventListener("abort", () => {
                reject(transaction.error || new Error(`Theme Forge could not update ${storeName}.`));
            });
        });
    },

    async savePreset(preset) {
        if (!preset || typeof preset !== "object" || !preset.type || !preset.name || !preset.values) {
            throw new TypeError("A preset requires type, name, and values.");
        }

        const record = this.prepareRecord(preset, "preset");

        await this.runRequest(this.stores.presets, "readwrite", (store) => store.put(record));

        return record;
    },

    getPreset(id) {
        return this.runRequest(this.stores.presets, "readonly", (store) => store.get(id));
    },

    async getPresets(type = null) {
        const records = await this.runRequest(this.stores.presets, "readonly", (store) => {
            if (type) {
                return store.index("type").getAll(type);
            }

            return store.getAll();
        });

        return records.sort((first, second) => first.name.localeCompare(second.name));
    },

    deletePreset(id) {
        return this.runRequest(this.stores.presets, "readwrite", (store) => store.delete(id));
    },

    async saveTheme(theme) {
        if (!theme || typeof theme !== "object" || !theme.name || !theme.values) {
            throw new TypeError("A saved theme requires name and values.");
        }

        const record = this.prepareRecord(theme, "theme");

        await this.runRequest(this.stores.themes, "readwrite", (store) => store.put(record));

        return record;
    },

    getTheme(id) {
        return this.runRequest(this.stores.themes, "readonly", (store) => store.get(id));
    },

    async getThemes() {
        const records = await this.runRequest(this.stores.themes, "readonly", (store) => store.getAll());

        return records.sort((first, second) => first.name.localeCompare(second.name));
    },

    deleteTheme(id) {
        return this.runRequest(this.stores.themes, "readwrite", (store) => store.delete(id));
    },
};
