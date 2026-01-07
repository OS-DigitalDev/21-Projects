const schema = [
  {
    id: "identity",
    title: "Identity",
    fields: [
      {
        key: "fullName",
        label: "Full name",
        type: "text",
        placeholder: "Ada Lovelace",
      },
      {
        key: "role",
        label: "Professional title",
        type: "text",
        placeholder: "Computing Pioneer",
      },
      {
        key: "summary",
        label: "Summary",
        type: "textarea",
        placeholder: "2-3 sentence professional snapshot",
        rows: 3,
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    fields: [
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "ada@example.com",
      },
      { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 0100" },
      {
        key: "location",
        label: "Location",
        type: "text",
        placeholder: "London, UK",
      },
      {
        key: "website",
        label: "Portfolio / Website",
        type: "url",
        placeholder: "https://",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    fields: [
      {
        key: "skills",
        label: "Key skills (comma separated)",
        type: "text",
        placeholder: "Systems design, Data viz, Leadership",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    repeatable: true,
    fields: [
      { key: "company", label: "Company", type: "text" },
      { key: "title", label: "Role", type: "text" },
      {
        key: "period",
        label: "Period",
        type: "text",
        placeholder: "2022 - Present",
      },
      {
        key: "highlights",
        label: "Highlights (bullet per line)",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    repeatable: true,
    fields: [
      { key: "school", label: "Institution", type: "text" },
      { key: "degree", label: "Degree", type: "text" },
      { key: "period", label: "Period", type: "text" },
      { key: "details", label: "Details", type: "textarea", rows: 2 },
    ],
  },
];

const customSections = [];

const templates = {
  minimal: {
    label: "Minimal",
    className: "template-minimal",
    render: (data) => `
      <header>
        <h1>${data.fullName || "Your Name"}</h1>
        <p class="text-muted">${data.role || "Title"}</p>
        <p>${joinValues(
          [data.email, data.phone, data.location, data.website],
          " · "
        )}</p>
      </header>
      <section>
        <h2>Summary</h2>
        <p>${data.summary || defaultSummary()}</p>
      </section>
      ${drawListSection(
        "Experience",
        data.experience,
        (item) => `
          <div class="mb-3">
            <strong>${item.title || "Role"}</strong> — ${
          item.company || "Company"
        }
            <div class="text-muted">${item.period || "Timeline"}</div>
            ${drawHighlights(item.highlights)}
          </div>
      `
      )}
      ${drawListSection(
        "Education",
        data.education,
        (item) => `
          <div class="mb-3">
            <strong>${item.degree || "Degree"}</strong>, ${
          item.school || "School"
        }
            <div class="text-muted">${item.period || "Timeline"}</div>
            <p>${item.details || ""}</p>
          </div>
      `
      )}
      ${drawSkills(data.skillsArray)}
      ${drawCustomSections(data)}
    `,
  },
  card: {
    label: "Card",
    className: "template-card",
    render: (data) => `
      <header class="mb-4">
        <h1>${data.fullName || "Your Name"}</h1>
        <p class="lead mb-2">${data.role || "Title"}</p>
        <div class="d-flex flex-wrap gap-2 text-muted">
          ${drawBadges(
            cleanValues([data.email, data.phone, data.location, data.website])
          )}
        </div>
      </header>
      <section class="mb-4">
        <h2>About</h2>
        <p>${data.summary || defaultSummary()}</p>
      </section>
      <section class="mb-4">
        <h2>Experience</h2>
        ${drawCardList(
          data.experience,
          (item) => `
            <div>
              <div class="fw-semibold">${item.title || "Role"}</div>
              <div class="text-muted small">${item.company || "Company"} · ${
            item.period || "Timeline"
          }</div>
              ${drawHighlights(item.highlights)}
            </div>
        `
        )}
      </section>
      <section class="mb-4">
        <h2>Education</h2>
        ${drawCardList(
          data.education,
          (item) => `
            <div>
              <div class="fw-semibold">${item.degree || "Degree"}</div>
              <div class="text-muted small">${item.school || "School"} · ${
            item.period || "Timeline"
          }</div>
              <p class="mb-0">${item.details || ""}</p>
            </div>
        `
        )}
      </section>
      ${drawSkills(data.skillsArray)}
      ${drawCustomSections(data)}
    `,
  },
};

const state = {
  data: {},
  templateKey: "minimal",
  pageColor: "#ffffff",
  textColor: "#000000",
};

const EXPORT_STYLES = `
  body { font-family: "Inter","Segoe UI",system-ui,-apple-system,sans-serif; margin: 0; padding: 2rem; }
  h1 { font-size: 2rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1.1rem; letter-spacing: 0.08em; text-transform: uppercase; color: #0d6efd; margin-top: 1.5rem; }
  ul { padding-left: 1.2rem; }
  .badge-skill { background: rgba(13,110,253,.12); color: #0d6efd; margin: 0.1rem; padding: 0.25rem 0.75rem; border-radius: 999px; display: inline-block; }
  .template-minimal { border-left: 4px solid #0d6efd; padding-left: 1.5rem; }
  .template-card { border: 1px solid #e9ecef; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05); }
  .export-card { border: 1px solid #e9ecef; border-radius: .75rem; padding: 1rem; margin-bottom: 1rem; background: #f8f9fa; }
`;

const form = document.getElementById("resumeForm");
const preview = document.getElementById("resumePreview");
const templateSelect = document.getElementById("templateSelect");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const templatePills = document.getElementById("templatePills");
const templateCount = document.getElementById("templateCount");
const sectionCount = document.getElementById("sectionCount");
const fieldProgress = document.getElementById("fieldProgress");
const sectionNav = document.getElementById("sectionNav");
const liveMeta = document.getElementById("liveMeta");
const previewPane = document.querySelector(".preview-pane");
const previewBgButtons = document.querySelectorAll("[data-preview-bg]");
const themeToggle = document.getElementById("themeToggle");
const pageColorPicker = document.getElementById("pageColorPicker");
const textColorPicker = document.getElementById("textColorPicker");
const addSectionBtn = document.getElementById("addSectionBtn");
const sectionModal = document.getElementById("sectionModal");
const sectionNameInput = document.getElementById("sectionNameInput");
const confirmAddSection = document.getElementById("confirmAddSection");

const collections = {};
const navButtons = new Map();
const templateButtons = new Map();
let sectionObserver;

startApp();

function startApp() {
  // Role: bootstraps templates, form, bindings, and initial render.
  setupTemplates();
  buildForm();
  bindUI();
  bindColorPickers();
  bindCustomSectionBtn();
  setPreviewBg("plain");
  markTemplate(state.templateKey);
  drawPreview();
  refreshStats();
}

function setupTemplates() {
  // Role: fills template selector + pills and hooks template switching.
  templateSelect.innerHTML = "";
  if (templatePills) {
    templatePills.innerHTML = "";
  }

  Object.entries(templates).forEach(([key, template]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = template.label;
    templateSelect.appendChild(option);

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "template-pill";
    pill.textContent = template.label;
    pill.addEventListener("click", () => {
      state.templateKey = key;
      templateSelect.value = key;
      markTemplate(key);
      drawPreview();
    });
    templatePills?.appendChild(pill);
    templateButtons.set(key, pill);
  });

  templateSelect.value = state.templateKey;
  templateSelect.addEventListener("change", (e) => {
    state.templateKey = e.target.value;
    markTemplate(state.templateKey);
    drawPreview();
  });
}

function buildForm() {
  // Role: builds schema-driven form sections and observers.
  sectionObserver = new IntersectionObserver(watchSections, {
    root: null, // root: null means the browser viewport acts as the observation root.
    threshold: 0.35, // threshold: callback fires when 35% of the section is visible.
  });

  const allSections = [...schema, ...customSections];
  allSections.forEach((section) => {
    const wrapper = document.createElement("section");
    wrapper.className = "vstack gap-3 border-bottom pb-4";
    wrapper.dataset.section = section.id;
    wrapper.id = section.id;

    const heading = document.createElement("div");
    heading.className = "form-section-title";
    heading.textContent = section.title;
    wrapper.appendChild(heading);

    if (section.repeatable) {
      const collection = document.createElement("div");
      collection.className = "vstack gap-3";
      collection.dataset.collection = section.id;
      collections[section.id] = collection;
      wrapper.appendChild(collection);

      const controls = document.createElement("div");
      controls.className = "d-flex justify-content-end";
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn btn-sm btn-outline-primary";
      addBtn.textContent = `Add ${section.title}`;
      addBtn.addEventListener("click", () => addRepeater(section, collection));
      controls.appendChild(addBtn);
      wrapper.appendChild(controls);

      addRepeater(section, collection);
    } else {
      const sectionBody = document.createElement("div");
      sectionBody.className = "vstack gap-3";
      section.fields.forEach((field) => {
        sectionBody.appendChild(buildField(section, field));
      });
      wrapper.appendChild(sectionBody);
    }

    form.appendChild(wrapper);
    addSectionLink(section);
    sectionObserver.observe(wrapper);
  });
}

function addCustomSection(sectionName) {
  // Role: creates a new custom section and adds it to the form
  const newSection = {
    id: sectionName.toLowerCase().replace(/\s+/g, "-"),
    title: sectionName,
    repeatable: true,
    isCustom: true,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "details", label: "Details", type: "textarea", rows: 2 },
    ],
  };
  
  customSections.push(newSection);
  
  // Add to form
  const wrapper = document.createElement("section");
  wrapper.className = "vstack gap-3 border-bottom pb-4";
  wrapper.dataset.section = newSection.id;
  wrapper.id = newSection.id;

  const heading = document.createElement("div");
  heading.className = "form-section-title d-flex justify-content-between align-items-center";
  heading.innerHTML = `
    <span>${newSection.title}</span>
    <button type="button" class="btn btn-sm btn-outline-danger" data-section-id="${newSection.id}">Remove</button>
  `;
  wrapper.appendChild(heading);
  
  heading.querySelector("button").addEventListener("click", () => removeCustomSection(newSection.id));

  const collection = document.createElement("div");
  collection.className = "vstack gap-3";
  collection.dataset.collection = newSection.id;
  collections[newSection.id] = collection;
  wrapper.appendChild(collection);

  const controls = document.createElement("div");
  controls.className = "d-flex justify-content-end";
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "btn btn-sm btn-outline-primary";
  addBtn.textContent = `Add ${newSection.title}`;
  addBtn.addEventListener("click", () => addRepeater(newSection, collection));
  controls.appendChild(addBtn);
  wrapper.appendChild(controls);

  addRepeater(newSection, collection);

  form.appendChild(wrapper);
  addSectionLink(newSection);
  sectionObserver.observe(wrapper);
}

function removeCustomSection(sectionId) {
  // Role: removes a custom section from form and data
  const sectionIndex = customSections.findIndex(s => s.id === sectionId);
  if (sectionIndex > -1) {
    customSections.splice(sectionIndex, 1);
  }
  
  const sectionElement = document.getElementById(sectionId);
  if (sectionElement) {
    sectionElement.remove();
  }
  
  const navBtn = navButtons.get(sectionId);
  if (navBtn) {
    navBtn.remove();
    navButtons.delete(sectionId);
  }
  
  if (state.data[sectionId]) {
    delete state.data[sectionId];
  }
  
  drawPreview();
  refreshStats();
}

function buildField(section, field, index = null) {
  // Role: creates a single input/textarea for the form schema.
  const fieldId =
    index !== null
      ? `${section.id}-${field.key}-${index}`
      : `${section.id}-${field.key}`;
  const container = document.createElement("div");

  const label = document.createElement("label");
  label.className = "form-label small text-uppercase text-muted";
  label.htmlFor = fieldId;
  label.textContent = field.label;

  let input;
  if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = field.rows || 4;
    input.className = "form-control";
  } else {
    input = document.createElement("input");
    input.type = field.type;
    input.className = "form-control";
  }
  input.placeholder = field.placeholder || "";
  input.id = fieldId;
  input.dataset.section = section.id;
  input.dataset.key = field.key;
  if (index !== null) {
    input.dataset.index = index;
  }
  input.addEventListener("input", handleInput);

  container.appendChild(label);
  container.appendChild(input);
  return container;
}

function handleInput(event) {
  // Role: syncs user input into state then refreshes preview stats.
  const { section, key, index } = event.target.dataset;
  const value = event.target.value;

  if (isRepeater(section)) {
    const idx = Number(index);
    state.data[section] = state.data[section] || [];
    state.data[section][idx] = state.data[section][idx] || {};
    state.data[section][idx][key] = value;
  } else {
    state.data[key] = value;
  }
  drawPreview();
  refreshStats();
}

function isRepeater(sectionId) {
  return [...schema, ...customSections]
    .find(section => section.id === sectionId)?.repeatable;
}


function addRepeater(section, collection) {
  // Role: inserts a repeatable section card with inputs.
  const index = collection.childElementCount;
  const card = document.createElement("div");
  card.className = "border rounded-3 p-3 bg-light position-relative";
  card.dataset.index = index;

  section.fields.forEach((field) => {
    card.appendChild(buildField(section, field, index));
  });

  if (index > 0) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-close position-absolute top-0 end-0 m-2";
    removeBtn.addEventListener("click", () => removeRepeater(section.id, card));
    card.appendChild(removeBtn);
  }

  collection.appendChild(card);
}

function removeRepeater(sectionId, card) {
  const collection = card.parentElement;
  collection.removeChild(card);
  Array.from(collection.children).forEach((child, idx) => {
    child.dataset.index = idx;
    child.querySelectorAll("[data-index]").forEach((input) => {
      input.dataset.index = idx;
    });
  });
  if (state.data[sectionId]) {
    state.data[sectionId].splice(Number(card.dataset.index), 1);
  }
  drawPreview();
  refreshStats();
}

function drawPreview() {
  // Role: regenerates the resume preview pane HTML.
  const template = templates[state.templateKey];
  const prepared = prepareData();
  preview.className = `resume-preview ${template.className}`;
  preview.innerHTML = template.render(prepared);
  refreshMeta();
}

function prepareData() {
  // Role: normalizes state into template-friendly data.
  const payload = { ...state.data };
  payload.skillsArray = (payload.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  payload.experience = (payload.experience || []).map((item = {}) => ({
    ...item,
    highlights: (item.highlights || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  }));

  payload.education = (payload.education || []).map((item = {}) => ({
    ...item,
  }));

  // Add custom sections to payload
  customSections.forEach((section) => {
  payload[section.id] = (state.data[section.id] || []).map(item => ({
    title: item.title || "",
    details: item.details || ""
  }));
});


  return payload;
}

function drawListSection(title, items = [], renderer) {
  // Role: renders a titled list-style resume section.
  if (!items.length) return "";
  return `
    <section>
      <h2>${title}</h2>
      ${items.map(renderer).join("")}
    </section>
  `;
}

function drawCardList(items = [], renderer) {
  if (!items.length)
    return `<p class="text-muted">Add entries in the form.</p>`;
  return items
    .map(
      (item) => `
      <div class="border rounded-3 p-3 mb-3 bg-light export-card">
        ${renderer(item)}
      </div>
    `
    )
    .join("");
}

function drawHighlights(highlights = []) {
  const filtered = (Array.isArray(highlights) ? highlights : [])
    .map((line) => line.trim())
    .filter(Boolean);
  if (!filtered.length) return "";
  return `
    <ul>
      ${filtered.map((line) => `<li>${line}</li>`).join("")}
    </ul>
  `;
}

function drawSkills(skills = []) {
  if (!skills?.length) return "";
  return `
    <section>
      <h2>Skills</h2>
      <div class="d-flex flex-wrap">
        ${skills
          .map(
            (skill) =>
              `<span class="badge rounded-pill badge-skill">${skill}</span>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function drawCustomSections(data) {
  let html = "";

  customSections.forEach((section) => {
    const items = data[section.id];

    if (!Array.isArray(items) || items.length === 0) return;

    html += `
      <section>
        <h2>${section.title}</h2>
        ${items
          .map(
            (item) => `
              <div class="mb-3">
                <div class="fw-semibold">${item.title || ""}</div>
                ${item.details ? `<p>${item.details}</p>` : ""}
              </div>
            `
          )
          .join("")}
      </section>
    `;
  });

  return html;
}


function drawBadges(items) {
  if (!items.length) return "";
  return items
    .map((item) => `<span class="badge text-bg-light">${item}</span>`)
    .join("");
}

function joinValues(values, separator = " ") {
  return values.filter(Boolean).join(separator);
}

function cleanValues(values = []) {
  return values.filter(Boolean);
}

function defaultSummary() {
  // Role: returns fallback copy for empty summaries.
  return "Seasoned professional focused on measurable business value and elegant systems.";
}

function bindUI() {
  if (templateCount) {
    templateCount.textContent = Object.keys(templates).length;
  }
  if (sectionCount) {
    sectionCount.textContent = schema.length;
  }

  previewBgButtons.forEach((btn) =>
    btn.addEventListener("click", () => setPreviewBg(btn.dataset.previewBg))
  );

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function markTemplate(key) {
  // Role: highlights the active template pill button.
  templateButtons.forEach((pill, templateKey) => {
    pill.classList.toggle("active", templateKey === key);
  });
}

function addSectionLink(section) {
  // Role: adds a nav button for a form section.
  if (!sectionNav) return;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = section.title;
  button.addEventListener("click", () => {
    document.getElementById(section.id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
  sectionNav.appendChild(button);
  navButtons.set(section.id, button);
}

function watchSections(entries) {
  // Role: tracks which section is within view.
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setActiveSection(entry.target.id);
    }
  });
}

function setActiveSection(sectionId) {
  // Role: marks the nav button that is in view.
  navButtons.forEach((button, id) => {
    button.classList.toggle("active", id === sectionId);
  });
}

function setPreviewBg(mode) {
  // Role: changes preview background treatment.
  previewBgButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.previewBg === mode)
  );
  if (!previewPane) return;
  previewPane.classList.remove("grid", "slate");
  if (mode === "grid") {
    previewPane.classList.add("grid");
  }
  if (mode === "slate") {
    previewPane.classList.add("slate");
  }
}

function bindColorPickers() {
  // Role: binds color picker inputs to page styling
  if (pageColorPicker) {
    pageColorPicker.addEventListener("input", (e) => {
      state.pageColor = e.target.value;
      applyCustomColors();
    });
  }
  
  if (textColorPicker) {
    textColorPicker.addEventListener("input", (e) => {
      state.textColor = e.target.value;
      applyCustomColors();
    });
  }
}

function applyCustomColors() {
  // Role: applies custom page and text colors to the preview
  const resumePreview = document.getElementById("resumePreview");
  if (resumePreview) {
    resumePreview.style.backgroundColor = state.pageColor;
    resumePreview.style.color = state.textColor;
  }
}

function bindCustomSectionBtn() {
  // Role: binds add custom section button
  if (addSectionBtn) {
    addSectionBtn.addEventListener("click", () => {
      if (sectionModal) {
        const modal = new bootstrap.Modal(sectionModal);
        modal.show();
      }
    });
  }
  
  if (confirmAddSection) {
    confirmAddSection.addEventListener("click", () => {
      const sectionName = (sectionNameInput?.value || "").trim();
      if (sectionName) {
        addCustomSection(sectionName);
        sectionNameInput.value = "";
        const modal = bootstrap.Modal.getInstance(sectionModal);
        modal?.hide();
        drawPreview();
        refreshStats();
      }
    });
  }
}

function toggleTheme() {
  // Role: flips between light and dark theme modes.
  const enableDark = document.body.dataset.mode !== "dark";
  document.body.dataset.mode = enableDark ? "dark" : "";
  themeToggle.textContent = enableDark ? "Dark mode" : "Light mode";
}

function syncForm() {
  // Role: pushes current state values back into inputs.
  Object.entries(collections).forEach(([sectionId, collection]) => {
    const targetLength = (state.data[sectionId] || []).length || 1;
    const section =
      schema.find(s => s.id === sectionId) ||
      customSections.find(s => s.id === sectionId);

    while (collection.childElementCount < targetLength) {
      addRepeater(section, collection);
    }
  });

  form.querySelectorAll("[data-key]").forEach((input) => {
    const { section, key, index } = input.dataset;
    if (isRepeater(section)) {
      const entries = state.data[section] || [];
      const value = entries?.[Number(index)]?.[key] || "";
      input.value = value;
    } else {
      input.value = state.data[key] || "";
    }
  });
}

function refreshStats() {
  // Role: updates completion metrics and meta text.
  const filled = countFilled();
  if (fieldProgress) {
    fieldProgress.textContent = filled;
  }
  refreshSections();
  refreshMeta();
}

function countFilled() {
  // Role: counts how many inputs currently have text.
  let filled = 0;
  form
    .querySelectorAll("input[data-key], textarea[data-key]")
    .forEach((input) => {
      if (input.value.trim()) {
        filled += 1;
      }
    });
  return filled;
}

function refreshSections() {
  // Role: toggles nav pill completion styling.
  [...schema, ...customSections].forEach(section => {

    const complete = sectionHasData(section);
    const navButton = navButtons.get(section.id);
    if (navButton) {
      navButton.classList.toggle("is-complete", complete);
    }
  });
}

function sectionHasData(section) {
  // Role: returns true when any fields in section are filled.
  if (section.repeatable) {
    return (state.data[section.id] || []).some((entry) =>
      section.fields.some((field) => String(entry?.[field.key] || "").trim()
)
    );
  }
  return section.fields.some((field) => state.data[field.key]?.trim());
}

function refreshMeta() {
  // Role: updates the live preview header meta copy.
  const completed = schema.filter(sectionHasData).length;
  const filled = countFilled();
  if (liveMeta) {
    liveMeta.textContent = `${completed}/${schema.length} sections ready · ${filled} fields filled`;
  }
}



function buildExportNode(template, prepared) {
  const node = document.createElement("div");
  node.className = `resume-preview ${template.className}`;
  node.style.position = "absolute";
  node.style.left = "-9999px";
  node.style.top = "0";
  node.style.width = "794px";
  node.style.background = "#ffffff";
  node.style.padding = "48px";
  node.style.boxSizing = "border-box";

  if (exportState.branding) {
    const brand = document.createElement("img");
    brand.src = "branding.jpg";
    brand.style.position = "absolute";
    brand.style.top = "24px";
    brand.style.right = "24px";
    brand.style.width = "80px";
    brand.style.opacity = "0.85";
    node.appendChild(brand);
  }

  const content = document.createElement("div");
  content.innerHTML = template.render(prepared);
  node.appendChild(content);

  return node;
}


function waitFrame() {
  // Role: waits one animation frame for layout.
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}




if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    form.reset();
    state.data = {};
    Object.entries(collections).forEach(([sectionId, collection]) => {
      collection.innerHTML = "";
      const section = schema.find((s) => s.id === sectionId);
      addRepeater(section, collection);
    });
    drawPreview();
    refreshStats();
  });
}

const exportState = {
  format: "pdf",
  quality: "high",
  branding: true
};



document.getElementById("exportQuality").addEventListener("change", e => {
  exportState.quality = e.target.value;
});

document.getElementById("brandingToggle").addEventListener("change", e => {
  exportState.branding = e.target.checked;
  document.getElementById("brandingImage").style.display =
    exportState.branding ? "block" : "none";
});

document.querySelectorAll(".format-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    exportState.format = btn.dataset.format;

    document
      .querySelectorAll(".format-btn")
      .forEach(b => b.classList.remove("btn-primary"));

    btn.classList.add("btn-primary");

    renderPreview();
  });
});

function buildPreviewNode(template, prepared) {
  const node = document.createElement("div");
  node.className = `resume-preview ${template.className}`;
  node.innerHTML = template.render(prepared);
  return node;
}



function renderPreview() {
  const template = templates[state.templateKey];
  const prepared = prepareData();

  const preview = document.getElementById("previewContent");
  preview.innerHTML = "";
  preview.appendChild(buildPreviewNode(template, prepared));
}

async function savePdf() {
  const template = templates[state.templateKey];
  const prepared = prepareData();

  const exportNode = buildExportNode(template, prepared);
  document.body.appendChild(exportNode);

  const scale = exportState.quality === "high" ? 2 : 1.2;

  try {
    const canvas = await html2canvas(exportNode, {
      scale,
      backgroundColor: "#fff",
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("p", "pt", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${prepared.fullName || "resume"}.pdf`);
  } finally {
    document.body.removeChild(exportNode);
  }
}

function saveHtml(template, prepared) {
  // Role: downloads HTML when PDF export fails.
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${
    prepared.fullName || "resume"
  }</title><style>${EXPORT_STYLES}</style></head><body class="${
    template.className
  }">${template.render(prepared)}</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(prepared.fullName || "resume").replace(
    /\s+/g,
    "-"
  )}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
function saveWord(template, prepared) {
  const node = buildExportNode(template, prepared);

  const html = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>${node.outerHTML}</body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/msword" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "resume.doc";
  a.click();
}
document.getElementById("confirmExport").addEventListener("click", async () => {
  const status = document.getElementById("exportStatus");
  status.textContent = "Preparing download...";

  if (exportState.format === "pdf") {
    await savePdf();
  } else if (exportState.format === "html") {
    saveHtml(templates[state.templateKey], prepareData());
  } else {
    saveWord(templates[state.templateKey], prepareData());
  }

  status.textContent = "";
});
