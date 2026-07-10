(function () {
    const previewModes = new Set(["workbench", "full"]);
    const workspaces = new Set(["preview", "export"]);
    const body = document.body;
    const previewActionButton = document.getElementById("fullPreviewBtn");
    const exportWorkspaceButton = document.getElementById("exportWorkspaceBtn");
    const restoreWorkbenchButton = document.getElementById("restoreWorkbenchBtn");
    const restoreFadeDuration = 500;

    let restoreHideTimer = null;

    if (!previewActionButton || !restoreWorkbenchButton) {
        return;
    }

    function getPreviewMode() {
        return previewModes.has(body.dataset.previewMode) ? body.dataset.previewMode : "workbench";
    }

    function getActiveWorkspace() {
        return workspaces.has(body.dataset.activeWorkspace) ? body.dataset.activeWorkspace : "preview";
    }

    function showRestoreButton() {
        window.clearTimeout(restoreHideTimer);
        restoreWorkbenchButton.hidden = false;

        requestAnimationFrame(function () {
            restoreWorkbenchButton.classList.add("is-visible");
        });
    }

    function hideRestoreButton() {
        restoreWorkbenchButton.classList.remove("is-visible");
        window.clearTimeout(restoreHideTimer);

        restoreHideTimer = window.setTimeout(function () {
            if (getPreviewMode() === "full") {
                return;
            }

            restoreWorkbenchButton.hidden = true;
        }, restoreFadeDuration);
    }

    function syncWorkspaceControls() {
        const activeWorkspace = getActiveWorkspace();
        const isPreviewWorkspace = activeWorkspace === "preview";

        document.querySelectorAll("[data-workspace-panel]").forEach((panel) => {
            panel.hidden = panel.dataset.workspacePanel !== activeWorkspace;
        });

        previewActionButton.textContent = isPreviewWorkspace ? "Full Preview" : "Preview";
        previewActionButton.setAttribute("aria-label", isPreviewWorkspace ? "Open full preview" : "Return to preview workspace");

        if (exportWorkspaceButton) {
            exportWorkspaceButton.classList.toggle("active", activeWorkspace === "export");
            exportWorkspaceButton.setAttribute("aria-pressed", String(activeWorkspace === "export"));
        }
    }

    function setActiveWorkspace(workspace) {
        body.dataset.activeWorkspace = workspaces.has(workspace) ? workspace : "preview";
        syncWorkspaceControls();
    }

    function setPreviewMode(mode) {
        const nextMode = previewModes.has(mode) ? mode : "workbench";
        const isFullPreview = nextMode === "full";

        body.dataset.previewMode = nextMode;
        previewActionButton.setAttribute("aria-pressed", String(isFullPreview));

        if (isFullPreview) {
            showRestoreButton();
            return;
        }

        hideRestoreButton();
    }

    function openExportWorkspace() {
        setPreviewMode("workbench");
        ThemeForge.export.updateWorkspace();
        setActiveWorkspace("export");

        document.querySelector("[data-drawer-panel='export']")?.click();
    }

    function handlePreviewActionClick() {
        if (getActiveWorkspace() === "export") {
            setActiveWorkspace("preview");
            return;
        }

        setPreviewMode("full");
    }

    function restoreWorkbench() {
        setPreviewMode("workbench");
        setActiveWorkspace("preview");
    }

    function handleDocumentClick(event) {
        const exportTrigger = event.target.closest("[data-workspace-open='export']");

        if (exportTrigger) {
            openExportWorkspace();
            return;
        }

        const drawerPanelButton = event.target.closest("[data-drawer-panel]");

        if (!drawerPanelButton) {
            return;
        }

        if (drawerPanelButton.dataset.drawerPanel !== "export") {
            setActiveWorkspace("preview");
        }
    }

    function handleDocumentKeydown(event) {
        if (event.key !== "Escape" || getPreviewMode() !== "full") {
            return;
        }

        restoreWorkbench();
    }

    previewActionButton.addEventListener("click", handlePreviewActionClick);
    restoreWorkbenchButton.addEventListener("click", restoreWorkbench);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);

    setActiveWorkspace(getActiveWorkspace());
    setPreviewMode(getPreviewMode());
})();
