const LAST_DRAFT_KEY = "astral-signals:last-draft";
const UI_MODE_KEY = "astral-signals:ui-mode";

const byId = (id) => document.getElementById(id);

const form = byId("generatorForm");
const composeButton = byId("composeButton");
const compareButton = byId("compareButton");
const generateButton = byId("generateButton");
const saveDraftButton = byId("saveDraftButton");
const newDraftButton = byId("newDraftButton");
const deleteDraftButton = byId("deleteDraftButton");
const splitButton = byId("splitButton");
const remixButton = byId("remixButton");
const matchButton = byId("matchButton");
const copyLyricsButton = byId("copyLyricsButton");
const previewVoiceButton = byId("previewVoiceButton");
const fillPreviewLyricButton = byId("fillPreviewLyricButton");
const previewAliceVoiceboxButton = byId("previewAliceVoiceboxButton");
const composeVariantsField = byId("compose_variants");
const refreshCloneProfilesButton = byId("refreshCloneProfilesButton");
const createCloneProfileButton = byId("createCloneProfileButton");
const addCloneSampleButton = byId("addCloneSampleButton");
const previewCloneButton = byId("previewCloneButton");
const railComposeButton = byId("railComposeButton");
const railCompareButton = byId("railCompareButton");
const railGenerateButton = byId("railGenerateButton");
const railPreviewVoiceButton = byId("railPreviewVoiceButton");
const railAliceVoiceboxButton = byId("railAliceVoiceboxButton");

const statusLine = byId("statusLine");
const toolStatusLine = byId("toolStatusLine");
const results = byId("results");
const stemResults = byId("stemResults");
const remixResults = byId("remixResults");
const alignmentResults = byId("alignmentResults");
const voicePreviewResults = byId("voicePreviewResults");
const cloneResults = byId("cloneResults");
const aliceLabResults = byId("aliceLabResults");
const resolvedPrompt = byId("resolvedPrompt");
const resolvedLyrics = byId("resolvedLyrics");
const planSummary = byId("planSummary");
const systemBadge = byId("systemBadge");
const autosaveStatus = byId("autosaveStatus");
const draftName = byId("draftName");
const draftSelect = byId("draftSelect");
const voicePreview = byId("voicePreview");
const cloneProfileMeta = byId("cloneProfileMeta");
const presetRail = byId("presetRail");
const aliceProfileRail = byId("aliceProfileRail");
const modeSwitch = byId("modeSwitch");
const composerModelNote = byId("composerModelNote");
const railModelSummary = byId("railModelSummary");
const voiceboxProfileMeta = byId("voiceboxProfileMeta");
const aliceLabMeta = byId("aliceLabMeta");
const engineCatalog = byId("engineCatalog");
const engineLabMeta = byId("engineLabMeta");

const sliderMirrors = [
  ["duration", "durationValue", (value) => `${value}s`],
  ["candidates", "candidatesValue", (value) => value],
  ["alice_autonomy", "aliceAutonomyValue", (value) => value],
  ["breathiness", "breathinessValue", (value) => value],
  ["brightness", "brightnessValue", (value) => value],
  ["vocal_power", "vocalPowerValue", (value) => value],
  ["vibrato", "vibratoValue", (value) => value],
  ["intimacy", "intimacyValue", (value) => value],
  ["singer_b_breathiness", "singerBBreathinessValue", (value) => value],
  ["singer_b_brightness", "singerBBrightnessValue", (value) => value],
  ["singer_b_vocal_power", "singerBVocalPowerValue", (value) => value],
  ["singer_b_vibrato", "singerBVibratoValue", (value) => value],
  ["singer_b_intimacy", "singerBIntimacyValue", (value) => value],
  ["singer_c_breathiness", "singerCBreathinessValue", (value) => value],
  ["singer_c_brightness", "singerCBrightnessValue", (value) => value],
  ["singer_c_vocal_power", "singerCVocalPowerValue", (value) => value],
  ["singer_c_vibrato", "singerCVibratoValue", (value) => value],
  ["singer_c_intimacy", "singerCIntimacyValue", (value) => value],
  ["preview_duration", "previewDurationValue", (value) => `${value}s`],
  ["vocals_gain_db", "vocalsGainValue", (value) => `${value} dB`],
  ["instrumental_gain_db", "instrumentalGainValue", (value) => `${value} dB`],
];

let autosaveTimer = null;
let isHydrating = false;
let currentDraftId = "";
let latestComposeVariants = [];
const extraSingerIds = ["singer_b", "singer_c"];
let uiMode = "quick";
let latestCatalog = null;

function setStatus(message) {
  statusLine.textContent = message;
}

function setToolStatus(message) {
  toolStatusLine.textContent = message;
}

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = value ?? "";
  return node.innerHTML;
}

function nl2br(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let amount = value;
  let unitIndex = 0;
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }
  const digits = amount >= 10 || unitIndex === 0 ? 0 : 1;
  return `${amount.toFixed(digits)} ${units[unitIndex]}`;
}

function formatErrorMessage(errorBody, statusCode) {
  if (!errorBody) {
    return `Request failed with ${statusCode}`;
  }

  try {
    const parsed = JSON.parse(errorBody);
    if (Array.isArray(parsed.detail)) {
      return parsed.detail
        .map((item) => {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "field";
          return `${field}: ${item.msg}`;
        })
        .join("\n");
    }
    if (typeof parsed.detail === "string" && parsed.detail.trim()) {
      return parsed.detail;
    }
  } catch (error) {
    return errorBody;
  }

  return errorBody;
}

function updateSliderMirrors() {
  sliderMirrors.forEach(([inputId, outputId, formatter]) => {
    const input = byId(inputId);
    const output = byId(outputId);
    if (input && output) {
      output.textContent = formatter(input.value);
    }
  });
}

function setUiMode(mode, { persist = true } = {}) {
  uiMode = mode === "studio" ? "studio" : "quick";
  document.body.dataset.uiMode = uiMode;
  modeSwitch?.querySelectorAll("[data-ui-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.uiMode === uiMode);
  });
  if (persist) {
    localStorage.setItem(UI_MODE_KEY, uiMode);
  }
}

function restoreUiMode() {
  setUiMode(localStorage.getItem(UI_MODE_KEY) || "quick", { persist: false });
}

function populateModelSelect(selectId, options = [], defaultValue = "") {
  const select = byId(selectId);
  if (!select) return;

  const pendingValue = select.dataset.pendingValue || "";
  const currentValue = pendingValue || select.value || defaultValue || "";
  select.innerHTML = "";

  const usableOptions = Array.isArray(options) && options.length
    ? options
    : [{ id: defaultValue || "", label: defaultValue || "Default", description: "" }];

  usableOptions.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id || item.label || "";
    option.textContent = item.label || item.id || "Unnamed model";
    if (item.description) {
      option.dataset.description = item.description;
    }
    if (item.backend) {
      option.dataset.backend = item.backend;
    }
    if (item.status) {
      option.dataset.status = item.status;
    }
    if (item.capabilities) {
      option.dataset.capabilities = Array.isArray(item.capabilities) ? item.capabilities.join(", ") : item.capabilities;
    }
    option.disabled = Boolean(item.disabled);
    select.appendChild(option);
  });

  if (currentValue && ![...select.options].some((option) => option.value === currentValue)) {
    const fallback = document.createElement("option");
    fallback.value = currentValue;
    fallback.textContent = `${currentValue} (saved)`;
    fallback.dataset.description = "Saved selection not present in the live local catalog.";
    select.appendChild(fallback);
  }

  select.value = currentValue || usableOptions[0]?.id || "";
  if (select.value) {
    select.dataset.pendingValue = select.value;
  }
}

function applyQuickstartPreset(preset = {}) {
  if (!preset) return;
  applyPayload({
    prompt: preset.prompt || "",
    genre: preset.genre || "",
    mood: preset.mood || "",
    vocal_language: preset.vocal_language || "en",
    vocal_mode: preset.vocal_mode || "lyrics",
  });
  setStatus(`Loaded preset: ${preset.label || "Quickstart"}.`);
  scheduleAutosave();
}

function applyAliceProfile(profile = {}) {
  if (!profile) return;
  byId("alice_enabled").checked = true;
  if (profile.autonomy !== undefined) {
    byId("alice_autonomy").value = `${profile.autonomy}`;
  }
  updateSliderMirrors();
  syncAliceLabMeta();
  scheduleAutosave();
  setStatus(`Loaded Alice producer mode: ${profile.label || "Alice mode"}.`);
}

function renderPresetRail(presets = []) {
  if (!presetRail) return;
  if (!Array.isArray(presets) || !presets.length) {
    presetRail.innerHTML = `<span class="microcopy">No quick-start presets available yet.</span>`;
    return;
  }

  presetRail.innerHTML = "";
  presets.forEach((preset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-chip";
    button.dataset.presetId = preset.id || "";
    button.textContent = preset.label || preset.id || "Preset";
    button.title = preset.prompt || preset.label || "Preset";
    presetRail.appendChild(button);
  });
}

function renderAliceProfileRail(profiles = []) {
  if (!aliceProfileRail) return;
  if (!Array.isArray(profiles) || !profiles.length) {
    aliceProfileRail.innerHTML = `<span class="microcopy">No Alice producer modes available yet.</span>`;
    return;
  }

  aliceProfileRail.innerHTML = "";
  profiles.forEach((profile) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-chip";
    button.dataset.aliceProfileId = profile.id || "";
    button.textContent = profile.label || profile.id || "Alice mode";
    button.title = profile.description || profile.label || "Alice mode";
    button.addEventListener("click", () => applyAliceProfile(profile));
    aliceProfileRail.appendChild(button);
  });
}

function renderEngineCatalog(cards = []) {
  if (!engineCatalog) return;
  if (!Array.isArray(cards) || !cards.length) {
    engineCatalog.innerHTML = `<span class="microcopy">No local song engines detected yet.</span>`;
    if (engineLabMeta) {
      engineLabMeta.textContent = "Astral could not load the engine catalog right now.";
    }
    return;
  }

  const readyRenderCount = cards.filter((card) => card.kind === "render" && card.ready).length;
  const optionalCount = cards.filter((card) => !card.ready).length;
  if (engineLabMeta) {
    engineLabMeta.textContent = `${readyRenderCount} live render engine${readyRenderCount === 1 ? "" : "s"} ready. ${optionalCount} additional local lab option${optionalCount === 1 ? "" : "s"} cataloged.`;
  }

  engineCatalog.innerHTML = cards.map((card) => {
    const capabilities = (card.capabilities || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    const useButton = card.ready && card.select_value
      ? `<button type="button" class="button-ghost" data-engine-select="${escapeHtml(card.select_value)}">Use this engine</button>`
      : "";
    const repoLink = card.repo_url
      ? `<a class="button-ghost" href="${escapeHtml(card.repo_url)}" target="_blank" rel="noreferrer">Open repo</a>`
      : "";
    const repoPath = card.repo_dir ? `<p class="engine-meta">Local path: ${escapeHtml(card.repo_dir)}</p>` : "";
    const nextStep = card.next_step ? `<p class="engine-meta"><strong>Next step:</strong> ${escapeHtml(card.next_step)}</p>` : "";
    const limitations = card.limitations ? `<p class="engine-meta"><strong>Limit:</strong> ${escapeHtml(card.limitations)}</p>` : "";
    return `
      <article class="engine-card">
        <header>
          <div>
            <p class="section-tag">${escapeHtml(card.kind === "render" ? "Render Engine" : "Specialist Lab")}</p>
            <h4>${escapeHtml(card.label || "Engine")}</h4>
          </div>
          <span class="engine-status" data-status="${escapeHtml(card.status || "")}">${escapeHtml(card.status_label || "Cataloged")}</span>
        </header>
        <p>${escapeHtml(card.description || "")}</p>
        <div class="engine-capabilities">${capabilities}</div>
        <p class="engine-meta"><strong>Best for:</strong> ${escapeHtml(card.best_for || "")}</p>
        ${limitations}
        ${nextStep}
        ${repoPath}
        <div class="engine-actions">${useButton}${repoLink}</div>
      </article>
    `;
  }).join("");
}

function syncModelSelectionNotes() {
  const composerSelect = byId("ai_model");
  const songSelect = byId("song_model");
  if (!composerSelect || !songSelect || !composerModelNote) return;

  const composerLabel = composerSelect.options[composerSelect.selectedIndex]?.textContent || composerSelect.value || "default composer";
  const composerDescription = composerSelect.options[composerSelect.selectedIndex]?.dataset.description || "";
  const songLabel = songSelect.options[songSelect.selectedIndex]?.textContent || songSelect.value || "default song engine";
  const songDescription = songSelect.options[songSelect.selectedIndex]?.dataset.description || "";
  const songCapabilities = songSelect.options[songSelect.selectedIndex]?.dataset.capabilities || "";
  const songStatus = songSelect.options[songSelect.selectedIndex]?.dataset.status || "";

  const bits = [
    `Composer: ${composerLabel}`,
    composerDescription,
    `Song engine: ${songLabel}`,
    songDescription,
    songCapabilities ? `Capabilities: ${songCapabilities}` : "",
    songStatus ? `State: ${songStatus}` : "",
  ].filter(Boolean);

  const aliceDepthHint = latestCatalog?.composer_models?.some((model) => model.id === "qwen3.5:9b")
    ? "Tip: qwen3.5:9b gives Alice more arrangement depth; qwen3:4b is faster."
    : "";

  composerModelNote.textContent = [bits.join(" | "), aliceDepthHint].filter(Boolean).join(" | ");
  if (railModelSummary) {
    const catalogBits = [];
    if (latestCatalog?.composer_models?.length) {
      catalogBits.push(`${latestCatalog.composer_models.length} composer model${latestCatalog.composer_models.length === 1 ? "" : "s"}`);
    }
    const readySongModels = Array.isArray(latestCatalog?.song_models)
      ? latestCatalog.song_models.filter((item) => !item.disabled).length
      : 0;
    if (readySongModels) {
      catalogBits.push(`${readySongModels} live song engine option${readySongModels === 1 ? "" : "s"}`);
    }
    railModelSummary.textContent = `${bits.join(" | ")}${catalogBits.length ? ` | Catalog: ${catalogBits.join(", ")}` : ""}${aliceDepthHint ? ` | ${aliceDepthHint}` : ""}`;
  }
}

function syncSelectedEngineBehavior() {
  const songSelect = byId("song_model");
  const vocalMode = byId("vocal_mode")?.value || "lyrics";
  const selectedOption = songSelect?.options?.[songSelect.selectedIndex];
  const backend = selectedOption?.dataset?.backend || "";
  document.body.dataset.songBackend = backend || "ace-step";
  if (backend === "musicgen" && vocalMode === "lyrics") {
    setToolStatus("MusicGen will turn lyrical requests into a wordless sketch. Use ACE-Step for sung lyric fidelity.");
    return;
  }
  if (backend === "musicgen" && vocalMode === "wordless") {
    setToolStatus("MusicGen is a good fit here for a fast wordless or backing-track pass.");
    return;
  }
  if (backend === "songgeneration" && vocalMode === "instrumental") {
    setToolStatus("SongGeneration can do a native instrumental-only pass here, but it is still an experimental Windows backend.");
    return;
  }
  if (backend === "songgeneration") {
    setToolStatus("SongGeneration will try to return the full mix plus native vocal and instrumental stems in one render.");
    return;
  }
}

async function hydrateCatalog() {
  try {
    const data = await fetchJson("/api/catalog");
    latestCatalog = data;
    populateModelSelect("ai_model", data.composer_models || [], data.defaults?.composer_model || "");
    populateModelSelect("song_model", data.song_models || [], data.defaults?.song_model || "");
    renderPresetRail(data.quickstart_presets || []);
    renderAliceProfileRail(data.alice_lab_profiles || []);
    renderEngineCatalog(data.engine_catalog || []);

    const composerCount = Array.isArray(data.composer_models) ? data.composer_models.length : 0;
    const songCount = Array.isArray(data.song_models)
      ? data.song_models.filter((item) => !item.disabled).length
      : 0;
    const composerError = data.errors?.composer_models || "";
    const songError = data.errors?.song_models || "";
    const distributionNote = data.distribution?.launcher_defaults_to_s_drive
      ? `Heavy assets default to ${data.defaults?.storage_root || "your configured storage root"}.`
      : "Storage root is configurable.";
    composerModelNote.textContent = composerError
      ? `Composer catalog unavailable right now. ${composerError}`
      : `${composerCount} local composer model${composerCount === 1 ? "" : "s"} found. ${songCount} song engine${songCount === 1 ? "" : "s"} ready. ${distributionNote}`;
    if (songError) {
      composerModelNote.textContent += ` Song engine note: ${songError}`;
    }
    syncModelSelectionNotes();
    syncSelectedEngineBehavior();
  } catch (error) {
    composerModelNote.textContent = error.message || "Could not load the local model catalog.";
  }
}

function sliderDescriptor(value, low, mid, high) {
  if (value <= 33) return low;
  if (value <= 66) return mid;
  return high;
}

function isMultilingualRequest(value) {
  return /(?:,|\/|\+|&|\band\b)/i.test(`${value || ""}`);
}

function buildSingerDescriptionFromValues(values) {
  const parts = [];
  if (values.voice_preset) parts.push(`${values.voice_preset} preset`);
  if (values.voice_gender) parts.push(`${values.voice_gender} lead`);
  if (values.voice_tone) parts.push(`${values.voice_tone} tone`);
  if (values.voice_register) parts.push(`${values.voice_register} register`);
  if (values.harmony_style) parts.push(`${values.harmony_style} harmonies`);

  parts.push(`${sliderDescriptor(Number(values.breathiness), "clean", "airy", "breathy")} delivery`);
  parts.push(`${sliderDescriptor(Number(values.brightness), "dark", "balanced", "shimmering")} top end`);
  parts.push(`${sliderDescriptor(Number(values.vocal_power), "intimate", "steady", "powerful")} projection`);
  parts.push(sliderDescriptor(Number(values.vibrato), "nearly straight tone", "gentle vibrato", "lush vibrato"));
  parts.push(`${sliderDescriptor(Number(values.intimacy), "distant", "close", "whisper-close")} mic feel`);
  if (values.voice_notes) parts.push(values.voice_notes);
  if (values.clone_profile_name) parts.push(`singing tone inspired by cloned voice profile ${values.clone_profile_name}`);

  return parts.join(", ");
}

function buildVoiceDescription() {
  return buildSingerDescriptionFromValues({
    voice_preset: byId("voice_preset").value.trim(),
    voice_gender: byId("voice_gender").value.trim(),
    voice_tone: byId("voice_tone").value.trim(),
    voice_register: byId("voice_register").value.trim(),
    harmony_style: byId("harmony_style").value.trim(),
    voice_notes: byId("voice_notes").value.trim(),
    clone_profile_name: byId("voice_clone_profile_name").value.trim(),
    breathiness: Number(byId("breathiness").value),
    brightness: Number(byId("brightness").value),
    vocal_power: Number(byId("vocal_power").value),
    vibrato: Number(byId("vibrato").value),
    intimacy: Number(byId("intimacy").value),
  });
}

function buildExtraSingerPayload(prefix) {
  return {
    singer_id: prefix,
    enabled: byId(`${prefix}_enabled`).checked,
    name: byId(`${prefix}_name`).value.trim(),
    role: byId(`${prefix}_role`).value.trim(),
    languages: byId(`${prefix}_languages`).value.trim(),
    all_languages: byId(`${prefix}_all_languages`).checked,
    clone_profile_name: byId(`${prefix}_clone_profile_name`).value.trim(),
    voice_preset: byId(`${prefix}_voice_preset`).value.trim(),
    voice_gender: byId(`${prefix}_voice_gender`).value.trim(),
    voice_tone: byId(`${prefix}_voice_tone`).value.trim(),
    voice_register: byId(`${prefix}_voice_register`).value.trim(),
    harmony_style: byId(`${prefix}_harmony_style`).value.trim(),
    voice_notes: byId(`${prefix}_voice_notes`).value.trim(),
    breathiness: Number(byId(`${prefix}_breathiness`).value),
    brightness: Number(byId(`${prefix}_brightness`).value),
    vocal_power: Number(byId(`${prefix}_vocal_power`).value),
    vibrato: Number(byId(`${prefix}_vibrato`).value),
    intimacy: Number(byId(`${prefix}_intimacy`).value),
    voice_description: buildSingerDescriptionFromValues({
      voice_preset: byId(`${prefix}_voice_preset`).value.trim(),
      voice_gender: byId(`${prefix}_voice_gender`).value.trim(),
      voice_tone: byId(`${prefix}_voice_tone`).value.trim(),
      voice_register: byId(`${prefix}_voice_register`).value.trim(),
      harmony_style: byId(`${prefix}_harmony_style`).value.trim(),
      voice_notes: byId(`${prefix}_voice_notes`).value.trim(),
      clone_profile_name: byId(`${prefix}_clone_profile_name`).value.trim(),
      breathiness: Number(byId(`${prefix}_breathiness`).value),
      brightness: Number(byId(`${prefix}_brightness`).value),
      vocal_power: Number(byId(`${prefix}_vocal_power`).value),
      vibrato: Number(byId(`${prefix}_vibrato`).value),
      intimacy: Number(byId(`${prefix}_intimacy`).value),
    }),
  };
}

function collectExtraSingers() {
  return extraSingerIds.map((prefix) => buildExtraSingerPayload(prefix));
}

function setExtraSingerPayload(prefix, payload = {}) {
  const defaults = {
    enabled: false,
    name: "",
    role: "",
    languages: "",
    all_languages: false,
    clone_profile_name: "",
    voice_preset: "Nova Petal",
    voice_gender: "feminine",
    voice_tone: "airy",
    voice_register: "alto",
    harmony_style: "soft doubles",
    voice_notes: "",
    breathiness: 58,
    brightness: 67,
    vocal_power: 48,
    vibrato: 34,
    intimacy: 60,
  };

  const next = { ...defaults, ...payload };
  byId(`${prefix}_enabled`).checked = Boolean(next.enabled);
  byId(`${prefix}_name`).value = `${next.name ?? ""}`;
  byId(`${prefix}_role`).value = `${next.role ?? ""}`;
  byId(`${prefix}_languages`).value = `${next.languages ?? ""}`;
  byId(`${prefix}_all_languages`).checked = Boolean(next.all_languages);
  byId(`${prefix}_clone_profile_name`).value = `${next.clone_profile_name ?? ""}`;
  byId(`${prefix}_voice_preset`).value = `${next.voice_preset ?? defaults.voice_preset}`;
  byId(`${prefix}_voice_gender`).value = `${next.voice_gender ?? defaults.voice_gender}`;
  byId(`${prefix}_voice_tone`).value = `${next.voice_tone ?? defaults.voice_tone}`;
  byId(`${prefix}_voice_register`).value = `${next.voice_register ?? defaults.voice_register}`;
  byId(`${prefix}_harmony_style`).value = `${next.harmony_style ?? defaults.harmony_style}`;
  byId(`${prefix}_voice_notes`).value = `${next.voice_notes ?? ""}`;
  byId(`${prefix}_breathiness`).value = `${next.breathiness ?? defaults.breathiness}`;
  byId(`${prefix}_brightness`).value = `${next.brightness ?? defaults.brightness}`;
  byId(`${prefix}_vocal_power`).value = `${next.vocal_power ?? defaults.vocal_power}`;
  byId(`${prefix}_vibrato`).value = `${next.vibrato ?? defaults.vibrato}`;
  byId(`${prefix}_intimacy`).value = `${next.intimacy ?? defaults.intimacy}`;
}

function setExtraSingerList(singers = []) {
  const singerMap = new Map((singers || []).map((singer) => [singer.singer_id || singer.id, singer]));
  extraSingerIds.forEach((prefix) => {
    setExtraSingerPayload(prefix, singerMap.get(prefix) || {});
  });
}

function getSingerPreviewLabel(prefix) {
  if (prefix === "primary") {
    return byId("primary_singer_name").value.trim() || "Primary Singer";
  }

  const singer = buildExtraSingerPayload(prefix);
  const fallback = prefix === "singer_b" ? "Singer B" : "Singer C";
  return singer.name || fallback;
}

function syncSingerRoutingUi() {
  const singerMode = byId("singer_mode").value;
  const isMultiple = singerMode === "multiple";
  const multiSingerLab = byId("multiSingerLab");
  const assignmentMode = byId("singer_assignment_mode");
  const previewSingerSelect = byId("preview_singer_id");

  multiSingerLab.classList.toggle("hidden", !isMultiple);
  assignmentMode.disabled = !isMultiple;
  if (!isMultiple) {
    assignmentMode.value = "lock_primary";
  }

  const currentPreviewValue = previewSingerSelect.value || "primary";
  const options = [{ value: "primary", label: getSingerPreviewLabel("primary") }];
  if (isMultiple) {
    extraSingerIds.forEach((prefix) => {
      const singer = buildExtraSingerPayload(prefix);
      if (singer.enabled) {
        options.push({ value: prefix, label: getSingerPreviewLabel(prefix) });
      }
    });
  }

  previewSingerSelect.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
    .join("");
  previewSingerSelect.value = options.some((option) => option.value === currentPreviewValue)
    ? currentPreviewValue
    : "primary";
}

function syncVoicePreview() {
  const description = buildVoiceDescription();
  byId("voice_description").value = description;
  syncSingerRoutingUi();
  syncAliceLabMeta();
  const previewSingerId = byId("preview_singer_id").value || "primary";
  if (previewSingerId !== "primary" && byId("singer_mode").value === "multiple") {
    const singer = buildExtraSingerPayload(previewSingerId);
    const singerDescription = singer.voice_description || "No extra shaping yet.";
    voicePreview.textContent = `Primary lead: ${description || "No extra voice shaping yet."} | Voice Booth target: ${getSingerPreviewLabel(previewSingerId)} — ${singerDescription}`;
    return;
  }
  voicePreview.textContent = description || "No extra voice shaping yet.";
}

function updateComposeButtonLabel() {
  const variantCount = Number(composeVariantsField?.value || 1);
  composeButton.textContent = variantCount > 1 ? `Compose ${variantCount} Songs` : "Compose Song";
}

function syncSelectedCloneProfileMeta() {
  const select = byId("voice_clone_profile_id");
  const hiddenName = byId("voice_clone_profile_name");
  if (!select) return;

  const option = select.options[select.selectedIndex];
  if (!option || !option.value) {
    hiddenName.value = "";
    cloneProfileMeta.textContent = "No clone profile selected yet.";
    return;
  }

  hiddenName.value = option.dataset.profileName || option.textContent || "";
  cloneProfileMeta.textContent = option.dataset.profileMeta || `${hiddenName.value} selected.`;
}

function syncSelectedVoiceboxProfileMeta() {
  const select = byId("voicebox_profile_id");
  const hiddenName = byId("voicebox_profile_name");
  if (!select || !hiddenName || !voiceboxProfileMeta) return;

  const option = select.options[select.selectedIndex];
  if (!option || !option.value) {
    hiddenName.value = "";
    const fallbackName = byId("voice_clone_profile_name")?.value?.trim();
    voiceboxProfileMeta.textContent = fallbackName
      ? `Using singer clone fallback: ${fallbackName}.`
      : "Choose a clone profile for spoken cues.";
    return;
  }

  hiddenName.value = option.dataset.profileName || option.textContent || "";
  voiceboxProfileMeta.textContent = option.dataset.profileMeta || `${hiddenName.value} selected for Alice Voicebox.`;
}

function syncAliceLabMeta() {
  if (!aliceLabMeta) return;
  const enabled = byId("alice_enabled")?.checked;
  const autonomy = Number(byId("alice_autonomy")?.value || 0);
  const voiceboxEnabled = byId("voicebox_enabled")?.checked;

  const autonomyLabel = autonomy >= 85
    ? "full orchestrator"
    : autonomy >= 60
      ? "bold arranger"
      : autonomy >= 30
        ? "guided co-producer"
        : "light-touch assistant";

  const parts = [
    enabled ? `Alice is acting as a ${autonomyLabel}` : "Alice is staying closer to your manual brief",
    voiceboxEnabled ? "Voicebox cue armed" : "Voicebox cue optional",
  ];
  aliceLabMeta.textContent = parts.join(" • ");
}

function readPayload() {
  syncVoicePreview();
  const formData = new FormData(form);
  return {
    prompt: formData.get("prompt"),
    lyrics: formData.get("lyrics"),
    genre: formData.get("genre"),
    mood: formData.get("mood"),
    instruments: formData.get("instruments"),
    tempo_bpm: formData.get("tempo_bpm") ? Number(formData.get("tempo_bpm")) : null,
    key_scale: formData.get("key_scale"),
    time_signature: formData.get("time_signature"),
    vocal_language: formData.get("vocal_language"),
    voice_description: formData.get("voice_description"),
    voice_clone_profile_id: formData.get("voice_clone_profile_id"),
    voice_clone_profile_name: formData.get("voice_clone_profile_name"),
    voice_preset: formData.get("voice_preset"),
    voice_gender: formData.get("voice_gender"),
    voice_tone: formData.get("voice_tone"),
    voice_register: formData.get("voice_register"),
    harmony_style: formData.get("harmony_style"),
    voice_notes: formData.get("voice_notes"),
    breathiness: Number(formData.get("breathiness")),
    brightness: Number(formData.get("brightness")),
    vocal_power: Number(formData.get("vocal_power")),
    vibrato: Number(formData.get("vibrato")),
    intimacy: Number(formData.get("intimacy")),
    era: formData.get("era"),
    texture: formData.get("texture"),
    title: formData.get("title"),
    ai_model: formData.get("ai_model"),
    song_model: formData.get("song_model"),
    duration: Number(formData.get("duration")),
    candidates: Number(formData.get("candidates")),
    seed: formData.get("seed") ? Number(formData.get("seed")) : null,
    vocal_mode: formData.get("vocal_mode"),
    use_ai: byId("use_ai").checked,
    thinking: byId("thinking").checked,
    use_format: byId("use_format").checked,
    preview_text: formData.get("preview_text"),
    preview_duration: Number(formData.get("preview_duration")),
    compose_variants: Number(formData.get("compose_variants") || 1),
    alice_enabled: byId("alice_enabled").checked,
    alice_autonomy: Number(formData.get("alice_autonomy") || 72),
    alice_goal: formData.get("alice_goal"),
    hook_direction: formData.get("hook_direction"),
    chord_story: formData.get("chord_story"),
    dynamic_arc: formData.get("dynamic_arc"),
    section_energy_map: formData.get("section_energy_map"),
    orchestration_plan: formData.get("orchestration_plan"),
    transition_notes: formData.get("transition_notes"),
    voicebox_enabled: byId("voicebox_enabled").checked,
    voicebox_profile_id: formData.get("voicebox_profile_id"),
    voicebox_profile_name: formData.get("voicebox_profile_name"),
    voicebox_language: formData.get("voicebox_language"),
    voicebox_role: formData.get("voicebox_role"),
    voicebox_text: formData.get("voicebox_text"),
    voicebox_auto_script: byId("voicebox_auto_script").checked,
    primary_singer_name: byId("primary_singer_name").value.trim(),
    primary_singer_role: byId("primary_singer_role").value.trim(),
    primary_singer_languages: byId("primary_singer_languages").value.trim(),
    primary_singer_all_languages: byId("primary_singer_all_languages").checked,
    singer_mode: byId("singer_mode").value,
    singer_assignment_mode: byId("singer_assignment_mode").value,
    preview_singer_id: byId("preview_singer_id").value,
    singers: collectExtraSingers(),
    clone_profile_engine: byId("clone_profile_engine").value,
    clone_profile_name: byId("clone_profile_name").value,
    clone_profile_description: byId("clone_profile_description").value,
    clone_profile_language: byId("clone_profile_language").value,
    clone_sample_audio_path: byId("clone_sample_audio_path").value,
    clone_reference_text: byId("clone_reference_text").value,
    clone_preview_text: byId("clone_preview_text").value,
  };
}

function applyPayload(payload = {}) {
  isHydrating = true;
  const setters = [
    "prompt",
    "lyrics",
    "genre",
    "mood",
    "instruments",
    "tempo_bpm",
    "key_scale",
    "time_signature",
    "vocal_language",
    "voice_clone_profile_id",
    "voice_clone_profile_name",
    "voice_preset",
    "voice_gender",
    "voice_tone",
    "voice_register",
    "harmony_style",
    "voice_notes",
    "breathiness",
    "brightness",
    "vocal_power",
    "vibrato",
    "intimacy",
    "era",
    "texture",
    "title",
    "ai_model",
    "song_model",
    "duration",
    "candidates",
    "compose_variants",
    "seed",
    "vocal_mode",
    "preview_text",
    "preview_duration",
    "alice_autonomy",
    "alice_goal",
    "hook_direction",
    "chord_story",
    "dynamic_arc",
    "section_energy_map",
    "orchestration_plan",
    "transition_notes",
    "voicebox_profile_id",
    "voicebox_profile_name",
    "voicebox_language",
    "voicebox_role",
    "voicebox_text",
    "primary_singer_name",
    "primary_singer_role",
    "primary_singer_languages",
    "singer_mode",
    "singer_assignment_mode",
    "preview_singer_id",
    "clone_profile_engine",
    "clone_profile_name",
    "clone_profile_description",
    "clone_profile_language",
    "clone_sample_audio_path",
    "clone_reference_text",
    "clone_preview_text",
  ];

  setters.forEach((key) => {
    const element = byId(key);
    if (!element) return;
    const nextValue = payload[key];
    if (nextValue !== undefined && nextValue !== null) {
      element.value = `${nextValue}`;
      if (element.tagName === "SELECT") {
        element.dataset.pendingValue = `${nextValue}`;
      }
    }
  });

  if (payload.voice_description && !payload.voice_notes) {
    byId("voice_notes").value = payload.voice_description;
  }

  if (payload.use_ai !== undefined) byId("use_ai").checked = Boolean(payload.use_ai);
  if (payload.thinking !== undefined) byId("thinking").checked = Boolean(payload.thinking);
  if (payload.use_format !== undefined) byId("use_format").checked = Boolean(payload.use_format);
  if (payload.alice_enabled !== undefined) byId("alice_enabled").checked = Boolean(payload.alice_enabled);
  if (payload.voicebox_enabled !== undefined) byId("voicebox_enabled").checked = Boolean(payload.voicebox_enabled);
  if (payload.voicebox_auto_script !== undefined) byId("voicebox_auto_script").checked = Boolean(payload.voicebox_auto_script);
  if (payload.primary_singer_all_languages !== undefined) {
    byId("primary_singer_all_languages").checked = Boolean(payload.primary_singer_all_languages);
  }
  if (payload.singers !== undefined) {
    setExtraSingerList(payload.singers);
  }

  updateSliderMirrors();
  syncVoicePreview();
  updateComposeButtonLabel();
  syncSelectedCloneProfileMeta();
  syncSelectedVoiceboxProfileMeta();
  syncAliceLabMeta();
  isHydrating = false;
}

function storeAutosave() {
  const snapshot = {
    draftName: draftName.value,
    currentDraftId,
    payload: readPayload(),
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(LAST_DRAFT_KEY, JSON.stringify(snapshot));
  const timeLabel = new Date(snapshot.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  autosaveStatus.textContent = `Autosaved locally at ${timeLabel}.`;
}

function scheduleAutosave() {
  if (isHydrating) return;
  autosaveStatus.textContent = "Autosaving...";
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(storeAutosave, 400);
}

function restoreAutosave() {
  const raw = localStorage.getItem(LAST_DRAFT_KEY);
  if (!raw) {
    syncVoicePreview();
    updateSliderMirrors();
    return;
  }

  try {
    const saved = JSON.parse(raw);
    applyPayload(saved.payload || {});
    draftName.value = saved.draftName || "";
    currentDraftId = saved.currentDraftId || "";
    if (saved.savedAt) {
      const timeLabel = new Date(saved.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      autosaveStatus.textContent = `Restored local autosave from ${timeLabel}.`;
    }
  } catch (error) {
    autosaveStatus.textContent = "Autosave restore failed.";
    syncVoicePreview();
    updateSliderMirrors();
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(formatErrorMessage(errorBody, response.status));
  }
  return response.json();
}

function renderPlan(plan, resolvedTitle, resolvedPromptText) {
  const bits = [];
  bits.push(`<p><strong>Title:</strong> ${escapeHtml(resolvedTitle)}</p>`);
  bits.push(
    `<p><strong>Composer:</strong> ${
      plan.ai_used ? escapeHtml(`${plan.ai_model} via Ollama`) : "Manual song brief"
    }</p>`,
  );
  if (plan.genre) bits.push(`<p><strong>Genre:</strong> ${escapeHtml(plan.genre)}</p>`);
  if (plan.mood) bits.push(`<p><strong>Mood:</strong> ${escapeHtml(plan.mood)}</p>`);
  if (plan.instruments) bits.push(`<p><strong>Instruments:</strong> ${escapeHtml(plan.instruments)}</p>`);
  if (plan.tempo_bpm) bits.push(`<p><strong>Tempo:</strong> ${escapeHtml(String(plan.tempo_bpm))} BPM</p>`);
  if (plan.key_scale) bits.push(`<p><strong>Key:</strong> ${escapeHtml(plan.key_scale)}</p>`);
  if (plan.time_signature) bits.push(`<p><strong>Meter:</strong> ${escapeHtml(plan.time_signature)}</p>`);
  if (plan.vocal_language) {
    bits.push(
      `<p><strong>${isMultilingualRequest(plan.vocal_language) ? "Language blend" : "Language"}:</strong> ${escapeHtml(plan.vocal_language)}</p>`,
    );
  }
  if (plan.voice_description) bits.push(`<p><strong>Lead voice:</strong> ${escapeHtml(plan.voice_description)}</p>`);
  if (plan.voice_lock_direction) bits.push(`<p><strong>Voice lock:</strong> ${escapeHtml(plan.voice_lock_direction)}</p>`);
  if (Array.isArray(plan.singer_language_assignments) && plan.singer_language_assignments.length) {
    const ownership = plan.singer_language_assignments
      .map((entry) => `${entry.language_name || entry.language || "Language"} -> ${entry.singer_name || "Singer"}`)
      .join(" | ");
    bits.push(`<p><strong>Language owners:</strong> ${escapeHtml(ownership)}</p>`);
  }
  if (plan.singer_plan) bits.push(`<p><strong>Singer routing:</strong> ${escapeHtml(plan.singer_plan)}</p>`);
  if (plan.singer_swap_direction) bits.push(`<p><strong>Swap rule:</strong> ${escapeHtml(plan.singer_swap_direction)}</p>`);
  if (plan.voice_anchor?.profile_name) {
    bits.push(`<p><strong>Clone anchor:</strong> ${escapeHtml(plan.voice_anchor.profile_name)} (${escapeHtml(plan.voice_anchor.language || "en")})</p>`);
  }
  if (plan.structure) bits.push(`<p><strong>Structure:</strong> ${escapeHtml(plan.structure)}</p>`);
  if (plan.era) bits.push(`<p><strong>Era:</strong> ${escapeHtml(plan.era)}</p>`);
  if (plan.texture) bits.push(`<p><strong>Texture:</strong> ${escapeHtml(plan.texture)}</p>`);
  if (plan.alice_enabled) bits.push(`<p><strong>Alice autonomy:</strong> ${escapeHtml(String(plan.alice_autonomy ?? 72))}/100</p>`);
  if (plan.alice_goal) bits.push(`<p><strong>Alice mission:</strong> ${escapeHtml(plan.alice_goal)}</p>`);
  if (plan.hook_direction) bits.push(`<p><strong>Hook direction:</strong> ${escapeHtml(plan.hook_direction)}</p>`);
  if (plan.chord_story) bits.push(`<p><strong>Chord story:</strong> ${escapeHtml(plan.chord_story)}</p>`);
  if (plan.dynamic_arc) bits.push(`<p><strong>Dynamic arc:</strong> ${escapeHtml(plan.dynamic_arc)}</p>`);
  if (plan.section_energy_map) bits.push(`<p><strong>Section energy:</strong> ${escapeHtml(plan.section_energy_map)}</p>`);
  if (plan.orchestration_plan) bits.push(`<p><strong>Orchestration:</strong> ${escapeHtml(plan.orchestration_plan)}</p>`);
  if (plan.transition_notes) bits.push(`<p><strong>Transitions:</strong> ${escapeHtml(plan.transition_notes)}</p>`);
  if (plan.voicebox_plan) bits.push(`<p><strong>Voicebox cue:</strong> ${escapeHtml(plan.voicebox_plan)}</p>`);
  if (plan.voicebox_script) bits.push(`<p><strong>Voicebox script:</strong> ${escapeHtml(plan.voicebox_script)}</p>`);
  if (plan.production_notes) bits.push(`<p><strong>Notes:</strong> ${escapeHtml(plan.production_notes)}</p>`);
  if (plan.ai_error) bits.push(`<p><strong>AI fallback:</strong> ${escapeHtml(plan.ai_error)}</p>`);
  bits.push(`<p><strong>Resolved brief:</strong> ${escapeHtml(resolvedPromptText)}</p>`);
  planSummary.innerHTML = bits.join("");
  planSummary.classList.remove("hidden");
}

function renderLyrics(lyricsText) {
  if (!lyricsText) {
    resolvedLyrics.classList.add("hidden");
    resolvedLyrics.innerHTML = "";
    return;
  }
  resolvedLyrics.innerHTML = `
    <p class="section-tag">Resolved Lyrics</p>
    <div class="lyric-body">${nl2br(lyricsText)}</div>
  `;
  resolvedLyrics.classList.remove("hidden");
}

function syncResolvedLyricsToEditors(lyricsText) {
  const nextLyrics = `${lyricsText || ""}`;
  if (!nextLyrics.trim()) {
    return false;
  }

  const lyricsField = byId("lyrics");
  const alignmentField = byId("alignment_lyrics");
  const didChange = lyricsField.value !== nextLyrics;

  lyricsField.value = nextLyrics;
  alignmentField.value = nextLyrics;
  return didChange;
}

function clipText(value, maxLength = 240) {
  const text = `${value || ""}`.trim().replace(/\s+/g, " ");
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function lyricExcerpt(lyricsText, maxLines = 8) {
  const lines = `${lyricsText || ""}`
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return "";
  if (lines.length <= maxLines) return lines.join("\n");
  return `${lines.slice(0, maxLines).join("\n")}\n…`;
}

function createComposeVariantCard(variant, index) {
  const plan = variant.plan || {};
  const promptPreview = clipText(variant.resolved_prompt || "", 280);
  const lyricsPreview = lyricExcerpt(variant.resolved_lyrics || "", 10);
  const subtitleBits = [];
  if (plan.genre) subtitleBits.push(plan.genre);
  if (plan.mood) subtitleBits.push(plan.mood);
  if (plan.vocal_language) subtitleBits.push(plan.vocal_language);

  const card = document.createElement("article");
  card.className = "result-card compose-variant-card";
  card.innerHTML = `
    <p class="section-tag">Variant ${escapeHtml(String(variant.variant_index || index + 1))}${variant.variant_label ? ` · ${escapeHtml(variant.variant_label)}` : ""}</p>
    <h3>${escapeHtml(variant.resolved_title || `Song ${index + 1}`)}</h3>
    ${variant.variant_focus ? `<p class="result-meta">${escapeHtml(variant.variant_focus)}</p>` : ""}
    ${subtitleBits.length ? `<p class="result-meta">${escapeHtml(subtitleBits.join(" · "))}</p>` : ""}
    <div class="compose-preview-block">
      <p class="section-tag">Prompt Preview</p>
      <div class="lyric-body">${nl2br(promptPreview)}</div>
    </div>
    ${lyricsPreview ? `
      <div class="compose-preview-block">
        <p class="section-tag">Lyric Preview</p>
        <div class="lyric-body">${nl2br(lyricsPreview)}</div>
      </div>
    ` : ""}
    ${plan.ai_error ? `<p class="result-meta">AI note: ${escapeHtml(plan.ai_error)}</p>` : ""}
    <div class="result-actions">
      <button type="button" class="button-secondary" data-compose-variant-index="${escapeHtml(String(index))}">
        Load Into Editor
      </button>
    </div>
  `;
  return card;
}

function renderComposeBatchResults(data) {
  latestComposeVariants = Array.isArray(data.variants) ? data.variants : [];
  results.innerHTML = "";

  if (!latestComposeVariants.length) {
    results.innerHTML = `
      <article class="empty-state">
        <h3>No song plans came back</h3>
        <p>The compose set returned empty, so Astral does not have variants to show yet.</p>
      </article>
    `;
    return;
  }

  latestComposeVariants.forEach((variant, index) => {
    results.appendChild(createComposeVariantCard(variant, index));
  });
}

function renderCompareResults(data) {
  const engineRuns = Array.isArray(data.engines) ? data.engines : [];
  const compareNotes = Array.isArray(data.runtime_notes) ? data.runtime_notes : [];
  results.innerHTML = "";

  if (!engineRuns.length) {
    results.innerHTML = `
      <article class="empty-state">
        <h3>No compare results came back</h3>
        <p>Astral did not get any engine results back from the compare run yet.</p>
      </article>
    `;
    return;
  }

  if (compareNotes.length) {
    const noteCard = document.createElement("article");
    noteCard.className = "result-card compact";
    noteCard.innerHTML = `
      <p class="section-tag">Compare Notes</p>
      <div class="lyric-body">${nl2br(compareNotes.join("\n"))}</div>
    `;
    results.appendChild(noteCard);
  }

  engineRuns.forEach((engine) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const result = engine.result || {};
    const tracks = Array.isArray(result.tracks) ? result.tracks : [];
    const tracksHtml = tracks.length
      ? tracks.map((track) => `
        <div class="compare-track">
          <p class="result-meta"><strong>${escapeHtml(track.label || `Candidate ${String(track.candidate || 1)}`)}</strong>${track.role ? ` · ${escapeHtml(track.role)}` : ""}</p>
          <audio controls preload="none" src="${escapeHtml(track.url || "")}"></audio>
          <p class="path-row">${escapeHtml(track.path || "")}</p>
          <div class="result-actions">
            <button type="button" class="button-secondary" data-fill-target="split_audio_path" data-fill-value="${escapeHtml(track.path || "")}">
              Use In Stem Studio
            </button>
            <button type="button" class="button-secondary" data-fill-target="alignment_audio_path" data-fill-value="${escapeHtml(track.path || "")}">
              Use In Match Lab
            </button>
          </div>
        </div>
      `).join("")
      : "";

    const runtimeNotes = Array.isArray(result.plan?.runtime_notes) && result.plan.runtime_notes.length
      ? `<div class="lyric-body">${nl2br(result.plan.runtime_notes.join("\n"))}</div>`
      : "";

    card.innerHTML = `
      <p class="section-tag">${escapeHtml(engine.engine_label || engine.engine_id || "Engine Compare")}</p>
      <h3>${engine.ok ? escapeHtml(result.resolved_title || data.resolved_title || "Render complete") : "Render failed"}</h3>
      <p class="result-meta">${escapeHtml(engine.status_label || engine.status || "")}</p>
      ${engine.ok ? `
        <p class="result-meta">Session: ${escapeHtml(result.session_dir || "")}</p>
        ${tracksHtml}
        ${runtimeNotes}
      ` : `
        <div class="error-box">${escapeHtml(engine.error || "This engine failed during the compare pass.")}</div>
      `}
    `;
    results.appendChild(card);
  });
}

function loadComposeVariant(index) {
  const variant = latestComposeVariants[index];
  if (!variant) return;

  const plan = variant.plan || {};
  applyPayload({
    title: variant.resolved_title || "",
    prompt: plan.prompt_core || variant.resolved_prompt || "",
    lyrics: variant.resolved_lyrics || "",
    genre: plan.genre || "",
    mood: plan.mood || "",
    instruments: plan.instruments || "",
    tempo_bpm: plan.tempo_bpm ?? "",
    key_scale: plan.key_scale || "",
    time_signature: plan.time_signature || "",
    vocal_language: plan.vocal_language || "",
    era: plan.era || "",
    texture: plan.texture || "",
    alice_goal: plan.alice_goal || "",
    hook_direction: plan.hook_direction || "",
    chord_story: plan.chord_story || "",
    dynamic_arc: plan.dynamic_arc || "",
    section_energy_map: plan.section_energy_map || "",
    orchestration_plan: plan.orchestration_plan || "",
    transition_notes: plan.transition_notes || "",
    voicebox_text: plan.voicebox_script || "",
  });

  resolvedPrompt.innerHTML = `<strong>Resolved prompt:</strong> ${escapeHtml(variant.resolved_prompt || "")}`;
  resolvedPrompt.classList.remove("hidden");
  renderLyrics(variant.resolved_lyrics || "");
  renderPlan(plan, variant.resolved_title || "", variant.resolved_prompt || "");
  syncResolvedLyricsToEditors(variant.resolved_lyrics || "");
  storeAutosave();
  setStatus(`Loaded variant ${index + 1} into the editor. You can tweak it or render it now.`);
}

function createTrackCard(track, sessionDir) {
  const label = track.label || `Candidate ${String(track.candidate)}`;
  const role = track.role ? `<p class="result-meta">${escapeHtml(track.role)}</p>` : "";
  const card = document.createElement("article");
  card.className = "result-card";
  card.innerHTML = `
    <p class="section-tag">${escapeHtml(label)}</p>
    <h3>Seed ${escapeHtml(String(track.seed))}</h3>
    ${role}
    <p class="result-meta">Saved in ${escapeHtml(sessionDir)}</p>
    <audio controls preload="none" src="${escapeHtml(track.url)}"></audio>
    <p class="path-row">${escapeHtml(track.path)}</p>
    <div class="result-actions">
      <button type="button" class="button-secondary" data-fill-target="split_audio_path" data-fill-value="${escapeHtml(track.path)}">
        Use In Stem Studio
      </button>
      <button type="button" class="button-secondary" data-fill-target="alignment_audio_path" data-fill-value="${escapeHtml(track.path)}">
        Use In Match Lab
      </button>
    </div>
  `;
  return card;
}

function showError(container, message) {
  if (container.classList?.contains("hidden")) {
    container.classList.remove("hidden");
  }
  container.innerHTML = "";
  const box = document.createElement("div");
  box.className = "error-box";
  box.textContent = message;
  container.appendChild(box);
  if (typeof container.scrollIntoView === "function") {
    container.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function renderStemResults(data) {
  stemResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Stem Pass</p>
      <h3>${escapeHtml(data.input_path)}</h3>
      <div class="stem-grid">
        <div>
          <p><strong>Vocals</strong></p>
          <audio controls preload="none" src="${escapeHtml(data.vocals.url)}"></audio>
          <p class="path-row">${escapeHtml(data.vocals.path)}</p>
          <div class="stem-actions">
            <button type="button" class="button-secondary" data-fill-target="remix_vocals_path" data-fill-value="${escapeHtml(data.vocals.path)}">
              Use Vocals In Remix
            </button>
          </div>
        </div>
        <div>
          <p><strong>Instrumental</strong></p>
          <audio controls preload="none" src="${escapeHtml(data.instrumental.url)}"></audio>
          <p class="path-row">${escapeHtml(data.instrumental.path)}</p>
          <div class="stem-actions">
            <button type="button" class="button-secondary" data-fill-target="remix_instrumental_path" data-fill-value="${escapeHtml(data.instrumental.path)}">
              Use Instrumental In Remix
            </button>
          </div>
        </div>
      </div>
      <p class="result-meta">Duration ${escapeHtml(String(data.duration_seconds))}s at ${escapeHtml(String(data.sample_rate))} Hz</p>
    </article>
  `;
}

function renderRemixResults(data) {
  remixResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Remix Ready</p>
      <h3>Rebuilt mix</h3>
      <audio controls preload="none" src="${escapeHtml(data.url)}"></audio>
      <p class="path-row">${escapeHtml(data.path)}</p>
      <p class="result-meta">
        Vocals ${escapeHtml(String(data.vocals_gain_db))} dB, instrumental ${escapeHtml(String(data.instrumental_gain_db))} dB
      </p>
      <div class="result-actions">
        <button type="button" class="button-secondary" data-fill-target="split_audio_path" data-fill-value="${escapeHtml(data.path)}">
          Use Rebuilt Mix For More Stems
        </button>
        <button type="button" class="button-secondary" data-fill-target="alignment_audio_path" data-fill-value="${escapeHtml(data.path)}">
          Use Rebuilt Mix In Match Lab
        </button>
      </div>
    </article>
  `;
}

function renderAlignmentResults(data) {
  const sectionHtml = (data.sections || [])
    .map(
      (section) => `
        <div class="timing-row">
          <strong>${escapeHtml(section.label)}</strong>
          <div>${escapeHtml(String(section.start_seconds))}s to ${escapeHtml(String(section.end_seconds))}s</div>
          <div>${section.bars !== null && section.bars !== undefined ? `${escapeHtml(String(section.bars))} bars` : "Free timing"}</div>
        </div>
      `,
    )
    .join("");

  const lineItems = (data.lines || [])
    .slice(0, 10)
    .map(
      (line) =>
        `<li>${escapeHtml(String(line.start_seconds))}s to ${escapeHtml(String(line.end_seconds))}s | ${escapeHtml(line.line)}</li>`,
    )
    .join("");

  const peaks = (data.energy_peaks || [])
    .slice(0, 8)
    .map((value) => `<li>${escapeHtml(String(value))}s</li>`)
    .join("");

  alignmentResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Timing Map</p>
      <h3>${escapeHtml(data.audio_path)}</h3>
      <p class="alignment-summary">${escapeHtml(data.summary)}</p>
      <div class="section-grid">${sectionHtml}</div>
      ${lineItems ? `<ul class="line-list">${lineItems}</ul>` : ""}
      ${peaks ? `<ul class="peak-list">${peaks}</ul>` : ""}
    </article>
  `;
}

function renderVoicePreviewResult(data) {
  const track = (data.tracks || [])[0];
  if (!track) {
    showError(voicePreviewResults, "Voice preview finished without an audio file.");
    return;
  }

  voicePreviewResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Voice Preview</p>
      <h3>${escapeHtml(data.resolved_title || "Voice preview")}</h3>
      <p class="result-meta">Singer focus: ${escapeHtml(data.preview_singer_name || "Primary Singer")}</p>
      <p class="result-meta">Lead shape: ${escapeHtml(data.voice_description || "Current Voice Lab settings")}</p>
      <audio controls preload="none" src="${escapeHtml(track.url)}"></audio>
      <p class="path-row">${escapeHtml(track.path)}</p>
      <p class="result-meta">Preview lyric</p>
      <div class="lyric-body">${nl2br(data.preview_text || "")}</div>
      <div class="result-actions">
        <button type="button" class="button-secondary" data-fill-target="alignment_audio_path" data-fill-value="${escapeHtml(track.path)}">
          Use In Match Lab
        </button>
        <button type="button" class="button-secondary" data-fill-target="split_audio_path" data-fill-value="${escapeHtml(track.path)}">
          Use In Stem Studio
        </button>
      </div>
    </article>
  `;
}

function renderCloneProfileResult(data, message) {
  const profile = data.profile || {};
  const sample = data.sample || null;
  cloneResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Clone Profile</p>
      <h3>${escapeHtml(profile.name || "Voice clone")}</h3>
      <p class="result-meta">${escapeHtml(message)}</p>
      <p class="result-meta">
        ${escapeHtml(profile.language || "en")} · ${escapeHtml(String(profile.sample_count ?? 0))} sample(s)
      </p>
      ${profile.description ? `<div class="lyric-body">${nl2br(profile.description)}</div>` : ""}
      ${sample ? `<p class="path-row">Latest sample: ${escapeHtml(sample.audio_path || "")}</p>` : ""}
    </article>
  `;
}

function renderClonePreviewResult(data) {
  cloneResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Cloned Speech Preview</p>
      <h3>${escapeHtml(data.profile?.name || "Voice clone preview")}</h3>
      <p class="result-meta">${escapeHtml(data.engine || "Voicebox")} · ${escapeHtml(data.profile?.language || "en")}</p>
      <audio controls preload="none" src="${escapeHtml(data.url)}"></audio>
      <p class="path-row">${escapeHtml(data.path)}</p>
      <div class="lyric-body">${nl2br(data.text || "")}</div>
      <div class="result-actions">
        <button type="button" class="button-secondary" data-fill-target="split_audio_path" data-fill-value="${escapeHtml(data.path)}">
          Use In Stem Studio
        </button>
        <button type="button" class="button-secondary" data-fill-target="alignment_audio_path" data-fill-value="${escapeHtml(data.path)}">
          Use In Match Lab
        </button>
      </div>
    </article>
  `;
}

function renderAliceVoiceboxResult(data) {
  aliceLabResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Alice Voicebox Cue</p>
      <h3>${escapeHtml(data.profile?.name || "Alice Voicebox preview")}</h3>
      <p class="result-meta">${escapeHtml(data.voicebox_language || data.profile?.language || "en")} · ${escapeHtml(data.engine || "Voicebox")}</p>
      ${data.voicebox_plan ? `<p class="result-meta">${escapeHtml(data.voicebox_plan)}</p>` : ""}
      <audio controls preload="none" src="${escapeHtml(data.url)}"></audio>
      <p class="path-row">${escapeHtml(data.path)}</p>
      <div class="lyric-body">${nl2br(data.voicebox_script || data.text || "")}</div>
      <div class="result-actions">
        <button type="button" class="button-secondary" data-fill-target="voicebox_text" data-fill-value="${escapeHtml(data.voicebox_script || data.text || "")}">
          Load Cue Back In
        </button>
        <button type="button" class="button-secondary" data-fill-target="alignment_audio_path" data-fill-value="${escapeHtml(data.path)}">
          Use In Match Lab
        </button>
      </div>
    </article>
  `;
}

async function loadVoiceCloneProfiles(selectedId = byId("voice_clone_profile_id").value) {
  const data = await fetchJson("/api/voice-clone/profiles");
  const select = byId("voice_clone_profile_id");
  const voiceboxSelect = byId("voicebox_profile_id");
  const existingName = byId("voice_clone_profile_name").value;
  const existingVoiceboxName = byId("voicebox_profile_name")?.value || "";
  const selectedVoiceboxId = voiceboxSelect?.value || "";
  select.innerHTML = `<option value="">Select a cloned voice</option>`;
  if (voiceboxSelect) {
    voiceboxSelect.innerHTML = `<option value="">Use selected singer clone if available</option>`;
  }

  (data.profiles || []).forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `${profile.name} · ${profile.language} · ${profile.sample_count} sample(s)`;
    option.dataset.profileName = profile.name || "";
    option.dataset.profileMeta = `${profile.language || "en"} · ${profile.sample_count || 0} sample(s) · ${profile.voice_type || "cloned"}`;
    if (selectedId && profile.id === selectedId) {
      option.selected = true;
    }
    select.appendChild(option);
    if (voiceboxSelect) {
      const voiceboxOption = document.createElement("option");
      voiceboxOption.value = profile.id;
      voiceboxOption.textContent = option.textContent;
      voiceboxOption.dataset.profileName = option.dataset.profileName || "";
      voiceboxOption.dataset.profileMeta = option.dataset.profileMeta || "";
      if (selectedVoiceboxId && profile.id === selectedVoiceboxId) {
        voiceboxOption.selected = true;
      }
      voiceboxSelect.appendChild(voiceboxOption);
    }
  });

  if (selectedId && ![...select.options].some((option) => option.value === selectedId)) {
    const fallback = document.createElement("option");
    fallback.value = selectedId;
    fallback.textContent = existingName ? `${existingName} · saved selection` : "Saved voice clone";
    fallback.dataset.profileName = existingName;
    fallback.dataset.profileMeta = "Saved clone selection";
    fallback.selected = true;
    select.appendChild(fallback);
  }

  if (voiceboxSelect && selectedVoiceboxId && ![...voiceboxSelect.options].some((option) => option.value === selectedVoiceboxId)) {
    const fallback = document.createElement("option");
    fallback.value = selectedVoiceboxId;
    fallback.textContent = existingVoiceboxName ? `${existingVoiceboxName} saved selection` : "Saved Voicebox selection";
    fallback.dataset.profileName = existingVoiceboxName;
    fallback.dataset.profileMeta = "Saved Voicebox selection";
    fallback.selected = true;
    voiceboxSelect.appendChild(fallback);
  }

  syncSelectedCloneProfileMeta();
  syncSelectedVoiceboxProfileMeta();
  syncVoicePreview();
  syncAliceLabMeta();
  return data.profiles || [];
}

async function createVoiceCloneProfile() {
  const payload = {
    name: byId("clone_profile_name").value.trim(),
    description: byId("clone_profile_description").value.trim(),
    language: byId("clone_profile_language").value.trim() || "en",
    sample_audio_path: byId("clone_sample_audio_path").value.trim(),
    reference_text: byId("clone_reference_text").value.trim(),
    default_engine: byId("clone_profile_engine").value,
  };

  if (!payload.name) {
    throw new Error("Clone profile name is required.");
  }

  const data = await fetchJson("/api/voice-clone/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  byId("voice_clone_profile_id").value = data.profile?.id || "";
  await loadVoiceCloneProfiles(data.profile?.id || "");
  renderCloneProfileResult(data, "Clone profile created.");
  storeAutosave();
  setStatus(`Clone profile ${data.profile?.name || "created"} is ready.`);
}

async function addVoiceCloneSample() {
  const profileId = byId("voice_clone_profile_id").value;
  if (!profileId) {
    throw new Error("Select a clone profile first.");
  }

  const payload = {
    sample_audio_path: byId("clone_sample_audio_path").value.trim(),
    reference_text: byId("clone_reference_text").value.trim(),
  };
  if (!payload.sample_audio_path) {
    throw new Error("Reference audio path is required.");
  }
  if (!payload.reference_text) {
    throw new Error("Reference transcript is required.");
  }

  const data = await fetchJson(`/api/voice-clone/profiles/${encodeURIComponent(profileId)}/samples`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  await loadVoiceCloneProfiles(profileId);
  renderCloneProfileResult(data, "New cloning sample added.");
  storeAutosave();
  setStatus(`Added a new sample to ${data.profile?.name || "the clone profile"}.`);
}

async function previewVoiceClone() {
  const profileId = byId("voice_clone_profile_id").value;
  if (!profileId) {
    throw new Error("Select a clone profile first.");
  }

  const payload = {
    profile_id: profileId,
    text: byId("clone_preview_text").value.trim() || "I remember, I connect, I guide.",
    language: byId("clone_profile_language").value.trim() || byId("vocal_language").value.trim() || "en",
    engine: byId("clone_profile_engine").value,
    title: `${byId("clone_profile_name").value.trim() || byId("voice_clone_profile_name").value.trim() || "clone"} preview`,
  };

  const data = await fetchJson("/api/voice-clone/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  renderClonePreviewResult(data);
  storeAutosave();
  setStatus(`Clone speech preview ready for ${data.profile?.name || "the selected profile"}.`);
}

async function previewAliceVoicebox() {
  const payload = readPayload();
  if (!payload.voicebox_profile_id && !payload.voice_clone_profile_id) {
    throw new Error("Choose a Voicebox clone profile or a singer clone before previewing Alice's spoken cue.");
  }

  const data = await fetchJson("/api/alice-voicebox-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!byId("voicebox_text").value.trim()) {
    byId("voicebox_text").value = data.voicebox_script || "";
  }
  renderAliceVoiceboxResult(data);
  storeAutosave();
  setStatus(`Alice Voicebox cue ready with ${data.profile?.name || "the selected clone"}.`);
}

async function hydrateSystem() {
  try {
    const data = await fetchJson("/api/system");
    const gpu = data.cuda_available ? data.gpu_name || "CUDA GPU" : "CPU";
    const aceStep = data.ace_step?.running
      ? `ACE-Step ${data.ace_step.health?.loaded_model || data.ace_step.default_model} online`
      : data.ace_step?.available
        ? "ACE-Step ready"
        : "ACE-Step missing";
    const ollamaCount = Array.isArray(data.ollama?.available_models) ? data.ollama.available_models.length : 0;
    const ollama = data.ollama?.available
      ? `Ollama ${data.ollama.default_model} ready${ollamaCount ? ` (${ollamaCount} model${ollamaCount === 1 ? "" : "s"})` : ""}`
      : "Astral AI unavailable";
    const stems = data.audio_tools?.available ? `Stem tools on ${data.audio_tools.device}` : "Stem tools unavailable";
    const badge = `${gpu} | ${aceStep} | ${ollama} | ${stems}`;
    systemBadge.textContent = badge;
  } catch (error) {
    systemBadge.textContent = "Runtime detection failed";
  }
}

async function loadDraftLibrary(selectedId = currentDraftId) {
  try {
    const data = await fetchJson("/api/drafts");
    draftSelect.innerHTML = `<option value="">Select a saved draft</option>`;
    (data.drafts || []).forEach((draft) => {
      const option = document.createElement("option");
      option.value = draft.id;
      option.textContent = draft.name;
      if (selectedId && draft.id === selectedId) {
        option.selected = true;
      }
      draftSelect.appendChild(option);
    });
  } catch (error) {
    autosaveStatus.textContent = "Could not load saved drafts.";
  }
}

async function saveDraft() {
  const name = draftName.value.trim() || byId("title").value.trim() || "Astral draft";
  autosaveStatus.textContent = "Saving draft...";
  const data = await fetchJson("/api/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      draft_id: currentDraftId || null,
      payload: readPayload(),
    }),
  });
  currentDraftId = data.id;
  draftName.value = data.name;
  await loadDraftLibrary(currentDraftId);
  autosaveStatus.textContent = `Saved draft "${data.name}".`;
  storeAutosave();
}

async function loadDraft(draftId) {
  if (!draftId) return;
  autosaveStatus.textContent = "Loading draft...";
  const data = await fetchJson(`/api/drafts/${encodeURIComponent(draftId)}`);
  currentDraftId = data.id;
  draftName.value = data.name || "";
  applyPayload(data.payload || {});
  autosaveStatus.textContent = `Loaded draft "${data.name}".`;
  storeAutosave();
}

async function deleteDraft() {
  if (!currentDraftId) {
    autosaveStatus.textContent = "No saved draft selected.";
    return;
  }
  if (!window.confirm("Delete this saved draft?")) {
    return;
  }
  await fetchJson(`/api/drafts/${encodeURIComponent(currentDraftId)}`, { method: "DELETE" });
  currentDraftId = "";
  draftSelect.value = "";
  autosaveStatus.textContent = "Draft deleted.";
  await loadDraftLibrary();
  storeAutosave();
}

async function submitTo(endpoint, mode) {
  composeButton.disabled = true;
  compareButton.disabled = true;
  generateButton.disabled = true;
  previewVoiceButton.disabled = true;
  setStatus(
    mode === "compose-batch"
      ? "Composing a multi-song set from your brief."
      : mode === "generate-compare"
        ? "Rendering the same mapped song through every ready local engine."
      : mode === "compose"
        ? "Composing a whole-song plan."
        : "Generating a full local song. Large vocal runs can take several minutes.",
  );
  resolvedPrompt.classList.add("hidden");
  resolvedLyrics.classList.add("hidden");
  planSummary.classList.add("hidden");

  const payload = readPayload();

  try {
    const data = await fetchJson(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (mode === "compose-batch") {
      renderComposeBatchResults(data);
      setStatus(`Composed ${data.variant_count || latestComposeVariants.length} song plans. Load any variant into the editor to tweak or render it.`);
      storeAutosave();
      return;
    }

    if (mode === "generate-compare") {
      resolvedPrompt.innerHTML = `<strong>Resolved prompt:</strong> ${escapeHtml(data.resolved_prompt || "")}`;
      resolvedPrompt.classList.remove("hidden");
      renderLyrics(data.resolved_lyrics || "");
      renderPlan(data.plan, data.resolved_title, data.resolved_prompt);
      syncResolvedLyricsToEditors(data.resolved_lyrics || "");
      renderCompareResults(data);
      const completed = Number(data.completed_count || 0);
      const failed = Number(data.failed_count || 0);
      setStatus(`Compare run finished with ${completed} engine result${completed === 1 ? "" : "s"}${failed ? ` and ${failed} failure${failed === 1 ? "" : "s"}` : ""}.`);
      storeAutosave();
      return;
    }

    resolvedPrompt.innerHTML = `<strong>Resolved prompt:</strong> ${escapeHtml(data.resolved_prompt)}`;
    resolvedPrompt.classList.remove("hidden");
    renderLyrics(data.resolved_lyrics || "");
    renderPlan(data.plan, data.resolved_title, data.resolved_prompt);
    const syncedLyrics = syncResolvedLyricsToEditors(data.resolved_lyrics || "");

    if (mode === "generate") {
      results.innerHTML = "";
      data.tracks.forEach((track) => {
        results.appendChild(createTrackCard(track, data.session_dir));
      });
      if (data.tracks[0]?.path) {
        byId("split_audio_path").value = data.tracks[0].path;
        byId("alignment_audio_path").value = data.tracks[0].path;
      }
      const stemTracks = data.tracks.filter((track) => ["vocals", "instrumental"].includes(track.role)).length;
      const primaryTracks = data.tracks.filter((track) => !track.role || track.role === "mixed").length;
      const suffix = stemTracks ? ` plus ${stemTracks} native stem track(s)` : "";
      setStatus(`Rendered ${Math.max(1, primaryTracks)} song candidate(s) on ${data.device}${suffix}.`);
    } else {
      const syncNote = syncedLyrics ? " Lyrics synced into the editor." : "";
      setStatus(`Song plan composed with ${data.plan.ai_used ? data.plan.ai_model : "manual settings"}.${syncNote}`);
    }
    storeAutosave();
  } catch (error) {
    const message = error.message || "Generation failed.";
    if (mode === "compose") {
      resolvedPrompt.classList.add("hidden");
      planSummary.classList.add("hidden");
      showError(resolvedLyrics, message);
      setStatus(`Composition failed: ${message}`);
    } else if (mode === "compose-batch") {
      showError(results, message);
      setStatus(`Batch composition failed: ${message}`);
    } else if (mode === "generate-compare") {
      showError(results, message);
      setStatus(`Compare run failed: ${message}`);
    } else {
      showError(results, message);
      setStatus(`Generation failed: ${message}`);
    }
  } finally {
    composeButton.disabled = false;
    compareButton.disabled = false;
    generateButton.disabled = false;
    previewVoiceButton.disabled = false;
  }
}

async function runVoicePreview() {
  previewVoiceButton.disabled = true;
  setStatus("Rendering a short voice preview.");
  const payload = readPayload();
  if (!payload.prompt || payload.prompt.trim().length < 3) {
    payload.prompt = "Cotton candy cosmic vocal spotlight";
  }

  try {
    const data = await fetchJson("/api/voice-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    renderVoicePreviewResult(data);
    if (data.tracks?.[0]?.path) {
      byId("alignment_audio_path").value = data.tracks[0].path;
      byId("split_audio_path").value = data.tracks[0].path;
    }
    setStatus(`Voice preview ready on ${data.device}.`);
    storeAutosave();
  } catch (error) {
    showError(voicePreviewResults, error.message || "Voice preview failed.");
    setStatus("Voice preview failed.");
  } finally {
    previewVoiceButton.disabled = false;
  }
}

async function runSplit() {
  splitButton.disabled = true;
  setToolStatus("Splitting vocals and instrumental...");
  try {
    const data = await fetchJson("/api/stems/separate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audio_path: byId("split_audio_path").value,
        title: byId("split_title").value,
      }),
    });
    renderStemResults(data);
    byId("remix_vocals_path").value = data.vocals.path;
    byId("remix_instrumental_path").value = data.instrumental.path;
    setToolStatus("Stem split complete.");
  } catch (error) {
    showError(stemResults, error.message || "Stem split failed.");
    setToolStatus("Stem split failed.");
  } finally {
    splitButton.disabled = false;
  }
}

async function runRemix() {
  remixButton.disabled = true;
  setToolStatus("Rebuilding the mix...");
  try {
    const data = await fetchJson("/api/stems/remix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vocals_path: byId("remix_vocals_path").value,
        instrumental_path: byId("remix_instrumental_path").value,
        vocals_gain_db: Number(byId("vocals_gain_db").value),
        instrumental_gain_db: Number(byId("instrumental_gain_db").value),
        title: byId("remix_title").value,
      }),
    });
    renderRemixResults(data);
    setToolStatus("Mix rebuilt successfully.");
  } catch (error) {
    showError(remixResults, error.message || "Remix failed.");
    setToolStatus("Mix rebuild failed.");
  } finally {
    remixButton.disabled = false;
  }
}

async function runMatch() {
  matchButton.disabled = true;
  setToolStatus("Matching lyrics to the arrangement...");
  try {
    const data = await fetchJson("/api/alignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audio_path: byId("alignment_audio_path").value,
        lyrics: byId("alignment_lyrics").value,
        tempo_bpm: byId("tempo_bpm").value ? Number(byId("tempo_bpm").value) : null,
        time_signature: byId("time_signature").value,
        mode: byId("alignment_mode").value,
      }),
    });
    renderAlignmentResults(data);
    setToolStatus("Timing map ready.");
  } catch (error) {
    showError(alignmentResults, error.message || "Alignment failed.");
    setToolStatus("Timing map failed.");
  } finally {
    matchButton.disabled = false;
  }
}

form.addEventListener("input", () => {
  updateSliderMirrors();
  syncVoicePreview();
  scheduleAutosave();
});

form.addEventListener("change", () => {
  updateSliderMirrors();
  syncVoicePreview();
  scheduleAutosave();
});

draftName.addEventListener("input", scheduleAutosave);

composeButton.addEventListener("click", async () => {
  const composeVariantCount = Number(composeVariantsField?.value || 1);
  latestComposeVariants = [];
  results.innerHTML = composeVariantCount > 1
    ? `
      <article class="empty-state">
        <h3>Compose set in flight</h3>
        <p>Astral is sketching multiple song plans from this one brief so you can choose the best lane.</p>
      </article>
    `
    : `
      <article class="empty-state">
        <h3>Song plan preview</h3>
        <p>Compose a plan to preview the prompt, lyrics, and voice shape before rendering.</p>
      </article>
    `;
  await submitTo(
    composeVariantCount > 1 ? "/api/compose-batch" : "/api/compose",
    composeVariantCount > 1 ? "compose-batch" : "compose",
  );
});

compareButton.addEventListener("click", async () => {
  latestComposeVariants = [];
  results.innerHTML = `
    <article class="empty-state">
      <h3>Engine compare in flight</h3>
      <p>Astral is holding the mapped prompt and lyrics steady while it renders each ready local engine side by side.</p>
    </article>
  `;
  await submitTo("/api/generate-compare", "generate-compare");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitTo("/api/generate", "generate");
});

saveDraftButton.addEventListener("click", async () => {
  try {
    await saveDraft();
  } catch (error) {
    autosaveStatus.textContent = error.message || "Draft save failed.";
  }
});

newDraftButton.addEventListener("click", () => {
  currentDraftId = "";
  draftSelect.value = "";
  draftName.focus();
  autosaveStatus.textContent = "Ready to save as a new draft.";
  scheduleAutosave();
});

deleteDraftButton.addEventListener("click", async () => {
  try {
    await deleteDraft();
  } catch (error) {
    autosaveStatus.textContent = error.message || "Draft delete failed.";
  }
});

draftSelect.addEventListener("change", async (event) => {
  const nextId = event.target.value;
  if (!nextId) {
    currentDraftId = "";
    return;
  }
  try {
    await loadDraft(nextId);
  } catch (error) {
    autosaveStatus.textContent = error.message || "Draft load failed.";
  }
});

splitButton.addEventListener("click", runSplit);
remixButton.addEventListener("click", runRemix);
matchButton.addEventListener("click", runMatch);
copyLyricsButton.addEventListener("click", () => {
  byId("alignment_lyrics").value = byId("lyrics").value;
  setToolStatus("Copied the current lyrics into Match Lab.");
});
previewVoiceButton.addEventListener("click", runVoicePreview);
fillPreviewLyricButton.addEventListener("click", () => {
  const lyrics = byId("lyrics").value
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !(line.startsWith("[") && line.endsWith("]")));
  byId("preview_text").value = lyrics || "";
  scheduleAutosave();
  setStatus(lyrics ? "Loaded the first lyric line into the Voice Booth." : "No lyric line found yet.");
});
refreshCloneProfilesButton.addEventListener("click", async () => {
  try {
    await loadVoiceCloneProfiles();
    setStatus("Voice clone profiles refreshed.");
  } catch (error) {
    showError(cloneResults, error.message || "Could not refresh voice clones.");
    setStatus("Voice clone refresh failed.");
  }
});
createCloneProfileButton.addEventListener("click", async () => {
  createCloneProfileButton.disabled = true;
  setStatus("Creating a cloned voice profile.");
  try {
    await createVoiceCloneProfile();
  } catch (error) {
    showError(cloneResults, error.message || "Voice clone profile creation failed.");
    setStatus("Voice clone profile creation failed.");
  } finally {
    createCloneProfileButton.disabled = false;
  }
});
addCloneSampleButton.addEventListener("click", async () => {
  addCloneSampleButton.disabled = true;
  setStatus("Adding a new clone sample.");
  try {
    await addVoiceCloneSample();
  } catch (error) {
    showError(cloneResults, error.message || "Adding the clone sample failed.");
    setStatus("Clone sample add failed.");
  } finally {
    addCloneSampleButton.disabled = false;
  }
});
previewCloneButton.addEventListener("click", async () => {
  previewCloneButton.disabled = true;
  setStatus("Rendering a cloned speech preview.");
  try {
    await previewVoiceClone();
  } catch (error) {
    showError(cloneResults, error.message || "Clone speech preview failed.");
    setStatus("Clone speech preview failed.");
  } finally {
    previewCloneButton.disabled = false;
  }
});
previewAliceVoiceboxButton?.addEventListener("click", async () => {
  previewAliceVoiceboxButton.disabled = true;
  setStatus("Alice is preparing a Voicebox cue.");
  try {
    await previewAliceVoicebox();
  } catch (error) {
    showError(aliceLabResults, error.message || "Alice Voicebox preview failed.");
    setStatus("Alice Voicebox preview failed.");
  } finally {
    previewAliceVoiceboxButton.disabled = false;
  }
});
railComposeButton?.addEventListener("click", () => composeButton.click());
railCompareButton?.addEventListener("click", () => compareButton.click());
railGenerateButton?.addEventListener("click", () => generateButton.click());
railPreviewVoiceButton?.addEventListener("click", () => previewVoiceButton.click());
railAliceVoiceboxButton?.addEventListener("click", () => previewAliceVoiceboxButton?.click());
byId("voice_clone_profile_id").addEventListener("change", () => {
  syncSelectedCloneProfileMeta();
  if (!byId("voicebox_profile_id")?.value) {
    syncSelectedVoiceboxProfileMeta();
  }
  syncVoicePreview();
  scheduleAutosave();
});
byId("voicebox_profile_id")?.addEventListener("change", () => {
  syncSelectedVoiceboxProfileMeta();
  syncAliceLabMeta();
  scheduleAutosave();
});

document.addEventListener("click", (event) => {
  const modeButton = event.target.closest("[data-ui-mode]");
  if (modeButton) {
    setUiMode(modeButton.dataset.uiMode || "quick");
    return;
  }

  const presetButton = event.target.closest("[data-preset-id]");
  if (presetButton) {
    const presetId = presetButton.dataset.presetId || "";
    const preset = (latestCatalog?.quickstart_presets || []).find((item) => item.id === presetId);
    if (preset) {
      applyQuickstartPreset(preset);
    }
    return;
  }

  const aliceProfileButton = event.target.closest("[data-alice-profile-id]");
  if (aliceProfileButton) {
    const profileId = aliceProfileButton.dataset.aliceProfileId || "";
    const profile = (latestCatalog?.alice_lab_profiles || []).find((item) => item.id === profileId);
    if (profile) {
      applyAliceProfile(profile);
    }
    return;
  }

  const composeVariantButton = event.target.closest("[data-compose-variant-index]");
  if (composeVariantButton) {
    loadComposeVariant(Number(composeVariantButton.dataset.composeVariantIndex));
    return;
  }

  const engineSelectButton = event.target.closest("[data-engine-select]");
  if (engineSelectButton) {
    const songSelect = byId("song_model");
    if (songSelect) {
      songSelect.value = engineSelectButton.dataset.engineSelect || "";
      syncModelSelectionNotes();
      scheduleAutosave();
      setStatus(`Selected song engine: ${songSelect.options[songSelect.selectedIndex]?.textContent || songSelect.value}.`);
    }
    return;
  }

  const button = event.target.closest("[data-fill-target]");
  if (!button) return;
  const target = byId(button.dataset.fillTarget);
  if (!target) return;
  target.value = button.dataset.fillValue || "";
  if (button.dataset.fillTarget === "alignment_audio_path") {
    setToolStatus("Loaded that audio into Match Lab.");
  }
  if (button.dataset.fillTarget === "split_audio_path") {
    setToolStatus("Loaded that audio into Stem Studio.");
  }
});

restoreUiMode();
restoreAutosave();
hydrateCatalog().catch((error) => {
  composerModelNote.textContent = error.message || "Model catalog unavailable.";
});
hydrateSystem();
loadDraftLibrary();
updateComposeButtonLabel();
loadVoiceCloneProfiles().catch((error) => {
  cloneProfileMeta.textContent = error.message || "Voice clone profiles unavailable.";
});
byId("ai_model").addEventListener("change", () => {
  syncModelSelectionNotes();
  scheduleAutosave();
});
byId("song_model").addEventListener("change", () => {
  syncModelSelectionNotes();
  syncSelectedEngineBehavior();
  scheduleAutosave();
});
byId("vocal_mode").addEventListener("change", () => {
  syncSelectedEngineBehavior();
  scheduleAutosave();
});
composeVariantsField.addEventListener("change", () => {
  updateComposeButtonLabel();
  scheduleAutosave();
});
