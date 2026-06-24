ThemeForge.accessibility = {
    checks: [
        {
            name: "Text on surface",
            foreground: "text",
            background: "surface",
            level: "normal",
        },
        {
            name: "Muted text on surface",
            foreground: "mutedText",
            background: "surface",
            level: "normal",
        },
        {
            name: "Link on surface",
            foreground: "link",
            background: "surface",
            level: "normal",
        },
        {
            name: "Text on background",
            foreground: "text",
            background: "background",
            level: "normal",
        },
        {
            name: "Primary button text",
            foregroundRgb: { r: 255, g: 255, b: 255 },
            background: "primary",
            level: "normal",
        },
        {
            name: "Secondary button text",
            foregroundRgb: { r: 255, g: 255, b: 255 },
            background: "secondary",
            level: "normal",
        },
        {
            name: "Success solid text",
            foregroundRgb: { r: 255, g: 255, b: 255 },
            background: "success",
            level: "normal",
        },
        {
            name: "Warning solid text",
            foregroundRgb: { r: 255, g: 255, b: 255 },
            background: "warning",
            level: "normal",
        },
        {
            name: "Danger solid text",
            foregroundRgb: { r: 255, g: 255, b: 255 },
            background: "danger",
            level: "normal",
        },
        {
            name: "Info solid text",
            foregroundRgb: { r: 255, g: 255, b: 255 },
            background: "info",
            level: "normal",
        },
    ],

    init() {
        document.querySelector("#scoreBadge")?.addEventListener("click", () => {
            this.openReport();
        });

        this.updateScoreBadge();
    },

    openReport() {
        const closeButton = document.createElement("button");

        closeButton.type = "button";
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => {
            ThemeForge.appModal.close();
        });

        ThemeForge.appModal.open({
            eyebrow: "Theme audit",
            title: "Accessibility Report",
            body: this.createReportContent(),
            footer: [closeButton],
            initialFocusElement: closeButton,
            modalClass: "app-accessibility-modal",
        });
    },

    createReportContent() {
        const reportContent = document.createElement("div");
        const results = this.getContrastResults();
        const score = this.getScore(results);

        const summary = document.createElement("section");
        summary.className = "accessibility-summary";

        const scoreText = document.createElement("strong");
        scoreText.textContent = `A11y ${score}`;

        const summaryText = document.createElement("p");
        summaryText.textContent = "Contrast checks for practical theme token combinations.";

        summary.append(scoreText, summaryText);

        const list = document.createElement("div");
        list.className = "accessibility-report-list";

        results.forEach((result) => {
            list.append(this.createResultCard(result));
        });

        reportContent.append(summary, list);

        return reportContent;
    },

    createResultCard(result) {
        const card = document.createElement("article");
        card.className = "accessibility-check";

        const header = document.createElement("div");
        header.className = "accessibility-check-header";

        const title = document.createElement("span");
        title.textContent = result.name;

        const status = document.createElement("span");
        status.className = `accessibility-result ${result.status}`;
        status.textContent = result.status.toUpperCase();

        const detail = document.createElement("p");
        detail.textContent = `${result.foregroundLabel} on ${result.backgroundLabel}: ${result.ratio}:1`;

        header.append(title, status);
        card.append(header, detail);

        return card;
    },

    getContrastResults() {
        return this.checks.map((check) => {
            const foregroundRgb = check.foregroundRgb || this.getTokenRgb(check.foreground);
            const backgroundRgb = this.getTokenRgb(check.background);
            const ratio = this.getContrastRatio(foregroundRgb, backgroundRgb);
            const status = this.getContrastStatus(ratio, check.level);

            return {
                ...check,
                ratio: ratio.toFixed(2),
                status,
                foregroundLabel: check.foreground || "white",
                backgroundLabel: check.background,
            };
        });
    },

    getTokenRgb(tokenName) {
        return hslToRgb(ThemeForge.getActiveColors()[tokenName]);
    },

    getContrastRatio(foregroundRgb, backgroundRgb) {
        const foregroundLuminance = this.getRelativeLuminance(foregroundRgb);
        const backgroundLuminance = this.getRelativeLuminance(backgroundRgb);
        const lighter = Math.max(foregroundLuminance, backgroundLuminance);
        const darker = Math.min(foregroundLuminance, backgroundLuminance);

        return (lighter + 0.05) / (darker + 0.05);
    },

    getRelativeLuminance({ r, g, b }) {
        const [red, green, blue] = [r, g, b].map((channel) => {
            const value = channel / 255;

            return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });

        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    },

    getContrastStatus(ratio, level) {
        if (ratio >= 4.5) return "pass";
        if (level === "large" && ratio >= 3) return "pass";
        if (ratio >= 3) return "warning";

        return "fail";
    },

    getScore(results) {
        const possiblePoints = results.length * 10;
        const earnedPoints = results.reduce((total, result) => {
            if (result.status === "pass") return total + 10;
            if (result.status === "warning") return total + 5;

            return total;
        }, 0);

        return Math.round((earnedPoints / possiblePoints) * 100);
    },

    updateScoreBadge() {
        const scoreBadge = document.querySelector("#scoreBadge");

        if (!scoreBadge) return;

        const results = this.getContrastResults();
        const score = this.getScore(results);

        scoreBadge.textContent = `A11y ${score}`;
    },
};
