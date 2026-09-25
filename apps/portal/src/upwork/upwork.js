(() => {
  "use strict";

  const root = document.querySelector("[data-upwork-page]");
  if (!root) return;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const featureRecords = [
    { title: "Design API error state", owner: "Mina", priority: "high", status: "in review" },
    { title: "Add workspace member", owner: "Alex", priority: "medium", status: "planned" },
    { title: "Persist release note", owner: "Sam", priority: "low", status: "shipped" },
  ];

  const initHeroSequence = () => {
    const visual = root.querySelector("[data-hero-visual]");
    if (!visual) return;
    const slides = [...visual.querySelectorAll("[data-hero-slide]")];
    const controls = [...visual.querySelectorAll("[data-hero-index]")];
    const caption = visual.querySelector(":scope > .upwork-hero-caption");
    const signal = visual.querySelector("[data-hero-signal]");
    const counter = visual.querySelector("[data-hero-counter]");
    if (!slides.length || !controls.length || !caption || !signal || !counter) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let selected = 0;
    let timer = null;
    let hovered = false;
    let focused = false;
    let visible = true;

    const shouldPlay = () => !reducedMotion && !hovered && !focused && visible && document.visibilityState === "visible";
    const stop = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    };
    const start = () => {
      stop();
      if (shouldPlay()) timer = window.setInterval(() => render((selected + 1) % slides.length), 4800);
    };
    const render = (index) => {
      selected = index;
      const slide = slides[selected];
      slides.forEach((candidate, candidateIndex) => {
        const active = candidateIndex === selected;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-hidden", String(!active));
      });
      controls.forEach((control, controlIndex) => control.setAttribute("aria-pressed", String(controlIndex === selected)));
      caption.textContent = slide.dataset.heroCaption || "";
      signal.textContent = `${String(selected + 1).padStart(2, "0")} / ${slide.dataset.heroLabel || "WORK MODE"}`;
      counter.textContent = `${String(selected + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    };

    controls.forEach((control, index) => control.addEventListener("click", () => {
      render(index);
      start();
    }));
    visual.addEventListener("mouseenter", () => { hovered = true; stop(); });
    visual.addEventListener("mouseleave", () => { hovered = false; start(); });
    visual.addEventListener("focusin", () => { focused = true; stop(); });
    visual.addEventListener("focusout", (event) => {
      if (!visual.contains(event.relatedTarget)) {
        focused = false;
        start();
      }
    });
    document.addEventListener("visibilitychange", start);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.18 });
      observer.observe(visual);
    }

    render(0);
    start();
  };

  const renderFeatures = () => {
    const list = root.querySelector("[data-feature-list]");
    if (!list) return;
    const filter = root.querySelector("[data-feature-filter][aria-pressed='true']")?.dataset.featureFilter || "all";
    list.replaceChildren();
    featureRecords
      .filter((record) => filter === "all" || record.status === filter)
      .forEach((record) => {
        const article = make("article", "demo-record");
        article.append(make("p", "record-meta", `${record.status} / ${record.priority} priority`));
        article.append(make("h3", "", record.title));
        article.append(make("p", "", `Owner: ${record.owner}`));
        list.append(article);
      });
    root.querySelector("[data-feature-total]").textContent = String(featureRecords.length);
    root.querySelector("[data-feature-planned]").textContent = String(featureRecords.filter((record) => record.status === "planned").length);
    root.querySelector("[data-feature-reviewed]").textContent = String(featureRecords.filter((record) => record.status === "in review").length);
    root.querySelector("[data-feature-shipped]").textContent = String(featureRecords.filter((record) => record.status === "shipped").length);
  };

  const initFeatureDemo = () => {
    const form = root.querySelector("[data-feature-form]");
    if (!form) return;
    const error = root.querySelector("[data-feature-error]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = String(form.elements.featureTitle.value || "").trim();
      const owner = String(form.elements.featureOwner.value || "").trim();
      const priority = String(form.elements.featurePriority.value || "medium");
      if (title.length < 4) {
        error.textContent = "Add a feature name with at least four characters.";
        form.elements.featureTitle.focus();
        return;
      }
      if (!owner) {
        error.textContent = "An owner keeps the hand-off boundary explicit.";
        form.elements.featureOwner.focus();
        return;
      }
      featureRecords.unshift({ title, owner, priority, status: "planned" });
      error.textContent = "Feature added to the local review queue.";
      form.reset();
      renderFeatures();
    });
    root.querySelectorAll("[data-feature-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-feature-filter]").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
        renderFeatures();
      });
    });
    renderFeatures();
  };

  const rescueSamples = [
    {
      title: "Async state guard",
      summary: "A late response can overwrite the result for a newer request.",
      before: "let requestId = 0;\nasync function loadPreview(url) {\n  const response = await fetch(url);\n  preview.textContent = await response.text();\n}",
      after: "let requestId = 0;\nasync function loadPreview(url) {\n  const current = ++requestId;\n  const response = await fetch(url);\n  const body = await response.text();\n  if (current === requestId) preview.textContent = body;\n}",
      checks: ["A request token changes for every load.", "The response is read before the state guard.", "A stale response cannot replace the newest preview."],
    },
    {
      title: "Input boundary",
      summary: "A generated handler trusts a caller-controlled identifier.",
      before: "async function getWorkspace(id) {\n  return db.workspace.findUnique({\n    where: { id }\n  });\n}",
      after: "async function getWorkspace(userId, id) {\n  return db.workspace.findFirst({\n    where: { id, members: { some: { userId } } }\n  });\n}",
      checks: ["The caller identity is part of the function contract.", "The query scopes the record to membership.", "A missing or unauthorized record can resolve to null."],
    },
    {
      title: "Validation path",
      summary: "A catch block hides malformed input as a generic server error.",
      before: "try {\n  const payload = JSON.parse(body);\n  return save(payload);\n} catch {\n  return { status: 500 };\n}",
      after: "let payload;\ntry {\n  payload = JSON.parse(body);\n} catch {\n  return { status: 400, error: \"Invalid JSON\" };\n}\nreturn save(payload);",
      checks: ["Malformed input returns a client-visible 400 path.", "Persistence only runs after parsing succeeds.", "The error is specific enough to debug without a stack leak."],
    },
  ];

  const initRescueDemo = () => {
    const choices = root.querySelectorAll("[data-rescue-choice]");
    if (!choices.length) return;
    let selected = 0;
    let repaired = false;
    const title = root.querySelector("[data-rescue-title]");
    const summary = root.querySelector("[data-rescue-summary]");
    const code = root.querySelector("[data-rescue-code]");
    const checks = root.querySelector("[data-rescue-checks]");
    const toggle = root.querySelector("[data-rescue-toggle]");
    const result = root.querySelector("[data-rescue-result]");
    const render = () => {
      const sample = rescueSamples[selected];
      title.textContent = sample.title;
      summary.textContent = sample.summary;
      code.textContent = repaired ? sample.after : sample.before;
      toggle.textContent = repaired ? "Show before code" : "Show repaired code";
      checks.replaceChildren();
      sample.checks.forEach((check, index) => {
        const row = make("p", `rescue-check${repaired || index === 0 ? "" : " fail"}`, check);
        checks.append(row);
      });
      result.textContent = repaired ? `${sample.checks.length} deterministic checks passed for this representative repair.` : "Before repair: inspect the boundary, then run the repaired version.";
      choices.forEach((choice, index) => choice.setAttribute("aria-pressed", String(index === selected)));
    };
    choices.forEach((choice, index) => choice.addEventListener("click", () => { selected = index; repaired = false; render(); }));
    toggle.addEventListener("click", () => { repaired = !repaired; render(); });
    render();
  };

  const initReliabilityDemo = () => {
    const run = root.querySelector("[data-reliability-run]");
    const steps = [...root.querySelectorAll("[data-reliability-step]")];
    const output = root.querySelector("[data-reliability-output]");
    if (!run || !steps.length) return;
    run.addEventListener("click", () => {
      run.disabled = true;
      output.textContent = "Simulation is running through the controlled recovery path...";
      steps.forEach((step) => step.setAttribute("data-state", "idle"));
      steps.forEach((step, index) => {
        window.setTimeout(() => {
          step.setAttribute("data-state", "running");
          window.setTimeout(() => {
            step.setAttribute("data-state", "pass");
            if (index === steps.length - 1) {
              output.textContent = "Simulation complete: health gate, queue retry, restore gate, and rollback check all passed. No external system was touched.";
              run.disabled = false;
            }
          }, 420);
        }, index * 620);
      });
    });
  };

  initHeroSequence();
  initFeatureDemo();
  initRescueDemo();
  initReliabilityDemo();
})();
