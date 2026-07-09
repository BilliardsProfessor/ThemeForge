(function () {
    const tooltip = document.getElementById("globalTooltip");
    const defaultPlacement = "right";
    const defaultDelay = 1500; // milliseconds (do not include the unit)
    const offset = 10;
    const viewportPadding = 8;

    let activeElement = null;
    let showTimer = null;

    if (!tooltip) {
        return;
    }

    function getTooltipText(element) {
        return element?.dataset.tooltip || "";
    }

    function getTooltipPlacement(element) {
        return element?.dataset.tooltipPlacement || defaultPlacement;
    }

    function getTooltipDelay(element) {
        const delay = Number.parseInt(element?.dataset.tooltipDelay, 10);

        return Number.isNaN(delay) ? defaultDelay : delay;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function getPosition(element, placement) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        const positions = {
            top: {
                top: elementRect.top - tooltipRect.height - offset,
                left:
                    elementRect.left +
                    elementRect.width / 2 -
                    tooltipRect.width / 2,
            },
            right: {
                top:
                    elementRect.top +
                    elementRect.height / 2 -
                    tooltipRect.height / 2,
                left: elementRect.right + offset,
            },
            bottom: {
                top: elementRect.bottom + offset,
                left:
                    elementRect.left +
                    elementRect.width / 2 -
                    tooltipRect.width / 2,
            },
            left: {
                top:
                    elementRect.top +
                    elementRect.height / 2 -
                    tooltipRect.height / 2,
                left: elementRect.left - tooltipRect.width - offset,
            },
        };

        const preferred = positions[placement] || positions[defaultPlacement];

        return {
            top: clamp(
                preferred.top,
                viewportPadding,
                window.innerHeight - tooltipRect.height - viewportPadding,
            ),
            left: clamp(
                preferred.left,
                viewportPadding,
                window.innerWidth - tooltipRect.width - viewportPadding,
            ),
        };
    }

    function positionTooltip() {
        if (!activeElement) {
            return;
        }

        const placement = getTooltipPlacement(activeElement);
        const position = getPosition(activeElement, placement);

        tooltip.style.top = `${position.top}px`;
        tooltip.style.left = `${position.left}px`;
        tooltip.dataset.tooltipPlacement = placement;
    }

    function showTooltip(element) {
        const text = getTooltipText(element);

        if (!text) {
            return;
        }

        activeElement = element;
        tooltip.textContent = text;
        tooltip.dataset.tooltipPointer = element.hasAttribute(
            "data-tooltip-nopointer",
        )
            ? "false"
            : "true";
        tooltip.hidden = false;
        tooltip.classList.remove("is-visible");

        requestAnimationFrame(() => {
            positionTooltip();
            tooltip.classList.add("is-visible");
        });
    }

    function scheduleTooltip(element) {
        window.clearTimeout(showTimer);

        showTimer = window.setTimeout(() => {
            showTooltip(element);
        }, getTooltipDelay(element));
    }

    function hideTooltip() {
        window.clearTimeout(showTimer);
        activeElement = null;
        tooltip.classList.remove("is-visible");

        window.setTimeout(() => {
            if (!activeElement) {
                tooltip.hidden = true;
            }
        }, 160);
    }

    function getTooltipTarget(event) {
        return event.target.closest("[data-tooltip]");
    }

    document.addEventListener("pointerover", (event) => {
        const target = getTooltipTarget(event);

        if (!target || !target.isConnected) {
            return;
        }

        scheduleTooltip(target);
    });

    document.addEventListener("pointerout", (event) => {
        const target = getTooltipTarget(event);

        if (!target || !target.contains(event.relatedTarget)) {
            hideTooltip();
        }
    });

    document.addEventListener("focusin", (event) => {
        const target = getTooltipTarget(event);

        if (target) {
            scheduleTooltip(target);
        }
    });

    document.addEventListener("focusout", (event) => {
        const target = getTooltipTarget(event);

        if (target) {
            hideTooltip();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideTooltip();
        }
    });

    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("resize", hideTooltip);
})();
