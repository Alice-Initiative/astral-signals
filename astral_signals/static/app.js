const LAST_DRAFT_KEY = "astral-signals:last-draft";
const UI_MODE_KEY = "astral-signals:ui-mode";
const MIX_SESSION_KEY = "astral-signals:mix-session";
const STUDIO_PANE_KEY = "astral-signals:studio-pane";
const FORGE_PANE_KEY = "astral-signals:forge-pane";
const STUDIO_HASHES = new Set(["#aliceLab", "#arrangementDeck", "#createStudio", "#instrumentDeck", "#mixDeck", "#outputDeck", "#stemStudio", "#voiceLab"]);

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
const mixAddTrackButton = byId("mixAddTrackButton");
const mixQuickAddButton = byId("mixQuickAddButton");
const mixAssistButton = byId("mixAssistButton");
const mixRenderButton = byId("mixRenderButton");
const copyLyricsButton = byId("copyLyricsButton");
const previewVoiceButton = byId("previewVoiceButton");
const fillPreviewLyricButton = byId("fillPreviewLyricButton");
const previewAliceVoiceboxButton = byId("previewAliceVoiceboxButton");
const composeVariantsField = byId("compose_variants");
const refreshCloneProfilesButton = byId("refreshCloneProfilesButton");
const createCloneProfileButton = byId("createCloneProfileButton");
const addCloneSampleButton = byId("addCloneSampleButton");
const previewCloneButton = byId("previewCloneButton");
const refreshSyntheticVoicesButton = byId("refreshSyntheticVoicesButton");
const previewSyntheticVoiceButton = byId("previewSyntheticVoiceButton");
const createSyntheticVoiceButton = byId("createSyntheticVoiceButton");
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
const mixResults = byId("mixResults");
const alignmentResults = byId("alignmentResults");
const voicePreviewResults = byId("voicePreviewResults");
const cloneResults = byId("cloneResults");
const syntheticVoiceResults = byId("syntheticVoiceResults");
const syntheticVoiceMeta = byId("syntheticVoiceMeta");
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
const studioWorkspaceNav = byId("studioWorkspaceNav");
const forgeRoomNav = byId("forgeRoomNav");
const mixTrackList = byId("mixTrackList");
const mixLabMeta = byId("mixLabMeta");
const mixDeckStatus = byId("mixDeckStatus");
const mixQuickPath = byId("mix_quick_path");
const mixRuler = byId("mixRuler");
const mixLaneList = byId("mixLaneList");
const mixInspectorPanel = byId("mixInspectorPanel");
const mixTrackCount = byId("mixTrackCount");
const mixTimelineSummary = byId("mixTimelineSummary");
const mixSelectedLabel = byId("mixSelectedLabel");
const arrangementPartList = byId("arrangementPartList");
const arrangementInspectorPanel = byId("arrangementInspectorPanel");
const arrangementSectionGrid = byId("arrangementSectionGrid");
const arrangementSectionSummary = byId("arrangementSectionSummary");
const arrangementSelectedLabel = byId("arrangementSelectedLabel");
const arrangementAddPartButton = byId("arrangementAddPartButton");
const instrumentDeckMeta = byId("instrumentDeckMeta");
const instrumentTemplateButtons = byId("instrumentTemplateButtons");
const instrumentPaletteCatalog = byId("instrumentPaletteCatalog");
const instrumentTrackList = byId("instrumentTrackList");
const instrumentRollViewport = byId("instrumentRollViewport");
const instrumentGridHeader = byId("instrumentGridHeader");
const instrumentGrid = byId("instrumentGrid");
const instrumentInspectorPanel = byId("instrumentInspectorPanel");
const instrumentSelectedLabel = byId("instrumentSelectedLabel");
const instrumentTrackCount = byId("instrumentTrackCount");
const instrumentGridSummary = byId("instrumentGridSummary");
const instrumentPlayheadLabel = byId("instrumentPlayheadLabel");
const instrumentAddTrackButton = byId("instrumentAddTrackButton");
const instrumentPlayButton = byId("instrumentPlayButton");
const instrumentStopButton = byId("instrumentStopButton");
const instrumentUndoButton = byId("instrumentUndoButton");
const instrumentRedoButton = byId("instrumentRedoButton");
const instrumentCopyButton = byId("instrumentCopyButton");
const instrumentPasteButton = byId("instrumentPasteButton");
const instrumentDuplicateButton = byId("instrumentDuplicateButton");
const instrumentDrawModeButton = byId("instrumentDrawModeButton");
const instrumentSelectModeButton = byId("instrumentSelectModeButton");
const instrumentKeyboardButton = byId("instrumentKeyboardButton");
const instrumentRecordButton = byId("instrumentRecordButton");
const instrumentPushArrangementButton = byId("instrumentPushArrangementButton");
const instrumentLoopSelectionButton = byId("instrumentLoopSelectionButton");
const instrumentClearLoopButton = byId("instrumentClearLoopButton");
const instrumentLoopSummary = byId("instrumentLoopSummary");
const instrumentQuantizeButton = byId("instrumentQuantizeButton");
const instrumentHumanizeButton = byId("instrumentHumanizeButton");
const instrumentQuantizeResolutionField = byId("instrumentQuantizeResolution");
const instrumentZoomControls = byId("instrumentZoomControls");
const instrumentInputLengthField = byId("instrumentInputLength");
const instrumentCursorBackButton = byId("instrumentCursorBackButton");
const instrumentCursorForwardButton = byId("instrumentCursorForwardButton");
const instrumentCursorLabel = byId("instrumentCursorLabel");
const instrumentKeyboardHint = byId("instrumentKeyboardHint");
const instrumentVelocityLane = byId("instrumentVelocityLane");
const instrumentVelocitySummary = byId("instrumentVelocitySummary");
const instrumentGuideStatus = byId("instrumentGuideStatus");
const instrumentGuideHint = byId("instrumentGuideHint");
const instrumentModeSummary = byId("instrumentModeSummary");
const instrumentSelectionSummary = byId("instrumentSelectionSummary");
const instrumentShortcutSummary = byId("instrumentShortcutSummary");

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
let mixTrackSeed = 1;
let mixLabTracks = [];
let selectedMixTrackId = "";
let studioPane = "songforge";
let forgePane = "blueprint";
let arrangementPartSeed = 1;
let arrangementParts = [];
let selectedArrangementPartId = "";
let arrangementSections = [];
let instrumentTrackSeed = 1;
let instrumentTracks = [];
let selectedInstrumentTrackId = "";
let selectedInstrumentNote = null;
let selectedInstrumentNoteKeys = [];
let instrumentZoom = "medium";
let instrumentTransport = {
  playing: false,
  step: -1,
  transportTick: -1,
  startAbsoluteStep: 0,
  startContextTime: 0,
  stepDurationSec: 0,
  loopStart: 0,
  loopLength: 0,
  timer: null,
  context: null,
  noiseBuffer: null,
};
let instrumentDrawState = null;
let instrumentNoteGesture = null;
let instrumentSelectionGesture = null;
let instrumentVelocityGesture = null;
let instrumentSelectMode = false;
let instrumentKeyboardMode = false;
let instrumentRecordMode = false;
let instrumentInputStepLength = 2;
let instrumentEditCursorStep = 0;
let instrumentLoopEnabled = false;
let instrumentLoopStart = 0;
let instrumentLoopLength = 16;
let instrumentQuantizeResolution = 0.25;
let instrumentSuppressClickUntil = 0;
let instrumentAuditionState = { activeUntil: 0, label: "" };
let instrumentAuditionTimer = null;
const instrumentHeldInputs = new Map();
let instrumentClipboard = null;
let instrumentHistory = [];
let instrumentHistoryIndex = -1;
let instrumentHistoryHash = "";
let instrumentHistorySuspended = false;

const INSTRUMENT_MELODIC_KEYBOARD = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
const INSTRUMENT_DRUM_KEYBOARD = ["a", "s", "d", "f", "g", "h", "j"];
const INSTRUMENT_MIN_NOTE_LENGTH = 0.125;
const INSTRUMENT_STEP_PRECISION = 3;
const INSTRUMENT_QUANTIZE_OPTIONS = [0.125, 0.25, 0.5, 1, 2];
const INSTRUMENT_ROLE_OPTIONS = [
  "drums",
  "perc",
  "bass",
  "sub",
  "keys",
  "piano",
  "epiano",
  "organ",
  "synth",
  "lead",
  "pluck",
  "guitar",
  "pad",
  "strings",
  "brass",
  "choir",
  "bell",
  "flute",
  "arp",
  "fx",
];
const INSTRUMENT_SOUND_OPTIONS = [
  "drum-kit",
  "noise-kit",
  "sine",
  "triangle",
  "square",
  "sawtooth",
  "pulse",
  "supersaw",
  "fm-bass",
  "pluck",
  "bell",
  "organ",
  "warm-pad",
  "brass",
  "choir",
  "flute",
  "shimmer",
];
const INSTRUMENT_SOUND_LABELS = {
  "drum-kit": "Neo Drum Kit",
  "noise-kit": "Noise Percussion",
  sine: "Pure Sine",
  triangle: "Soft Triangle",
  square: "Square Pulse",
  sawtooth: "Saw Lead",
  pulse: "Pulse Wave",
  supersaw: "Supersaw Stack",
  "fm-bass": "FM Bass",
  pluck: "Crystal Pluck",
  bell: "Star Bell",
  organ: "Dream Organ",
  "warm-pad": "Warm Pad",
  brass: "Solar Brass",
  choir: "Choir Bloom",
  flute: "Air Flute",
  shimmer: "Shimmer Spark",
};
const INSTRUMENT_TEMPLATE_LIBRARY = [
  { template: "drums", label: "Drums", role: "drums", synth_type: "drum-kit", volume: 0.86, base_midi: 48, steps: 16, category: "Rhythm", description: "Full local kit for the backbone groove." },
  { template: "perc", label: "Percussion", role: "perc", synth_type: "noise-kit", volume: 0.78, base_midi: 48, steps: 16, category: "Rhythm", description: "Shakers, rims, snaps, and motion layers." },
  { template: "bass", label: "Bass", role: "bass", synth_type: "fm-bass", volume: 0.76, base_midi: 36, steps: 16, category: "Low End", description: "Round low-end pulse for the root movement." },
  { template: "sub", label: "Sub Bass", role: "sub", synth_type: "sine", volume: 0.72, base_midi: 30, steps: 16, category: "Low End", description: "Deep support layer for weight under the mix." },
  { template: "piano", label: "Piano", role: "piano", synth_type: "bell", volume: 0.68, base_midi: 60, steps: 32, category: "Harmony", description: "Bright songwriting lane for chords and motifs." },
  { template: "keys", label: "Keys", role: "keys", synth_type: "triangle", volume: 0.66, base_midi: 60, steps: 32, category: "Harmony", description: "Neutral keys lane for simple chord work." },
  { template: "epiano", label: "E-Piano", role: "epiano", synth_type: "sine", volume: 0.66, base_midi: 60, steps: 32, category: "Harmony", description: "Soft electric feel for warm midrange chords." },
  { template: "organ", label: "Organ", role: "organ", synth_type: "organ", volume: 0.64, base_midi: 57, steps: 32, category: "Harmony", description: "Held harmony with a bigger sustained body." },
  { template: "guitar", label: "Guitar", role: "guitar", synth_type: "pluck", volume: 0.68, base_midi: 55, steps: 32, category: "Harmony", description: "Picked figures and octave hooks." },
  { template: "lead", label: "Lead", role: "lead", synth_type: "supersaw", volume: 0.72, base_midi: 67, steps: 32, category: "Lead", description: "Front-line melody lane for memorable hooks." },
  { template: "synth", label: "Lead Synth", role: "synth", synth_type: "sawtooth", volume: 0.72, base_midi: 67, steps: 32, category: "Lead", description: "Classic synth lane for riffs and counter-lines." },
  { template: "pluck", label: "Pluck", role: "pluck", synth_type: "pluck", volume: 0.68, base_midi: 72, steps: 32, category: "Lead", description: "Sharp transient phrase maker for arps and hooks." },
  { template: "bell", label: "Bell", role: "bell", synth_type: "bell", volume: 0.6, base_midi: 74, steps: 32, category: "Lead", description: "Sparkling top line for celestial motifs." },
  { template: "flute", label: "Flute", role: "flute", synth_type: "flute", volume: 0.62, base_midi: 72, steps: 32, category: "Lead", description: "Airy melodic lane for gentle emotional leads." },
  { template: "arp", label: "Arp", role: "arp", synth_type: "pulse", volume: 0.7, base_midi: 72, steps: 32, category: "Motion", description: "Pulse engine for movement and lift." },
  { template: "pad", label: "Pad", role: "pad", synth_type: "warm-pad", volume: 0.62, base_midi: 60, steps: 32, category: "Atmosphere", description: "Wide bed that glues sections together." },
  { template: "strings", label: "Strings", role: "strings", synth_type: "choir", volume: 0.64, base_midi: 67, steps: 32, category: "Atmosphere", description: "Cinematic swell and emotional rise." },
  { template: "choir", label: "Choir", role: "choir", synth_type: "choir", volume: 0.6, base_midi: 67, steps: 32, category: "Atmosphere", description: "Vocal-style harmonic cloud behind the lead." },
  { template: "brass", label: "Brass", role: "brass", synth_type: "brass", volume: 0.7, base_midi: 55, steps: 32, category: "Atmosphere", description: "Punch and lift for anthem moments." },
  { template: "fx", label: "FX", role: "fx", synth_type: "shimmer", volume: 0.56, base_midi: 76, steps: 32, category: "Atmosphere", description: "Transitions, risers, and signal textures." },
];

const STUDIO_PANE_FOCUS = {
  songforge: "createStudio",
  mixdeck: "mixDeck",
  stemstudio: "stemStudio",
  outputdeck: "outputDeck",
};

const FORGE_PANE_FOCUS = {
  blueprint: "createStudio",
  lyrics: "lyrics",
  arrangement: "arrangementDeck",
  instrument: "instrumentDeck",
  alice: "aliceLab",
  voice: "voiceLab",
  render: "createStudio",
};

function setStatus(message) {
  statusLine.textContent = message;
}

function setToolStatus(message) {
  toolStatusLine.textContent = message;
}

function waitForUiFrame(delayMs = 0) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

function openVoicePreviewWorkspace(focusId = "voicePreviewResults") {
  setUiMode("studio");
  setStudioPane("songforge", { focusId });
  setForgePane("voice", { focusId });
}

function openMixDeckWorkspace(focusId = "mixDeck") {
  setUiMode("studio");
  setStudioPane("mixdeck", { focusId });
}

async function tryPlayResultAudio(resultSelector, { retries = 6, delayMs = 160 } = {}) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const audio = document.querySelector(`${resultSelector} audio`);
    if (audio) {
      try {
        audio.currentTime = 0;
        await audio.play();
        return true;
      } catch (error) {
        return false;
      }
    }
    await waitForUiFrame(delayMs);
  }
  return false;
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
  syncStudioWorkspace();
  if (uiMode === "studio") {
    const focusTarget = studioPane === "songforge"
      ? (FORGE_PANE_FOCUS[forgePane] || "createStudio")
      : (STUDIO_PANE_FOCUS[studioPane] || "createStudio");
    scrollStudioViewportTo(focusTarget);
  }
}

function restoreUiMode() {
  const preferredMode = STUDIO_HASHES.has(window.location.hash)
    ? "studio"
    : (localStorage.getItem(UI_MODE_KEY) || "quick");
  setUiMode(preferredMode, { persist: false });
}

function normalizeInstrumentZoom(value = "") {
  return ["compact", "medium", "large"].includes(value) ? value : "medium";
}

function formatInstrumentRoleLabel(role = "") {
  const value = `${role || ""}`.trim();
  if (!value) return "Track";
  return value
    .split(/[\s_-]+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatInstrumentSoundLabel(sound = "") {
  return INSTRUMENT_SOUND_LABELS[sound] || formatInstrumentRoleLabel(sound);
}

function getInstrumentTemplatePreset(templateOrRole = "keys") {
  const normalized = `${templateOrRole || "keys"}`.trim().toLowerCase();
  return INSTRUMENT_TEMPLATE_LIBRARY.find((item) => item.template === normalized)
    || INSTRUMENT_TEMPLATE_LIBRARY.find((item) => item.role === normalized)
    || INSTRUMENT_TEMPLATE_LIBRARY.find((item) => item.template === "keys")
    || INSTRUMENT_TEMPLATE_LIBRARY[0];
}

function normalizeInstrumentArrangementRole(role = "other") {
  const map = {
    drums: "drums",
    perc: "fx",
    bass: "bass",
    sub: "bass",
    keys: "piano",
    piano: "piano",
    epiano: "piano",
    organ: "piano",
    synth: "synth",
    lead: "synth",
    pluck: "synth",
    guitar: "guitar",
    pad: "pad",
    strings: "strings",
    brass: "strings",
    choir: "pad",
    bell: "synth",
    flute: "synth",
    arp: "synth",
    fx: "fx",
  };
  return map[role] || "other";
}

function normalizeInstrumentQuantizeResolution(value = 0.25) {
  const numeric = Number(value || 0.25);
  return INSTRUMENT_QUANTIZE_OPTIONS.includes(numeric) ? numeric : 0.25;
}

function setInstrumentZoom(value, { render = true } = {}) {
  instrumentZoom = normalizeInstrumentZoom(value);
  document.body.dataset.instrumentZoom = instrumentZoom;
  instrumentZoomControls?.querySelectorAll("[data-instrument-zoom]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.instrumentZoom === instrumentZoom);
  });
  if (render) {
    renderInstrumentDeck();
  }
}

function studioPaneFromHash() {
  const hash = window.location.hash;
  if (hash === "#createStudio" || hash === "#arrangementDeck" || hash === "#instrumentDeck" || hash === "#aliceLab" || hash === "#voiceLab" || hash === "#cloneStudio") {
    return "songforge";
  }
  if (hash === "#mixDeck") return "mixdeck";
  if (hash === "#stemStudio") return "stemstudio";
  if (hash === "#outputDeck") return "outputdeck";
  return "";
}

function forgePaneFromHash() {
  const hash = window.location.hash;
  if (hash === "#createStudio") return "blueprint";
  if (hash === "#arrangementDeck") return "arrangement";
  if (hash === "#instrumentDeck") return "instrument";
  if (hash === "#aliceLab") return "alice";
  if (hash === "#voiceLab" || hash === "#cloneStudio") return "voice";
  return "";
}

function setStudioPane(pane, { persist = true, focusId = "" } = {}) {
  if (pane !== "songforge" && instrumentTransport.playing) {
    stopInstrumentPlayback();
  }
  if (pane !== "songforge" && instrumentNoteGesture) {
    cancelInstrumentNoteGesture();
  }
  if (pane !== "songforge" && instrumentVelocityGesture) {
    cancelInstrumentVelocityGesture();
  }
  if (pane !== "songforge" && instrumentSelectionGesture) {
    cancelInstrumentSelectionGesture();
  }
  if (pane !== "songforge") {
    stopAllHeldInstrumentInputs();
  }
  studioPane = pane || "songforge";
  document.body.dataset.studioPane = studioPane;
  studioWorkspaceNav?.querySelectorAll("[data-studio-pane]").forEach((button) => {
    const buttonPane = button.dataset.studioPane || "songforge";
    const buttonFocus = button.dataset.studioFocus || "";
    const active = buttonPane === studioPane && (!focusId ? !buttonFocus : buttonFocus === focusId);
    button.classList.toggle("is-active", active);
  });
  if (persist) {
    localStorage.setItem(STUDIO_PANE_KEY, studioPane);
  }
  syncStudioWorkspace();
  scrollStudioViewportTo(focusId || STUDIO_PANE_FOCUS[studioPane] || "createStudio");
}

function restoreStudioPane() {
  const fromHash = studioPaneFromHash();
  const preferredPane = fromHash || localStorage.getItem(STUDIO_PANE_KEY) || "songforge";
  studioPane = preferredPane;
  document.body.dataset.studioPane = studioPane;
}

function syncStudioWorkspace() {
  const studioPanels = document.querySelectorAll("[data-studio-panel]");
  const isStudio = uiMode === "studio";
  studioPanels.forEach((panel) => {
    const panelName = panel.dataset.studioPanel || "songforge";
    panel.hidden = isStudio && panelName !== studioPane;
  });
  syncForgeWorkspace();
}

function setForgePane(pane, { persist = true, focusId = "" } = {}) {
  if ((pane || "blueprint") !== "instrument" && instrumentTransport.playing) {
    stopInstrumentPlayback();
  }
  if ((pane || "blueprint") !== "instrument" && instrumentNoteGesture) {
    cancelInstrumentNoteGesture();
  }
  if ((pane || "blueprint") !== "instrument" && instrumentVelocityGesture) {
    cancelInstrumentVelocityGesture();
  }
  if ((pane || "blueprint") !== "instrument" && instrumentSelectionGesture) {
    cancelInstrumentSelectionGesture();
  }
  if ((pane || "blueprint") !== "instrument") {
    stopAllHeldInstrumentInputs();
  }
  forgePane = pane || "blueprint";
  document.body.dataset.forgePane = forgePane;
  forgeRoomNav?.querySelectorAll("[data-forge-pane]").forEach((button) => {
    const buttonPane = button.dataset.forgePane || "blueprint";
    button.classList.toggle("is-active", buttonPane === forgePane);
  });
  if (persist) {
    localStorage.setItem(FORGE_PANE_KEY, forgePane);
  }
  syncForgeWorkspace();
  scrollStudioViewportTo(focusId || FORGE_PANE_FOCUS[forgePane] || "createStudio");
}

function restoreForgePane() {
  const fromHash = forgePaneFromHash();
  forgePane = fromHash || localStorage.getItem(FORGE_PANE_KEY) || "blueprint";
  document.body.dataset.forgePane = forgePane;
}

function syncForgeWorkspace() {
  const forgePanels = document.querySelectorAll(".forge-pane-panel");
  const useFocusedForgePane = uiMode === "studio" && studioPane === "songforge";
  forgePanels.forEach((panel) => {
    const panelName = panel.dataset.forgePane || "blueprint";
    panel.hidden = useFocusedForgePane && panelName !== forgePane;
  });
}

function scrollStudioViewportTo(targetId) {
  if (!targetId) return;
  window.requestAnimationFrame(() => {
    const target = byId(targetId);
    if (!target) return;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 12);
    window.scrollTo({ top, behavior: "auto" });
  });
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
  const selectedOption = [...select.options].find((option) => option.value === select.value);
  if (selectedOption?.disabled) {
    const firstEnabled = [...select.options].find((option) => !option.disabled);
    if (firstEnabled) {
      select.value = firstEnabled.value;
    }
  }
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
  const status = selectedOption?.dataset?.status || "";
  document.body.dataset.songBackend = backend || "ace-step";
  if (status === "cuda-required") {
    setToolStatus("This backend needs CUDA. On CPU-only machines, use MusicGen for local sketch renders.");
    return;
  }
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

function clampMixNumber(value, minimum, maximum, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function inferMixRole(label = "", path = "") {
  const value = `${label} ${path}`.toLowerCase();
  if (value.includes("vocal") || value.includes("lead")) return "vocals";
  if (value.includes("harmony") || value.includes("backing")) return "harmony";
  if (value.includes("double") || value.includes("adlib")) return "doubles";
  if (value.includes("drum") || value.includes("kick") || value.includes("snare")) return "drums";
  if (value.includes("bass") || value.includes("sub")) return "bass";
  if (value.includes("pad")) return "pad";
  if (value.includes("fx") || value.includes("sfx") || value.includes("effect")) return "fx";
  if (value.includes("ambience") || value.includes("atmo")) return "ambience";
  if (value.includes("guitar")) return "guitar";
  if (value.includes("piano") || value.includes("keys")) return "piano";
  if (value.includes("synth") || value.includes("arp")) return "synth";
  if (value.includes("spoken") || value.includes("narrat")) return "spoken";
  if (value.includes("hook") || value.includes("melody")) return "melody";
  if (value.includes("instrumental")) return "instrumental";
  return "other";
}

function createMixTrack(overrides = {}) {
  const baseLabel = (overrides.label || "").trim();
  const basePath = (overrides.path || "").trim();
  return {
    id: overrides.id || `mix-track-${mixTrackSeed++}`,
    label: baseLabel,
    path: basePath,
    role: overrides.role || inferMixRole(baseLabel, basePath),
    gain_db: clampMixNumber(overrides.gain_db ?? 0, -24, 24, 0),
    pan: clampMixNumber(overrides.pan ?? 0, -100, 100, 0),
    mute: Boolean(overrides.mute),
    solo: Boolean(overrides.solo),
    start_seconds: clampMixNumber(overrides.start_seconds ?? 0, 0, 1200, 0),
    trim_in_seconds: clampMixNumber(overrides.trim_in_seconds ?? 0, 0, 1200, 0),
    trim_out_seconds: clampMixNumber(overrides.trim_out_seconds ?? 0, 0, 1200, 0),
    fade_in_seconds: clampMixNumber(overrides.fade_in_seconds ?? 0, 0, 30, 0),
    fade_out_seconds: clampMixNumber(overrides.fade_out_seconds ?? 0, 0, 30, 0),
    duration_seconds: clampMixNumber(overrides.duration_seconds ?? 0, 0, 7200, 0),
    sample_rate: Number(overrides.sample_rate || 0),
    channels: Number(overrides.channels || 0),
    peak: Number(overrides.peak || 0),
    analyzed: Boolean(overrides.analyzed),
  };
}

function getSelectedMixTrack() {
  return mixLabTracks.find((track) => track.id === selectedMixTrackId) || null;
}

function trackAudibleDuration(track) {
  const raw = Number(track.duration_seconds || 0) - Number(track.trim_in_seconds || 0) - Number(track.trim_out_seconds || 0);
  return Math.max(0.35, raw || 0.35);
}

function estimateMixDeckLength() {
  if (!mixLabTracks.length) return 16;
  const maxEnd = mixLabTracks.reduce((longest, track) => {
    const end = Number(track.start_seconds || 0) + trackAudibleDuration(track);
    return Math.max(longest, end);
  }, 0);
  return Math.max(16, Math.ceil(maxEnd + 2));
}

function getMixRoleAccent(role = "other") {
  const map = {
    vocals: "pink",
    harmony: "lavender",
    doubles: "lavender",
    spoken: "gold",
    drums: "blue",
    perc: "blue",
    bass: "mint",
    sub: "mint",
    instrumental: "indigo",
    synth: "cyan",
    lead: "cyan",
    arp: "cyan",
    melody: "pink",
    pad: "violet",
    fx: "gold",
    ambience: "violet",
    piano: "indigo",
    keys: "indigo",
    epiano: "indigo",
    organ: "indigo",
    guitar: "mint",
    strings: "lavender",
    brass: "gold",
    choir: "lavender",
    bell: "pink",
    flute: "cyan",
    pluck: "pink",
    other: "indigo",
  };
  return map[role] || "indigo";
}

function setMixDeckStatus(message) {
  if (mixDeckStatus) {
    mixDeckStatus.textContent = message;
  }
}

function storeMixSession() {
  try {
    localStorage.setItem(MIX_SESSION_KEY, JSON.stringify({
      title: byId("mix_title")?.value || "",
      normalize_output: Boolean(byId("mix_normalize_output")?.checked),
      selected_track_id: selectedMixTrackId,
      tracks: mixLabTracks,
    }));
  } catch (error) {
    // Ignore storage failures and keep the live session in memory.
  }
}

function restoreMixSession() {
  try {
    const raw = localStorage.getItem(MIX_SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (byId("mix_title")) {
      byId("mix_title").value = parsed.title || "";
    }
    if (byId("mix_normalize_output")) {
      byId("mix_normalize_output").checked = parsed.normalize_output !== false;
    }
    mixLabTracks = Array.isArray(parsed.tracks) ? parsed.tracks.map((track) => createMixTrack(track)) : [];
    selectedMixTrackId = parsed.selected_track_id || mixLabTracks[0]?.id || "";
  } catch (error) {
    mixLabTracks = [];
    selectedMixTrackId = "";
  }
}

function summarizeMixLab() {
  if (!mixLabMeta) return;
  if (!mixLabTracks.length) {
    mixLabMeta.textContent = "Stack vocals, stems, spoken cues, and renders into one session. Alice can suggest a starting mix, then you can fine-tune and bounce it locally.";
    return;
  }

  const active = mixLabTracks.filter((track) => !track.mute);
  const soloed = active.filter((track) => track.solo);
  const analyzed = mixLabTracks.filter((track) => track.analyzed).length;
  const sessionLength = estimateMixDeckLength();
  mixLabMeta.textContent = `${mixLabTracks.length} track${mixLabTracks.length === 1 ? "" : "s"} loaded | ${active.length} active | ${soloed.length ? `${soloed.length} soloed` : "full blend"} | ${analyzed} analyzed | ${sessionLength}s timeline`;
}

function selectMixTrack(trackId) {
  selectedMixTrackId = trackId || mixLabTracks[0]?.id || "";
  renderMixDeck();
}

function renderMixTrackList() {
  if (!mixTrackList) return;
  if (!mixLabTracks.length) {
    mixTrackList.innerHTML = `
      <article class="empty-state compact">
        <h3>No mix session yet</h3>
        <p>Add a render, split stems, or a voice preview into Mix Deck to start shaping a real session.</p>
      </article>
    `;
    return;
  }

  mixTrackList.innerHTML = mixLabTracks.map((track, index) => `
    <button
      type="button"
      class="mix-track-row ${track.id === selectedMixTrackId ? "is-active" : ""}"
      data-mix-select-id="${escapeHtml(track.id)}"
    >
      <span class="mix-track-swatch" data-accent="${escapeHtml(getMixRoleAccent(track.role))}"></span>
      <span class="mix-track-main">
        <strong>${escapeHtml(track.label || `Track ${index + 1}`)}</strong>
        <span>${escapeHtml(track.role || "other")} ${track.duration_seconds ? `| ${track.duration_seconds}s` : "| pending analysis"}</span>
      </span>
      <span class="mix-track-mini">${track.mute ? "M" : ""}${track.solo ? "S" : ""}</span>
    </button>
  `).join("");
}

function renderMixRuler(lengthSeconds) {
  if (!mixRuler) return;
  const markerCount = Math.max(5, Math.min(13, Math.ceil(lengthSeconds / 4) + 1));
  const markers = Array.from({ length: markerCount }, (_, index) => {
    const ratio = markerCount === 1 ? 0 : index / (markerCount - 1);
    const second = Math.round(lengthSeconds * ratio);
    return `<span class="mix-ruler-mark" style="left:${(ratio * 100).toFixed(2)}%"><em>${second}s</em></span>`;
  }).join("");
  mixRuler.innerHTML = `<div class="mix-ruler-line"></div>${markers}`;
}

function renderMixArranger() {
  if (!mixLaneList) return;
  if (!mixLabTracks.length) {
    mixLaneList.innerHTML = `
      <article class="empty-state compact">
        <h3>No timeline yet</h3>
        <p>When tracks are loaded, their regions will appear here with offsets, trims, and fades reflected visually.</p>
      </article>
    `;
    if (mixTimelineSummary) mixTimelineSummary.textContent = "No clips yet";
    renderMixRuler(16);
    return;
  }

  const lengthSeconds = estimateMixDeckLength();
  renderMixRuler(lengthSeconds);
  if (mixTimelineSummary) {
    const analyzedCount = mixLabTracks.filter((track) => track.analyzed).length;
    mixTimelineSummary.textContent = `${lengthSeconds}s visible | ${analyzedCount} analyzed clip${analyzedCount === 1 ? "" : "s"}`;
  }

  mixLaneList.innerHTML = mixLabTracks.map((track, index) => {
    const audible = trackAudibleDuration(track);
    const startRatio = Math.min(100, (Number(track.start_seconds || 0) / lengthSeconds) * 100);
    const widthRatio = Math.max(6, Math.min(100 - startRatio, (audible / lengthSeconds) * 100));
    const fadeInRatio = Math.min(26, ((Number(track.fade_in_seconds || 0) / Math.max(0.25, audible)) * 100));
    const fadeOutRatio = Math.min(26, ((Number(track.fade_out_seconds || 0) / Math.max(0.25, audible)) * 100));
    return `
      <article class="mix-lane ${track.id === selectedMixTrackId ? "is-active" : ""}" data-mix-select-id="${escapeHtml(track.id)}">
        <div class="mix-lane-meta">
          <strong>${escapeHtml(track.label || `Track ${index + 1}`)}</strong>
          <span>${escapeHtml(track.role || "other")} | ${track.mute ? "Muted" : track.solo ? "Soloed" : "Active"}</span>
        </div>
        <div class="mix-lane-canvas">
          <div
            class="mix-clip"
            data-accent="${escapeHtml(getMixRoleAccent(track.role))}"
            style="left:${startRatio.toFixed(2)}%; width:${widthRatio.toFixed(2)}%; --fade-in:${fadeInRatio.toFixed(2)}%; --fade-out:${fadeOutRatio.toFixed(2)}%;"
          >
            <span class="mix-clip-label">${escapeHtml(track.label || `Track ${index + 1}`)}</span>
            <span class="mix-clip-meta">${track.duration_seconds ? `${track.duration_seconds}s` : "analyze track"}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderMixInspector() {
  if (!mixInspectorPanel || !mixSelectedLabel) return;
  const track = getSelectedMixTrack();
  if (!track) {
    mixSelectedLabel.textContent = "No track selected";
    mixInspectorPanel.innerHTML = `
      <article class="empty-state compact">
        <h3>Select a track</h3>
        <p>Choose a lane on the left to edit its role, volume, pan, timing, trims, and fades here.</p>
      </article>
    `;
    return;
  }

  mixSelectedLabel.textContent = track.label || "Selected track";
  const gainText = `${track.gain_db > 0 ? "+" : ""}${Number(track.gain_db).toFixed(1)} dB`;
  const panText = Number(track.pan) === 0 ? "Center" : `${Math.abs(Number(track.pan)).toFixed(0)} ${Number(track.pan) < 0 ? "L" : "R"}`;
  mixInspectorPanel.innerHTML = `
    <div class="mix-inspector-grid">
      <label class="field field-wide">
        <span>Track label</span>
        <input type="text" value="${escapeHtml(track.label)}" data-mix-track-field="label" data-mix-track-id="${escapeHtml(track.id)}" />
      </label>
      <label class="field field-wide">
        <span>Audio path</span>
        <input type="text" value="${escapeHtml(track.path)}" data-mix-track-field="path" data-mix-track-id="${escapeHtml(track.id)}" placeholder="Path to a render, stem, or spoken cue" />
      </label>
      <div class="button-row field-wide">
        <button type="button" class="button-tertiary" data-mix-track-action="inspect" data-mix-track-id="${escapeHtml(track.id)}">Analyze Track</button>
        <button type="button" class="button-tertiary" data-mix-track-action="duplicate" data-mix-track-id="${escapeHtml(track.id)}">Duplicate</button>
        <button type="button" class="button-tertiary" data-mix-track-action="remove" data-mix-track-id="${escapeHtml(track.id)}">Remove</button>
      </div>
      <label class="field">
        <span>Role</span>
        <select data-mix-track-field="role" data-mix-track-id="${escapeHtml(track.id)}">
          ${["auto", "vocals", "harmony", "doubles", "spoken", "instrumental", "drums", "bass", "synth", "melody", "pad", "fx", "ambience", "piano", "guitar", "other"]
            .map((role) => `<option value="${role}" ${track.role === role ? "selected" : ""}>${role === "auto" ? "Auto detect" : role}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field slider-field">
        <span>Volume</span>
        <input type="range" min="-24" max="24" step="0.5" value="${escapeHtml(String(track.gain_db))}" data-mix-track-field="gain_db" data-mix-track-id="${escapeHtml(track.id)}" />
        <strong>${escapeHtml(gainText)}</strong>
      </label>
      <label class="field slider-field">
        <span>Pan</span>
        <input type="range" min="-100" max="100" step="1" value="${escapeHtml(String(track.pan))}" data-mix-track-field="pan" data-mix-track-id="${escapeHtml(track.id)}" />
        <strong>${escapeHtml(panText)}</strong>
      </label>
      <label class="field">
        <span>Start</span>
        <input type="number" min="0" max="1200" step="0.01" value="${escapeHtml(String(track.start_seconds))}" data-mix-track-field="start_seconds" data-mix-track-id="${escapeHtml(track.id)}" />
      </label>
      <label class="field">
        <span>Trim in</span>
        <input type="number" min="0" max="1200" step="0.01" value="${escapeHtml(String(track.trim_in_seconds))}" data-mix-track-field="trim_in_seconds" data-mix-track-id="${escapeHtml(track.id)}" />
      </label>
      <label class="field">
        <span>Trim out</span>
        <input type="number" min="0" max="1200" step="0.01" value="${escapeHtml(String(track.trim_out_seconds))}" data-mix-track-field="trim_out_seconds" data-mix-track-id="${escapeHtml(track.id)}" />
      </label>
      <label class="field">
        <span>Fade in</span>
        <input type="number" min="0" max="30" step="0.01" value="${escapeHtml(String(track.fade_in_seconds))}" data-mix-track-field="fade_in_seconds" data-mix-track-id="${escapeHtml(track.id)}" />
      </label>
      <label class="field">
        <span>Fade out</span>
        <input type="number" min="0" max="30" step="0.01" value="${escapeHtml(String(track.fade_out_seconds))}" data-mix-track-field="fade_out_seconds" data-mix-track-id="${escapeHtml(track.id)}" />
      </label>
      <div class="mix-toggle-row field-wide">
        <label class="toggle mix-mini-toggle">
          <input type="checkbox" ${track.mute ? "checked" : ""} data-mix-track-field="mute" data-mix-track-id="${escapeHtml(track.id)}" />
          <span>Mute track</span>
        </label>
        <label class="toggle mix-mini-toggle">
          <input type="checkbox" ${track.solo ? "checked" : ""} data-mix-track-field="solo" data-mix-track-id="${escapeHtml(track.id)}" />
          <span>Solo track</span>
        </label>
      </div>
      <div class="mix-track-facts field-wide">
        <strong>${track.analyzed ? "Track analyzed" : "Track waiting for analysis"}</strong>
        <p>${track.duration_seconds ? `${track.duration_seconds}s` : "Unknown length"} | ${track.sample_rate ? `${track.sample_rate} Hz` : "Sample rate pending"} | ${track.channels ? `${track.channels} ch` : "Channels pending"} | peak ${Number(track.peak || 0).toFixed(3)}</p>
      </div>
    </div>
  `;
}

function renderMixDeck() {
  summarizeMixLab();
  renderMixTrackList();
  renderMixArranger();
  renderMixInspector();
  if (mixTrackCount) {
    mixTrackCount.textContent = `${mixLabTracks.length} track${mixLabTracks.length === 1 ? "" : "s"}`;
  }
  if (!getSelectedMixTrack() && mixLabTracks.length) {
    selectedMixTrackId = mixLabTracks[0].id;
    renderMixInspector();
  }
  storeMixSession();
}

function addMixTrack(overrides = {}) {
  const track = createMixTrack(overrides);
  mixLabTracks.push(track);
  selectedMixTrackId = track.id;
  renderMixDeck();
  return track;
}

async function inspectMixTrack(trackId) {
  const track = mixLabTracks.find((item) => item.id === trackId);
  if (!track || !track.path.trim()) {
    throw new Error("Give the track a real audio path before analyzing it.");
  }
  const data = await fetchJson("/api/mix/inspect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audio_path: track.path.trim(),
      label: track.label.trim(),
      role: track.role || "auto",
    }),
  });
  track.label = track.label || data.label || "";
  track.role = track.role === "auto" || !track.role ? data.role || track.role : track.role;
  track.duration_seconds = Number(data.duration_seconds || track.duration_seconds || 0);
  track.sample_rate = Number(data.sample_rate || track.sample_rate || 0);
  track.channels = Number(data.channels || track.channels || 0);
  track.peak = Number(data.peak || track.peak || 0);
  track.analyzed = true;
  renderMixDeck();
  return data;
}

async function addTrackToMixLab({ path = "", label = "", role = "auto" } = {}) {
  if (!path) return null;
  const track = addMixTrack({ path, label, role });
  try {
    await inspectMixTrack(track.id);
    setMixDeckStatus(`Imported ${track.label || "track"} into Mix Deck.`);
  } catch (error) {
    setMixDeckStatus(error.message || "Track imported, but analysis failed.");
  }
  setToolStatus("Loaded that audio into Mix Deck.");
  openMixDeckWorkspace("mixDeck");
  return track;
}

function addMixTemplate(role = "other") {
  const labels = {
    drums: "Drum Kit",
    bass: "Bass Line",
    piano: "Keys",
    synth: "Lead Synth",
    pad: "Atmos Pad",
    fx: "FX Layer",
    vocals: "Lead Vocal",
    spoken: "Spoken Cue",
    other: "New Track",
  };
  addMixTrack({
    label: labels[role] || "New Track",
    role,
    path: "",
  });
  setMixDeckStatus(`Added a ${labels[role] || "new"} lane. Import audio when you are ready.`);
}

function defaultArrangementSections() {
  return [
    { id: "intro", label: "Intro", enabled: true, energy: "floating", notes: "" },
    { id: "verse1", label: "Verse 1", enabled: true, energy: "intimate", notes: "" },
    { id: "prechorus", label: "Pre-Chorus", enabled: true, energy: "rising", notes: "" },
    { id: "chorus", label: "Chorus", enabled: true, energy: "huge", notes: "" },
    { id: "verse2", label: "Verse 2", enabled: true, energy: "driving", notes: "" },
    { id: "bridge", label: "Bridge", enabled: true, energy: "suspended", notes: "" },
    { id: "finalchorus", label: "Final Chorus", enabled: true, energy: "maximal", notes: "" },
    { id: "outro", label: "Outro", enabled: true, energy: "afterglow", notes: "" },
  ];
}

function normalizeArrangementSections(input = []) {
  const incoming = Array.isArray(input) ? input : [];
  return defaultArrangementSections().map((section) => {
    const match = incoming.find((item) => item?.id === section.id || item?.label === section.label);
    return {
      ...section,
      enabled: match?.enabled !== undefined ? Boolean(match.enabled) : section.enabled,
      energy: match?.energy || section.energy,
      notes: match?.notes || "",
    };
  });
}

function createArrangementPart(overrides = {}) {
  arrangementPartSeed += 1;
  const sections = Array.isArray(overrides.sections) && overrides.sections.length
    ? overrides.sections.map((section) => `${section}`)
    : ["verse1", "chorus"];
  return {
    id: overrides.id || `arr-part-${arrangementPartSeed}`,
    label: overrides.label || "New Part",
    role: overrides.role || "other",
    texture: overrides.texture || "",
    movement: overrides.movement || "",
    notes: overrides.notes || "",
    sections,
  };
}

function getArrangementSectionLabel(sectionId) {
  return arrangementSections.find((section) => section.id === sectionId)?.label || sectionId;
}

function getSelectedArrangementPart() {
  return arrangementParts.find((part) => part.id === selectedArrangementPartId) || null;
}

function setArrangementFieldValue(fieldId, nextValue) {
  const field = byId(fieldId);
  if (!field) return;
  const normalized = `${nextValue || ""}`.trim();
  const previousAuto = field.dataset.autoArrangementValue || "";
  const current = field.value.trim();
  if (!current || current === previousAuto) {
    field.value = normalized;
    field.dataset.autoArrangementValue = normalized;
  }
}

function summarizeArrangementSectionPlan() {
  return arrangementSections
    .filter((section) => section.enabled)
    .map((section) => `${section.label}: ${section.energy}${section.notes ? ` (${section.notes})` : ""}`)
    .join(" | ");
}

function summarizeArrangementParts() {
  return arrangementParts
    .map((part) => {
      const sectionLabels = part.sections.map(getArrangementSectionLabel).join(", ");
      const detail = [part.texture, part.movement, part.notes].filter(Boolean).join("; ");
      return `${part.label}${detail ? ` - ${detail}` : ""}${sectionLabels ? ` [${sectionLabels}]` : ""}`;
    })
    .join(" | ");
}

function syncArrangementBlueprintFields() {
  const enabledSections = arrangementSections.filter((section) => section.enabled);
  const activeParts = arrangementParts.filter((part) => part.sections.some((sectionId) => enabledSections.some((section) => section.id === sectionId)));
  const instrumentsSummary = activeParts.map((part) => part.label).filter(Boolean).join(", ");
  const orchestrationSummary = summarizeArrangementParts();
  const sectionSummary = summarizeArrangementSectionPlan();
  const dynamicArcSummary = enabledSections.length
    ? `${enabledSections[0].label} starts ${enabledSections[0].energy}, ${enabledSections[Math.max(0, Math.floor(enabledSections.length / 2))].label} pushes ${enabledSections[Math.max(0, Math.floor(enabledSections.length / 2))].energy}, ${enabledSections[enabledSections.length - 1].label} lands ${enabledSections[enabledSections.length - 1].energy}.`
    : "";
  setArrangementFieldValue("instruments", instrumentsSummary);
  setArrangementFieldValue("section_energy_map", sectionSummary);
  setArrangementFieldValue("orchestration_plan", orchestrationSummary);
  setArrangementFieldValue("dynamic_arc", dynamicArcSummary);
}

function renderArrangementPartList() {
  if (!arrangementPartList) return;
  if (!arrangementParts.length) {
    arrangementPartList.innerHTML = `
      <article class="empty-state compact">
        <h3>No arrangement parts yet</h3>
        <p>Add drums, synths, vocals, or FX lanes to map what the song should actually be built from.</p>
      </article>
    `;
    return;
  }

  arrangementPartList.innerHTML = arrangementParts.map((part) => {
    const sectionLabels = part.sections.map(getArrangementSectionLabel).join(", ");
    return `
      <button
        type="button"
        class="arrangement-part-row ${part.id === selectedArrangementPartId ? "is-active" : ""}"
        data-arrangement-select-id="${escapeHtml(part.id)}"
      >
        <span class="mix-track-swatch" data-accent="${escapeHtml(getMixRoleAccent(part.role))}"></span>
        <span class="mix-track-main">
          <strong>${escapeHtml(part.label)}</strong>
          <span>${escapeHtml(part.role)} | ${escapeHtml(sectionLabels || "No sections yet")}</span>
        </span>
      </button>
    `;
  }).join("");
}

function renderArrangementSections() {
  if (!arrangementSectionGrid || !arrangementSectionSummary) return;
  arrangementSectionSummary.textContent = arrangementSections.filter((section) => section.enabled).length
    ? `${arrangementSections.filter((section) => section.enabled).length} active section(s)`
    : "No section plan yet";
  arrangementSectionGrid.innerHTML = arrangementSections.map((section) => `
    <article class="arrangement-section-card ${section.enabled ? "is-enabled" : ""}">
      <label class="toggle">
        <input type="checkbox" ${section.enabled ? "checked" : ""} data-arrangement-section-field="enabled" data-arrangement-section-id="${escapeHtml(section.id)}" />
        <span>${escapeHtml(section.label)}</span>
      </label>
      <label class="field">
        <span>Energy</span>
        <select data-arrangement-section-field="energy" data-arrangement-section-id="${escapeHtml(section.id)}">
          ${["floating", "intimate", "rising", "driving", "huge", "maximal", "suspended", "afterglow"]
            .map((energy) => `<option value="${energy}" ${section.energy === energy ? "selected" : ""}>${energy}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field">
        <span>Notes</span>
        <input type="text" value="${escapeHtml(section.notes || "")}" placeholder="drop, bloom, silence, swell" data-arrangement-section-field="notes" data-arrangement-section-id="${escapeHtml(section.id)}" />
      </label>
    </article>
  `).join("");
}

function renderArrangementInspector() {
  if (!arrangementInspectorPanel || !arrangementSelectedLabel) return;
  const part = getSelectedArrangementPart();
  if (!part) {
    arrangementSelectedLabel.textContent = "No part selected";
    arrangementInspectorPanel.innerHTML = `
      <article class="empty-state compact">
        <h3>Select a part lane</h3>
        <p>Choose a lane to decide where it enters, what it does, and how it should feel.</p>
      </article>
    `;
    return;
  }

  arrangementSelectedLabel.textContent = part.label || "Selected part";
  arrangementInspectorPanel.innerHTML = `
    <div class="arrangement-inspector-grid">
      <label class="field field-wide">
        <span>Part name</span>
        <input type="text" value="${escapeHtml(part.label)}" data-arrangement-part-field="label" data-arrangement-part-id="${escapeHtml(part.id)}" />
      </label>
      <label class="field">
        <span>Role</span>
        <select data-arrangement-part-field="role" data-arrangement-part-id="${escapeHtml(part.id)}">
          ${["drums", "bass", "piano", "synth", "pad", "guitar", "strings", "fx", "vocals", "spoken", "other"]
            .map((role) => `<option value="${role}" ${part.role === role ? "selected" : ""}>${role}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field">
        <span>Texture</span>
        <input type="text" value="${escapeHtml(part.texture)}" placeholder="glassy, punchy, warm, distorted" data-arrangement-part-field="texture" data-arrangement-part-id="${escapeHtml(part.id)}" />
      </label>
      <label class="field field-wide">
        <span>Movement</span>
        <input type="text" value="${escapeHtml(part.movement)}" placeholder="enters at pre-chorus, doubles the hook, blooms in the final lift" data-arrangement-part-field="movement" data-arrangement-part-id="${escapeHtml(part.id)}" />
      </label>
      <label class="field field-wide">
        <span>Production notes</span>
        <textarea rows="3" placeholder="Sidechain the pad under the vocal, keep bass dry in verses, let strings rise in the bridge." data-arrangement-part-field="notes" data-arrangement-part-id="${escapeHtml(part.id)}">${escapeHtml(part.notes)}</textarea>
      </label>
      <div class="field field-wide">
        <span>Section assignment</span>
        <div class="arrangement-chip-row">
          ${arrangementSections.map((section) => `
            <button
              type="button"
              class="arrangement-chip ${part.sections.includes(section.id) ? "is-active" : ""}"
              data-arrangement-part-section="${escapeHtml(section.id)}"
              data-arrangement-part-id="${escapeHtml(part.id)}"
            >
              ${escapeHtml(section.label)}
            </button>
          `).join("")}
        </div>
      </div>
      <div class="button-row field-wide">
        <button type="button" class="button-tertiary" data-arrangement-part-action="duplicate" data-arrangement-part-id="${escapeHtml(part.id)}">Duplicate Part</button>
        <button type="button" class="button-tertiary" data-arrangement-part-action="remove" data-arrangement-part-id="${escapeHtml(part.id)}">Remove Part</button>
      </div>
    </div>
  `;
}

function renderArrangementDeck() {
  if (!Array.isArray(arrangementSections) || !arrangementSections.length) {
    arrangementSections = normalizeArrangementSections();
  }
  if (!getSelectedArrangementPart() && arrangementParts.length) {
    selectedArrangementPartId = arrangementParts[0].id;
  }
  renderArrangementPartList();
  renderArrangementSections();
  renderArrangementInspector();
  syncArrangementBlueprintFields();
}

function addArrangementTemplate(role = "other") {
  const presets = {
    drums: { label: "Drum Kit", texture: "hybrid punch and air", movement: "save the full lift for the chorus", sections: ["prechorus", "chorus", "verse2", "finalchorus"] },
    bass: { label: "Bass Line", texture: "warm low-end pulse", movement: "anchor the verses and push the chorus", sections: ["verse1", "prechorus", "chorus", "verse2", "bridge", "finalchorus"] },
    piano: { label: "Keys", texture: "soft bell piano", movement: "carry the intro and verses", sections: ["intro", "verse1", "verse2", "bridge", "outro"] },
    synth: { label: "Lead Synth", texture: "neon melodic hook", movement: "answer the vocal in pre and chorus", sections: ["prechorus", "chorus", "finalchorus"] },
    pad: { label: "Atmos Pad", texture: "wide cosmic bed", movement: "glue the whole song together", sections: ["intro", "verse1", "prechorus", "bridge", "outro"] },
    guitar: { label: "Guitar", texture: "shimmering octave layer", movement: "wake up the second half", sections: ["chorus", "verse2", "finalchorus"] },
    strings: { label: "Strings", texture: "cinematic swell", movement: "rise into the hook and bridge", sections: ["prechorus", "chorus", "bridge", "finalchorus"] },
    fx: { label: "FX Layer", texture: "signal noise and reverses", movement: "help the transitions breathe", sections: ["intro", "prechorus", "bridge", "outro"] },
    vocals: { label: "Lead Vocal", texture: "front-and-center lead", movement: "carry every main section", sections: ["verse1", "prechorus", "chorus", "verse2", "bridge", "finalchorus", "outro"] },
    spoken: { label: "Spoken Cue", texture: "close-mic narrator", movement: "bookend or interrupt the song", sections: ["intro", "bridge", "outro"] },
    other: { label: "New Part", texture: "", movement: "", sections: ["verse1", "chorus"] },
  };
  const preset = presets[role] || presets.other;
  const part = createArrangementPart({ role, ...preset });
  arrangementParts.push(part);
  selectedArrangementPartId = part.id;
  renderArrangementDeck();
}

function applyArrangementStudioState(state = {}) {
  arrangementParts = Array.isArray(state.arrangement_parts)
    ? state.arrangement_parts.map((part) => createArrangementPart(part))
    : [];
  arrangementSections = normalizeArrangementSections(state.arrangement_sections);
  selectedArrangementPartId = state.selected_arrangement_part_id || arrangementParts[0]?.id || "";
}

function collectStudioState() {
  return {
    forge_pane: forgePane,
    arrangement_parts: arrangementParts.map((part) => ({
      id: part.id,
      label: part.label,
      role: part.role,
      texture: part.texture,
      movement: part.movement,
      notes: part.notes,
      sections: Array.isArray(part.sections) ? [...part.sections] : [],
    })),
    arrangement_sections: arrangementSections.map((section) => ({
      id: section.id,
      label: section.label,
      enabled: Boolean(section.enabled),
      energy: section.energy,
      notes: section.notes,
    })),
    selected_arrangement_part_id: selectedArrangementPartId,
    instrument_zoom: instrumentZoom,
    instrument_input_step_length: instrumentInputStepLength,
    instrument_edit_cursor_step: instrumentEditCursorStep,
    instrument_loop_enabled: instrumentLoopEnabled,
    instrument_loop_start: instrumentLoopStart,
    instrument_loop_length: instrumentLoopLength,
    instrument_quantize_resolution: instrumentQuantizeResolution,
    instrument_tracks: instrumentTracks.map((track) => ({
      id: track.id,
      template_id: track.template_id,
      label: track.label,
      role: track.role,
      synth_type: track.synth_type,
      volume: track.volume,
      mute: Boolean(track.mute),
      steps: getInstrumentStepCount(track),
      base_midi: track.base_midi,
      notes: Array.isArray(track.notes) ? track.notes.map((note) => ({ row: note.row, start: note.start, length: note.length, velocity: note.velocity })) : [],
    })),
    selected_instrument_track_id: selectedInstrumentTrackId,
  };
}

function isDrumInstrumentRole(role = "") {
  return ["drums", "perc"].includes(`${role || ""}`.toLowerCase());
}

function normalizeInstrumentStepCount(value) {
  const numeric = Number(value || 16);
  if (numeric >= 64) return 64;
  if (numeric >= 32) return 32;
  return 16;
}

function getInstrumentStepCount(track = {}) {
  return normalizeInstrumentStepCount(track.steps || 16);
}

function normalizeInstrumentInputStepLength(value) {
  return [0.25, 0.5, 1, 2, 4, 8].includes(Number(value || 2)) ? Number(value || 2) : 2;
}

function normalizeInstrumentStepValue(value, fallback = 0) {
  const numeric = Number(value);
  const safeValue = Number.isFinite(numeric) ? numeric : fallback;
  const factor = 10 ** INSTRUMENT_STEP_PRECISION;
  return Math.round(safeValue * factor) / factor;
}

function clampInstrumentNoteStart(value, totalSteps) {
  return normalizeInstrumentStepValue(Math.max(0, Math.min(totalSteps - INSTRUMENT_MIN_NOTE_LENGTH, Number(value || 0))));
}

function clampInstrumentNoteLength(value, start, totalSteps) {
  return normalizeInstrumentStepValue(
    Math.max(
      INSTRUMENT_MIN_NOTE_LENGTH,
      Math.min(totalSteps - start, Number(value || INSTRUMENT_MIN_NOTE_LENGTH)),
    ),
    INSTRUMENT_MIN_NOTE_LENGTH,
  );
}

function formatInstrumentStepValue(value) {
  const normalized = normalizeInstrumentStepValue(value, 0);
  return Number.isInteger(normalized)
    ? String(normalized)
    : normalized.toFixed(INSTRUMENT_STEP_PRECISION).replace(/0+$/, "").replace(/\.$/, "");
}

function describeInstrumentLoopRange(track = getSelectedInstrumentTrack()) {
  if (!(track && instrumentLoopEnabled)) return "Looping full pattern";
  const trackSteps = getInstrumentStepCount(track);
  const start = clampInstrumentNoteStart(instrumentLoopStart, trackSteps);
  const maxLength = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, trackSteps - start);
  const length = clampInstrumentNoteLength(instrumentLoopLength, start, trackSteps);
  return `Loop ${formatInstrumentStepValue(start + 1)} to ${formatInstrumentStepValue(start + length)}`;
}

function getInstrumentLoopRegion(track = getSelectedInstrumentTrack()) {
  if (!track) return null;
  if (!instrumentLoopEnabled) {
    return {
      enabled: false,
      start: 0,
      length: getInstrumentStepCount(track),
      end: getInstrumentStepCount(track),
    };
  }
  const trackSteps = getInstrumentStepCount(track);
  const start = clampInstrumentNoteStart(instrumentLoopStart, trackSteps);
  const length = clampInstrumentNoteLength(instrumentLoopLength, start, trackSteps);
  return {
    enabled: true,
    start,
    length,
    end: normalizeInstrumentStepValue(start + length, start + length),
  };
}

function snapValueToQuantizeGrid(value, resolution = instrumentQuantizeResolution) {
  const grid = normalizeInstrumentQuantizeResolution(resolution);
  return normalizeInstrumentStepValue(Math.round(Number(value || 0) / grid) * grid, 0);
}

function getInstrumentTempoBpm() {
  return Math.max(40, Number(byId("tempo_bpm")?.value || 112));
}

function getInstrumentStepDurationSeconds() {
  return 60 / getInstrumentTempoBpm() / 4;
}

function resolveInstrumentCssLength(value, styles = null) {
  const source = `${value || ""}`.trim();
  if (!source) return 0;
  if (source.endsWith("rem")) {
    const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
    return (parseFloat(source) || 0) * rootFontSize;
  }
  if (source.endsWith("px")) {
    return parseFloat(source) || 0;
  }
  if (source.endsWith("em")) {
    const baseFontSize = parseFloat(styles?.fontSize || window.getComputedStyle(document.documentElement).fontSize) || 16;
    return (parseFloat(source) || 0) * baseFontSize;
  }
  const numeric = parseFloat(source);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getInstrumentStepPixelMetrics() {
  const referenceNode = instrumentGrid || document.body;
  const styles = window.getComputedStyle(referenceNode);
  const stepWidth = resolveInstrumentCssLength(styles.getPropertyValue("--instrument-step-width"), styles) || 39.2;
  const gap = resolveInstrumentCssLength(styles.getPropertyValue("--instrument-step-gap"), styles) || 6;
  return {
    stepWidth,
    gap,
    stepSpan: stepWidth + gap,
  };
}

function getInstrumentPixelPosition(stepValue, metrics = getInstrumentStepPixelMetrics()) {
  const normalized = Math.max(0, normalizeInstrumentStepValue(stepValue, 0));
  const wholeSteps = Math.floor(normalized);
  const fractionalStep = normalized - wholeSteps;
  return (wholeSteps * metrics.stepSpan) + (fractionalStep * metrics.stepWidth);
}

function getInstrumentNotePixelBounds(note, metrics = getInstrumentStepPixelMetrics()) {
  const left = getInstrumentPixelPosition(note.start, metrics);
  const right = getInstrumentPixelPosition(note.start + note.length, metrics);
  return {
    left,
    width: Math.max(metrics.stepWidth * INSTRUMENT_MIN_NOTE_LENGTH, right - left),
  };
}

function getCurrentTransportAbsoluteStep() {
  if (!instrumentTransport.playing || !instrumentTransport.context || !(instrumentTransport.stepDurationSec > 0)) {
    return Number(instrumentTransport.transportTick >= 0 ? instrumentTransport.transportTick : instrumentEditCursorStep || 0);
  }
  const elapsed = Math.max(0, instrumentTransport.context.currentTime - Number(instrumentTransport.startContextTime || 0));
  const rawAbsolute = Number(instrumentTransport.startAbsoluteStep || 0) + (elapsed / instrumentTransport.stepDurationSec);
  const loopStart = Number(instrumentTransport.loopStart || 0);
  const loopLength = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, Number(instrumentTransport.loopLength || 0));
  if (!(loopLength > 0)) {
    return normalizeInstrumentStepValue(rawAbsolute, Number(instrumentTransport.startAbsoluteStep || 0));
  }
  const loopPosition = ((rawAbsolute - loopStart) % loopLength + loopLength) % loopLength;
  return normalizeInstrumentStepValue(loopStart + loopPosition, loopStart);
}

function snapInstrumentGridPosition(value, { maxStart = null } = {}) {
  const snapped = normalizeInstrumentStepValue(
    Math.round(Number(value || 0) / INSTRUMENT_MIN_NOTE_LENGTH) * INSTRUMENT_MIN_NOTE_LENGTH,
    0,
  );
  const maxValue = Number.isFinite(Number(maxStart)) ? Number(maxStart) : Number.POSITIVE_INFINITY;
  return normalizeInstrumentStepValue(Math.max(0, Math.min(maxValue, snapped)), 0);
}

function snapInstrumentGridDelta(value) {
  return normalizeInstrumentStepValue(
    Math.round(Number(value || 0) / INSTRUMENT_MIN_NOTE_LENGTH) * INSTRUMENT_MIN_NOTE_LENGTH,
    0,
  );
}

function getCurrentTransportTrackStep(track) {
  const totalSteps = getInstrumentStepCount(track);
  if (!totalSteps) return 0;
  const absoluteStep = getCurrentTransportAbsoluteStep();
  return normalizeInstrumentStepValue(((absoluteStep % totalSteps) + totalSteps) % totalSteps, 0);
}

function getInstrumentCursorStep(track = getSelectedInstrumentTrack()) {
  const stepCount = track ? getInstrumentStepCount(track) : 16;
  return Math.max(0, Math.min(stepCount - 1, Math.floor(Number(instrumentEditCursorStep || 0))));
}

function getInstrumentInputMode() {
  if (instrumentRecordMode) return "record";
  if (instrumentKeyboardMode) return "keys";
  if (instrumentSelectMode) return "select";
  return "draw";
}

function setInstrumentInputMode(mode = "draw", { render = true } = {}) {
  const normalizedMode = ["draw", "select", "keys", "record"].includes(mode) ? mode : "draw";
  if (normalizedMode === "draw") {
    instrumentSelectMode = false;
    instrumentKeyboardMode = false;
    instrumentRecordMode = false;
    stopAllHeldInstrumentInputs();
  } else if (normalizedMode === "select") {
    instrumentSelectMode = true;
    instrumentKeyboardMode = false;
    instrumentRecordMode = false;
    stopAllHeldInstrumentInputs();
  } else if (normalizedMode === "keys") {
    instrumentSelectMode = false;
    instrumentKeyboardMode = true;
    instrumentRecordMode = false;
  } else {
    instrumentSelectMode = false;
    instrumentKeyboardMode = true;
    instrumentRecordMode = true;
  }
  if (render) {
    renderInstrumentDeck();
  }
}

function getInstrumentModeCopy() {
  const mode = getInstrumentInputMode();
  if (mode === "record") {
    return {
      summary: "Mode: Record Keys",
      hint: "Press Space to start the loop, then play A..J to capture real note timing.",
    };
  }
  if (mode === "keys") {
    return {
      summary: "Mode: Audition Keys",
      hint: "Play A..J to hear the selected track without writing notes into the grid.",
    };
  }
  if (mode === "select") {
    return {
      summary: "Mode: Select Notes",
      hint: "Drag anywhere across the roll or header to gather notes, then loop, quantize, or humanize them.",
    };
  }
  return {
    summary: "Mode: Draw Notes",
    hint: "Drag on the grid to sketch notes, or press V for Select Notes when you want to reshape a phrase.",
  };
}

function inputModeInstructionForEmptyTrack(track) {
  if (!track) {
    return "Choose a track on the left or add a starter lane from the rack above.";
  }
  const mode = getInstrumentInputMode();
  if (mode === "record") {
    return `Press Space to start the loop, then play A..J to record the first phrase into ${track.label}.`;
  }
  if (mode === "keys") {
    return `Play A..J to audition ${track.label}, then switch to Record Keys or draw the phrase by hand.`;
  }
  if (mode === "select") {
    return `Select Notes is ready, but ${track.label} needs notes first. Draw or record a phrase, then come back to lasso and reshape it.`;
  }
  return `Drag across the grid to draw the first notes into ${track.label}, or switch to Record Keys if you want to play them in.`;
}

function setInstrumentEditCursor(step, { render = true } = {}) {
  const track = getSelectedInstrumentTrack();
  const stepCount = track ? getInstrumentStepCount(track) : 16;
  instrumentEditCursorStep = ((Number(step || 0) % stepCount) + stepCount) % stepCount;
  if (render) {
    renderInstrumentDeck();
  }
}

function moveInstrumentEditCursor(delta, { render = true } = {}) {
  const track = getSelectedInstrumentTrack();
  const stepCount = track ? getInstrumentStepCount(track) : 16;
  const nextStep = getInstrumentCursorStep(track) + Number(delta || 0);
  instrumentEditCursorStep = ((nextStep % stepCount) + stepCount) % stepCount;
  if (render) {
    renderInstrumentDeck();
  }
}

function syncInstrumentInputControls() {
  if (instrumentInputLengthField) {
    instrumentInputLengthField.value = String(instrumentInputStepLength);
  }
  if (instrumentQuantizeResolutionField) {
    instrumentQuantizeResolutionField.value = String(instrumentQuantizeResolution);
  }
  const inputMode = getInstrumentInputMode();
  if (instrumentDrawModeButton) {
    instrumentDrawModeButton.classList.toggle("is-active", inputMode === "draw");
    instrumentDrawModeButton.setAttribute("aria-pressed", inputMode === "draw" ? "true" : "false");
  }
  if (instrumentSelectModeButton) {
    instrumentSelectModeButton.classList.toggle("is-active", inputMode === "select");
    instrumentSelectModeButton.setAttribute("aria-pressed", inputMode === "select" ? "true" : "false");
  }
  if (instrumentKeyboardButton) {
    instrumentKeyboardButton.textContent = "Audition Keys";
    instrumentKeyboardButton.classList.toggle("is-active", inputMode === "keys");
    instrumentKeyboardButton.setAttribute("aria-pressed", inputMode === "keys" ? "true" : "false");
  }
  if (instrumentRecordButton) {
    instrumentRecordButton.textContent = "Record Keys";
    instrumentRecordButton.classList.toggle("is-active", inputMode === "record");
    instrumentRecordButton.setAttribute("aria-pressed", inputMode === "record" ? "true" : "false");
  }
  const selectedTrack = getSelectedInstrumentTrack();
  if (instrumentCursorLabel) {
    instrumentCursorLabel.textContent = `Cursor ${getInstrumentCursorStep(selectedTrack) + 1}`;
  }
  if (instrumentKeyboardHint) {
    const keyboardMap = selectedTrack && isDrumInstrumentRole(selectedTrack.role)
      ? INSTRUMENT_DRUM_KEYBOARD.join(" ")
      : INSTRUMENT_MELODIC_KEYBOARD.join(" ");
    instrumentKeyboardHint.textContent = `Keys: ${keyboardMap.toUpperCase()} | D draw | V select | Space previews | Q quantize | H humanize`;
  }
  if (instrumentRollViewport) {
    instrumentRollViewport.dataset.instrumentMode = inputMode;
  }
  if (instrumentGridHeader) {
    instrumentGridHeader.dataset.instrumentMode = inputMode;
  }
  if (instrumentGrid) {
    instrumentGrid.dataset.instrumentMode = inputMode;
  }
  if (instrumentLoopSummary) {
    instrumentLoopSummary.textContent = describeInstrumentLoopRange(selectedTrack);
  }
}

async function ensureInstrumentAudioContext() {
  const context = getAudioContext();
  if (context.state === "suspended") {
    await context.resume();
  }
  return context;
}

function midiToNoteLabel(midi) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const note = noteNames[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function getInstrumentRows(track = {}) {
  if (isDrumInstrumentRole(track.role)) {
    return [
      { id: "kick", label: "Kick", voice: "kick" },
      { id: "snare", label: "Snare", voice: "snare" },
      { id: "clap", label: "Clap", voice: "clap" },
      { id: "rim", label: "Rim", voice: "rim" },
      { id: "hat-closed", label: "Hat", voice: "hat-closed" },
      { id: "hat-open", label: "Open Hat", voice: "hat-open" },
      { id: "shaker", label: "Shaker", voice: "shaker" },
      { id: "tom", label: "Tom", voice: "tom" },
      { id: "perc", label: "Perc", voice: "perc" },
      { id: "crash", label: "Crash", voice: "crash" },
    ];
  }

  const rowCount = ["bass", "sub"].includes(`${track.role || ""}`) ? 16 : 24;
  const baseMidi = Number(track.base_midi || 60);
  return Array.from({ length: rowCount }, (_, index) => {
    const midi = baseMidi + (rowCount - 1 - index);
    return {
      id: `midi-${midi}`,
      label: midiToNoteLabel(midi),
      midi,
    };
  });
}

function normalizeInstrumentNotes(notes = [], legacyCells = []) {
  const source = Array.isArray(notes) && notes.length ? notes : Array.isArray(legacyCells) ? legacyCells : [];
  return source
    .map((note) => ({
      row: `${note.row || ""}`,
      start: normalizeInstrumentStepValue(note.start ?? note.step ?? 0, 0),
      length: normalizeInstrumentStepValue(Math.max(INSTRUMENT_MIN_NOTE_LENGTH, Number(note.length || 1)), 1),
      velocity: Math.max(1, Math.min(127, Number(note.velocity || 96))),
    }))
    .filter((note) => note.row && Number.isFinite(note.start) && Number.isFinite(note.length) && Number.isFinite(note.velocity));
}

function normalizeInstrumentCells(cells = []) {
  if (!Array.isArray(cells)) return [];
  return cells
    .map((cell) => ({
      step: Number(cell.step || 0),
      row: `${cell.row || ""}`,
    }))
    .filter((cell) => Number.isFinite(cell.step) && cell.row);
}

function createInstrumentTrack(overrides = {}) {
  instrumentTrackSeed += 1;
  const templateId = overrides.template_id || overrides.template || overrides.role || "keys";
  const preset = getInstrumentTemplatePreset(templateId);
  return {
    id: overrides.id || `inst-track-${instrumentTrackSeed}`,
    template_id: overrides.template_id || preset.template,
    label: overrides.label || preset.label,
    role: overrides.role || preset.role,
    synth_type: overrides.synth_type || preset.synth_type,
    volume: Number(overrides.volume ?? preset.volume),
    mute: Boolean(overrides.mute),
    steps: normalizeInstrumentStepCount(overrides.steps ?? preset.steps),
    base_midi: Number(overrides.base_midi ?? preset.base_midi),
    notes: normalizeInstrumentNotes(overrides.notes || [], overrides.cells || []),
  };
}

function renderInstrumentTemplatePalette() {
  if (instrumentTemplateButtons) {
    const featuredTemplates = ["drums", "bass", "piano", "lead", "pad", "strings", "brass", "fx"];
    instrumentTemplateButtons.innerHTML = featuredTemplates
      .map((templateId) => {
        const template = getInstrumentTemplatePreset(templateId);
        return `<button type="button" class="button-ghost" data-instrument-template="${escapeHtml(template.template)}">${escapeHtml(template.label)}</button>`;
      })
      .join("");
  }
  if (!instrumentPaletteCatalog) return;
  const categories = [...new Set(INSTRUMENT_TEMPLATE_LIBRARY.map((item) => item.category))];
  instrumentPaletteCatalog.innerHTML = categories.map((category) => {
    const templates = INSTRUMENT_TEMPLATE_LIBRARY.filter((item) => item.category === category);
    return `
      <section class="instrument-palette-group">
        <header class="instrument-palette-head">
          <p class="section-tag">${escapeHtml(category)}</p>
          <span class="mix-meta-pill">${templates.length} choices</span>
        </header>
        <div class="instrument-palette-grid">
          ${templates.map((template) => `
            <button type="button" class="instrument-palette-card" data-instrument-template="${escapeHtml(template.template)}">
              <strong>${escapeHtml(template.label)}</strong>
              <span>${escapeHtml(formatInstrumentSoundLabel(template.synth_type))}</span>
              <p>${escapeHtml(template.description || "")}</p>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function cloneInstrumentTrackState(track = {}) {
  return {
    id: track.id,
    template_id: track.template_id,
    label: track.label,
    role: track.role,
    synth_type: track.synth_type,
    volume: track.volume,
    mute: Boolean(track.mute),
    steps: getInstrumentStepCount(track),
    base_midi: track.base_midi,
    notes: Array.isArray(track.notes)
      ? track.notes.map((note) => ({
        row: note.row,
        start: note.start,
        length: note.length,
        velocity: note.velocity,
      }))
      : [],
  };
}

function getInstrumentHistoryState() {
  return {
    instrument_loop_enabled: instrumentLoopEnabled,
    instrument_loop_start: instrumentLoopStart,
    instrument_loop_length: instrumentLoopLength,
    instrument_tracks: instrumentTracks.map((track) => cloneInstrumentTrackState(track)),
  };
}

function getInstrumentHistoryHash() {
  return JSON.stringify(getInstrumentHistoryState());
}

function resetInstrumentHistory() {
  const snapshot = getInstrumentHistoryState();
  instrumentHistory = [snapshot];
  instrumentHistoryIndex = 0;
  instrumentHistoryHash = JSON.stringify(snapshot);
}

function recordInstrumentHistoryIfNeeded({ force = false } = {}) {
  if (instrumentHistorySuspended) return;
  const snapshot = getInstrumentHistoryState();
  const hash = JSON.stringify(snapshot);
  if (!force && hash === instrumentHistoryHash) return;
  if (instrumentHistoryIndex < instrumentHistory.length - 1) {
    instrumentHistory = instrumentHistory.slice(0, instrumentHistoryIndex + 1);
  }
  instrumentHistory.push(snapshot);
  if (instrumentHistory.length > 80) {
    instrumentHistory.shift();
  }
  instrumentHistoryIndex = instrumentHistory.length - 1;
  instrumentHistoryHash = hash;
}

function restoreInstrumentHistorySnapshot(snapshot = null) {
  if (!snapshot) return false;
  instrumentHistorySuspended = true;
  instrumentTracks = Array.isArray(snapshot.instrument_tracks)
    ? snapshot.instrument_tracks.map((track) => createInstrumentTrack(track))
    : [];
  instrumentLoopEnabled = Boolean(snapshot.instrument_loop_enabled);
  instrumentLoopStart = normalizeInstrumentStepValue(snapshot.instrument_loop_start || 0, 0);
  instrumentLoopLength = Math.max(1, Number(snapshot.instrument_loop_length || 16));
  selectedInstrumentTrackId = instrumentTracks.find((track) => track.id === selectedInstrumentTrackId)?.id
    || instrumentTracks[0]?.id
    || "";
  clearSelectedInstrumentNotes();
  instrumentHistorySuspended = false;
  instrumentHistoryHash = JSON.stringify(getInstrumentHistoryState());
  renderInstrumentDeck();
  return true;
}

function undoInstrumentHistory() {
  if (instrumentHistoryIndex <= 0) return false;
  instrumentHistoryIndex -= 1;
  return restoreInstrumentHistorySnapshot(instrumentHistory[instrumentHistoryIndex]);
}

function redoInstrumentHistory() {
  if (instrumentHistoryIndex >= instrumentHistory.length - 1) return false;
  instrumentHistoryIndex += 1;
  return restoreInstrumentHistorySnapshot(instrumentHistory[instrumentHistoryIndex]);
}

function getSelectedInstrumentTrack() {
  return instrumentTracks.find((track) => track.id === selectedInstrumentTrackId) || null;
}

function countInstrumentHits(track = {}) {
  return Array.isArray(track.notes) ? track.notes.length : 0;
}

function getInstrumentNoteKey(trackId, rowId, start) {
  return `${trackId}::${rowId}::${normalizeInstrumentStepValue(start, 0).toFixed(INSTRUMENT_STEP_PRECISION)}`;
}

function clearSelectedInstrumentNotes() {
  selectedInstrumentNote = null;
  selectedInstrumentNoteKeys = [];
}

function isInstrumentNoteSelected(trackId, rowId, start) {
  return selectedInstrumentNoteKeys.includes(getInstrumentNoteKey(trackId, rowId, start));
}

function getSelectedInstrumentNote() {
  if (!selectedInstrumentNote) return null;
  const track = instrumentTracks.find((item) => item.id === selectedInstrumentNote.trackId);
  if (!track) return null;
  const note = (track.notes || []).find((item) => item.row === selectedInstrumentNote.row && item.start === selectedInstrumentNote.start);
  if (!note) return null;
  return { track, note };
}

function setSelectedInstrumentNote(trackId, rowId, start) {
  if (!(trackId && rowId)) {
    clearSelectedInstrumentNotes();
    return;
  }
  selectedInstrumentNote = { trackId, row: rowId, start: Number(start || 0) };
  selectedInstrumentNoteKeys = [getInstrumentNoteKey(trackId, rowId, start)];
}

function addSelectedInstrumentNote(trackId, rowId, start) {
  if (!(trackId && rowId)) return;
  const key = getInstrumentNoteKey(trackId, rowId, start);
  if (!selectedInstrumentNoteKeys.includes(key)) {
    selectedInstrumentNoteKeys = [...selectedInstrumentNoteKeys, key];
  }
  selectedInstrumentNote = { trackId, row: rowId, start: Number(start || 0) };
}

function toggleSelectedInstrumentNote(trackId, rowId, start) {
  if (!(trackId && rowId)) return;
  const key = getInstrumentNoteKey(trackId, rowId, start);
  if (selectedInstrumentNoteKeys.includes(key)) {
    selectedInstrumentNoteKeys = selectedInstrumentNoteKeys.filter((item) => item !== key);
    if (selectedInstrumentNote && getInstrumentNoteKey(selectedInstrumentNote.trackId, selectedInstrumentNote.row, selectedInstrumentNote.start) === key) {
      const nextKey = selectedInstrumentNoteKeys[0];
      if (!nextKey) {
        selectedInstrumentNote = null;
      } else {
        const [nextTrackId, nextRow, nextStart] = nextKey.split("::");
        selectedInstrumentNote = { trackId: nextTrackId, row: nextRow, start: Number(nextStart || 0) };
      }
    }
    return;
  }
  addSelectedInstrumentNote(trackId, rowId, start);
}

function getSelectedInstrumentNoteStates(trackId = selectedInstrumentTrackId) {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track) return [];
  return selectedInstrumentNoteKeys
    .map((key) => {
      const [selectionTrackId, rowId, start] = key.split("::");
      if (selectionTrackId !== trackId) return null;
      const note = (track.notes || []).find((item) => item.row === rowId && item.start === Number(start || 0));
      if (!note) return null;
      return { track, note };
    })
    .filter(Boolean);
}

function copySelectedInstrumentNotes() {
  const track = getSelectedInstrumentTrack();
  const selectedStates = track ? getSelectedInstrumentNoteStates(track.id) : [];
  if (!selectedStates.length) return false;
  const minStart = Math.min(...selectedStates.map(({ note }) => note.start));
  instrumentClipboard = {
    sourceRole: track.role,
    notes: selectedStates.map(({ track: sourceTrack, note }) => ({
      row: note.row,
      rowIndex: getInstrumentRowIndex(sourceTrack, note.row),
      startOffset: normalizeInstrumentStepValue(note.start - minStart, 0),
      length: note.length,
      velocity: note.velocity,
    })),
    span: normalizeInstrumentStepValue(
      Math.max(...selectedStates.map(({ note }) => note.start + note.length)) - minStart,
      0,
    ),
  };
  return true;
}

function duplicateSelectedInstrumentNotes() {
  const track = getSelectedInstrumentTrack();
  const selectedStates = track ? getSelectedInstrumentNoteStates(track.id) : [];
  if (!selectedStates.length) return false;
  const earliestStart = Math.min(...selectedStates.map(({ note }) => note.start));
  const latestEnd = Math.max(...selectedStates.map(({ note }) => note.start + note.length));
  const selectionSpan = normalizeInstrumentStepValue(Math.max(INSTRUMENT_MIN_NOTE_LENGTH, latestEnd - earliestStart), INSTRUMENT_MIN_NOTE_LENGTH);
  const offset = selectionSpan;
  return pasteInstrumentClipboard({
    anchorStart: earliestStart + offset,
    sourceNotes: selectedStates.map(({ track: sourceTrack, note }) => ({
      row: note.row,
      rowIndex: getInstrumentRowIndex(sourceTrack, note.row),
      startOffset: normalizeInstrumentStepValue(note.start - earliestStart, 0),
      length: note.length,
      velocity: note.velocity,
    })),
  });
}

function pasteInstrumentClipboard({ anchorStart = null, sourceNotes = null } = {}) {
  const track = getSelectedInstrumentTrack();
  const clipboard = sourceNotes ? { notes: sourceNotes } : instrumentClipboard;
  if (!track || !clipboard?.notes?.length) return false;
  const rows = getInstrumentRows(track);
  const totalSteps = getInstrumentStepCount(track);
  const targetStart = clampInstrumentNoteStart(
    anchorStart === null ? getInstrumentCursorStep(track) : anchorStart,
    totalSteps,
  );
  const pasted = [];
  clipboard.notes.forEach((item) => {
    const targetRow = rows[item.rowIndex] || rows.find((row) => row.id === item.row) || rows[0];
    if (!targetRow) return;
    const noteStart = clampInstrumentNoteStart(targetStart + Number(item.startOffset || 0), totalSteps);
    const noteLength = clampInstrumentNoteLength(Number(item.length || 1), noteStart, totalSteps);
    const inserted = upsertInstrumentNote(track.id, targetRow.id, noteStart, noteLength, item.velocity || 96);
    if (inserted) {
      pasted.push(inserted);
    }
  });
  if (!pasted.length) return false;
  selectedInstrumentNoteKeys = pasted.map((note) => getInstrumentNoteKey(track.id, note.row, note.start));
  const first = pasted[0];
  selectedInstrumentNote = first ? { trackId: track.id, row: first.row, start: first.start } : null;
  instrumentEditCursorStep = Math.min(totalSteps - 1, Math.ceil(Math.max(...pasted.map((note) => note.start + note.length))));
  return true;
}

function syncSelectedInstrumentNotes() {
  if (!selectedInstrumentNoteKeys.length) {
    selectedInstrumentNote = null;
    return;
  }
  const validStates = instrumentTracks.flatMap((track) => getSelectedInstrumentNoteStates(track.id));
  const validKeys = validStates.map(({ track, note }) => getInstrumentNoteKey(track.id, note.row, note.start));
  selectedInstrumentNoteKeys = validKeys;
  if (!selectedInstrumentNote || !validKeys.includes(getInstrumentNoteKey(selectedInstrumentNote.trackId, selectedInstrumentNote.row, selectedInstrumentNote.start))) {
    const first = validStates[0];
    selectedInstrumentNote = first ? { trackId: first.track.id, row: first.note.row, start: first.note.start } : null;
  }
}

function getVisualSelectedInstrumentNoteKeys(trackId = selectedInstrumentTrackId) {
  const keys = new Set(selectedInstrumentNoteKeys);
  if (instrumentSelectionGesture && instrumentSelectionGesture.trackId === trackId) {
    (instrumentSelectionGesture.previewKeys || []).forEach((key) => keys.add(key));
  }
  return keys;
}

function isInstrumentNoteVisuallySelected(trackId, rowId, start) {
  return getVisualSelectedInstrumentNoteKeys(trackId).has(getInstrumentNoteKey(trackId, rowId, start));
}

function setInstrumentLoopFromSelection() {
  const track = getSelectedInstrumentTrack();
  if (!track) return false;
  const selectedStates = getSelectedInstrumentNoteStates(track.id);
  const targetNotes = selectedStates.length ? selectedStates.map(({ note }) => note) : (track.notes || []);
  if (!targetNotes.length) return false;
  const start = Math.min(...targetNotes.map((note) => note.start));
  const end = Math.max(...targetNotes.map((note) => note.start + note.length));
  instrumentLoopStart = clampInstrumentNoteStart(start, getInstrumentStepCount(track));
  instrumentLoopLength = clampInstrumentNoteLength(Math.max(INSTRUMENT_MIN_NOTE_LENGTH, end - start), instrumentLoopStart, getInstrumentStepCount(track));
  instrumentLoopEnabled = true;
  return true;
}

function clearInstrumentLoopRegion() {
  instrumentLoopEnabled = false;
}

function transformEntireInstrumentTrack(track, mutator) {
  if (!(track && Array.isArray(track.notes) && track.notes.length)) return false;
  const rows = getInstrumentRows(track);
  const totalSteps = getInstrumentStepCount(track);
  const drafts = track.notes.map((note) => ({ ...note }));
  const changed = mutator(drafts, { track, rows, totalSteps });
  if (changed === false) return false;
  track.notes = [];
  drafts
    .map((draft) => ({
      row: rows.some((row) => row.id === draft.row) ? draft.row : rows[0]?.id || draft.row,
      start: clampInstrumentNoteStart(draft.start, totalSteps),
      length: Math.max(INSTRUMENT_MIN_NOTE_LENGTH, Number(draft.length || 1)),
      velocity: Math.max(1, Math.min(127, Number(draft.velocity || 96))),
    }))
    .map((draft) => ({ ...draft, length: clampInstrumentNoteLength(draft.length, draft.start, totalSteps) }))
    .sort((a, b) => (a.row === b.row ? a.start - b.start : a.row.localeCompare(b.row)))
    .forEach((draft) => {
      track.notes = (track.notes || []).filter((note) => !(note.row === draft.row && !(note.start + note.length <= draft.start || note.start >= draft.start + draft.length)));
      track.notes.push(draft);
    });
  sortInstrumentNotes(track);
  return true;
}

function quantizeInstrumentNotes() {
  const track = getSelectedInstrumentTrack();
  if (!track) return false;
  const resolution = normalizeInstrumentQuantizeResolution(instrumentQuantizeResolution);
  const selectionCount = getSelectedInstrumentNoteStates(track.id).length;
  const mutator = (drafts) => {
    drafts.forEach((draft) => {
      draft.start = snapValueToQuantizeGrid(draft.start, resolution);
      draft.length = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, snapValueToQuantizeGrid(draft.length, resolution));
    });
  };
  return selectionCount
    ? updateSelectedInstrumentNotes(mutator)
    : transformEntireInstrumentTrack(track, mutator);
}

function humanizeInstrumentNotes() {
  const track = getSelectedInstrumentTrack();
  if (!track) return false;
  const selectionCount = getSelectedInstrumentNoteStates(track.id).length;
  const timeJitter = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, normalizeInstrumentQuantizeResolution(instrumentQuantizeResolution) * 0.45);
  const lengthJitter = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, normalizeInstrumentQuantizeResolution(instrumentQuantizeResolution) * 0.35);
  const velocityJitter = isDrumInstrumentRole(track.role) ? 18 : 12;
  const mutator = (drafts) => {
    drafts.forEach((draft) => {
      draft.start += ((Math.random() * 2) - 1) * timeJitter;
      draft.length = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, draft.length + (((Math.random() * 2) - 1) * lengthJitter));
      draft.velocity = Math.max(1, Math.min(127, draft.velocity + Math.round(((Math.random() * 2) - 1) * velocityJitter)));
    });
  };
  return selectionCount
    ? updateSelectedInstrumentNotes(mutator)
    : transformEntireInstrumentTrack(track, mutator);
}

function summarizeInstrumentPattern(track = {}) {
  const steps = getInstrumentStepCount(track);
  const hits = countInstrumentHits(track);
  return `${hits} hit${hits === 1 ? "" : "s"} over ${steps} step${steps === 1 ? "" : "s"}`;
}

function findInstrumentNoteIndexAt(track, rowId, step) {
  return (track.notes || []).findIndex((note) => note.row === rowId && step >= note.start && step < note.start + note.length);
}

function sortInstrumentNotes(track) {
  track.notes = [...(track.notes || [])].sort((a, b) => {
    if (a.row === b.row) return a.start - b.start;
    return a.row.localeCompare(b.row);
  });
}

function upsertInstrumentNote(trackId, rowId, start, length, velocity = 96) {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track) return null;
  const totalSteps = getInstrumentStepCount(track);
  const normalizedStart = clampInstrumentNoteStart(start, totalSteps);
  const normalizedLength = clampInstrumentNoteLength(length, normalizedStart, totalSteps);
  const nextNote = {
    row: rowId,
    start: normalizedStart,
    length: normalizedLength,
    velocity: Math.max(1, Math.min(127, Number(velocity || 96))),
  };
  track.notes = (track.notes || []).filter((note) => !(
    note.row === rowId
    && !(note.start + note.length <= normalizedStart || note.start >= normalizedStart + normalizedLength)
  ));
  track.notes.push(nextNote);
  sortInstrumentNotes(track);
  setSelectedInstrumentNote(trackId, rowId, normalizedStart);
  return nextNote;
}

function setInstrumentNote(trackId, rowId, start, end) {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track) return;
  const totalSteps = getInstrumentStepCount(track);
  const rangeStart = clampInstrumentNoteStart(Math.min(start, end), totalSteps);
  const rangeLength = normalizeInstrumentStepValue(
    Math.max(INSTRUMENT_MIN_NOTE_LENGTH, (Math.max(start, end) - Math.min(start, end)) + 1),
    1,
  );
  upsertInstrumentNote(trackId, rowId, rangeStart, rangeLength, 96);
}

function removeInstrumentNoteAt(trackId, rowId, step) {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track) return false;
  const noteIndex = findInstrumentNoteIndexAt(track, rowId, step);
  if (noteIndex === -1) return false;
  track.notes.splice(noteIndex, 1);
  sortInstrumentNotes(track);
  if (selectedInstrumentNote && selectedInstrumentNote.trackId === trackId && selectedInstrumentNote.row === rowId && selectedInstrumentNote.start === step) {
    clearSelectedInstrumentNotes();
  }
  return true;
}

function updateSelectedInstrumentNote(mutator) {
  const selected = getSelectedInstrumentNote();
  if (!selected) return false;
  const { track, note } = selected;
  const draft = { ...note };
  const rows = getInstrumentRows(track);
  const changed = mutator(draft, { track, rows });
  if (changed === false) return false;
  const totalSteps = getInstrumentStepCount(track);
  draft.start = clampInstrumentNoteStart(draft.start, totalSteps);
  draft.length = clampInstrumentNoteLength(draft.length, draft.start, totalSteps);
  draft.velocity = Math.max(1, Math.min(127, Number(draft.velocity || 96)));
  if (!rows.some((row) => row.id === draft.row)) {
    draft.row = note.row;
  }
  const noteIndex = track.notes.findIndex((item) => item.row === note.row && item.start === note.start);
  if (noteIndex === -1) return false;
  track.notes.splice(noteIndex, 1);
  track.notes = (track.notes || []).filter((item) => !(item.row === draft.row && !(item.start + item.length <= draft.start || item.start >= draft.start + draft.length)));
  track.notes.push(draft);
  sortInstrumentNotes(track);
  setSelectedInstrumentNote(track.id, draft.row, draft.start);
  return true;
}

function updateSelectedInstrumentNotes(mutator) {
  const track = getSelectedInstrumentTrack();
  if (!track) return false;
  const selectedStates = getSelectedInstrumentNoteStates(track.id);
  if (!selectedStates.length) return false;
  const rows = getInstrumentRows(track);
  const drafts = selectedStates.map(({ note }) => ({ ...note }));
  const activeIndex = selectedInstrumentNote
    ? selectedStates.findIndex(({ note }) => note.row === selectedInstrumentNote.row && note.start === selectedInstrumentNote.start)
    : 0;
  const changed = mutator(drafts, { track, rows, selectedCount: drafts.length });
  if (changed === false) return false;
  const totalSteps = getInstrumentStepCount(track);
  const originalKeys = new Set(selectedStates.map(({ note }) => getInstrumentNoteKey(track.id, note.row, note.start)));
  track.notes = (track.notes || []).filter((note) => !originalKeys.has(getInstrumentNoteKey(track.id, note.row, note.start)));
  const normalizedDrafts = drafts
    .map((draft) => ({
      row: rows.some((row) => row.id === draft.row) ? draft.row : rows[0]?.id || draft.row,
      start: clampInstrumentNoteStart(draft.start, totalSteps),
      length: Math.max(INSTRUMENT_MIN_NOTE_LENGTH, Number(draft.length || 1)),
      velocity: Math.max(1, Math.min(127, Number(draft.velocity || 96))),
    }))
    .map((draft) => ({ ...draft, length: clampInstrumentNoteLength(draft.length, draft.start, totalSteps) }))
    .sort((a, b) => (a.row === b.row ? a.start - b.start : a.row.localeCompare(b.row)));
  normalizedDrafts.forEach((draft) => {
    track.notes = (track.notes || []).filter((note) => !(note.row === draft.row && !(note.start + note.length <= draft.start || note.start >= draft.start + draft.length)));
    track.notes.push(draft);
  });
  sortInstrumentNotes(track);
  selectedInstrumentNoteKeys = normalizedDrafts.map((note) => getInstrumentNoteKey(track.id, note.row, note.start));
  const nextActive = normalizedDrafts[activeIndex >= 0 ? activeIndex : 0] || normalizedDrafts[0] || null;
  selectedInstrumentNote = nextActive ? { trackId: track.id, row: nextActive.row, start: nextActive.start } : null;
  return true;
}

function removeSelectedInstrumentNotes() {
  const track = getSelectedInstrumentTrack();
  if (!track) return false;
  const keys = new Set(getSelectedInstrumentNoteStates(track.id).map(({ note }) => getInstrumentNoteKey(track.id, note.row, note.start)));
  if (!keys.size) return false;
  track.notes = (track.notes || []).filter((note) => !keys.has(getInstrumentNoteKey(track.id, note.row, note.start)));
  clearSelectedInstrumentNotes();
  sortInstrumentNotes(track);
  return true;
}

function applySelectedInstrumentNoteField(field, rawValue, { batch = false } = {}) {
  if (batch) {
    return updateSelectedInstrumentNotes((drafts) => {
      drafts.forEach((draft) => {
        if (field === "velocity") {
          draft.velocity = Number(rawValue || 96);
        }
      });
    });
  }
  return updateSelectedInstrumentNote((draft) => {
    if (field === "row") {
      draft.row = rawValue;
    } else if (field === "start") {
      draft.start = Math.max(0, Number(rawValue || 1) - 1);
    } else if (field === "length") {
      draft.length = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, Number(rawValue || 1));
    } else if (field === "velocity") {
      draft.velocity = Number(rawValue || 96);
    }
  });
}

function runSelectedInstrumentNoteAction(action = "") {
  const track = getSelectedInstrumentTrack();
  if (!track) return false;
  const selectedStates = getSelectedInstrumentNoteStates(track.id);
  if (!selectedStates.length) return false;
  if (action === "delete") {
    return removeSelectedInstrumentNotes();
  }
  return updateSelectedInstrumentNotes((drafts, context) => {
    drafts.forEach((draft) => {
      if (action === "left") {
        draft.start -= 1;
        return;
      }
      if (action === "right") {
        draft.start += 1;
        return;
      }
      if (action === "shorter") {
        draft.length = Math.max(INSTRUMENT_MIN_NOTE_LENGTH, draft.length - 1);
        return;
      }
      if (action === "longer") {
        draft.length = Math.min(getInstrumentStepCount(context.track) - draft.start, draft.length + 1);
      }
    });
  });
}

function getInstrumentRowIndex(track, rowId) {
  return getInstrumentRows(track).findIndex((row) => row.id === rowId);
}

function getInstrumentMetrics(trackId = "") {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track || !instrumentGrid) return null;
  const rowCanvases = [...instrumentGrid.querySelectorAll(".instrument-row-canvas[data-instrument-row][data-instrument-track-id]")];
  const canvasesForTrack = rowCanvases.filter((canvas) => canvas.dataset.instrumentTrackId === trackId);
  if (!canvasesForTrack.length) return null;
  const firstCanvas = canvasesForTrack[0];
  const firstCell = firstCanvas.querySelector(".instrument-cell");
  const secondCell = firstCanvas.querySelector('[data-instrument-cell-step="1"]');
  const firstRect = firstCell?.getBoundingClientRect();
  const secondRect = secondCell?.getBoundingClientRect();
  const stepWidth = firstRect?.width || 32;
  const gap = firstRect && secondRect ? Math.max(0, secondRect.left - firstRect.left - firstRect.width) : 0;
  return {
    track,
    stepWidth,
    gap,
    rows: canvasesForTrack.map((canvas) => ({
      rowId: canvas.dataset.instrumentRow || "",
      rect: canvas.getBoundingClientRect(),
    })),
  };
}

function getInstrumentPointerTarget(trackId, clientX, clientY) {
  const metrics = getInstrumentMetrics(trackId);
  if (!metrics) return null;
  const { track, stepWidth, gap, rows } = metrics;
  const totalSteps = getInstrumentStepCount(track);
  let targetRow = rows.find((row) => clientY >= row.rect.top && clientY <= row.rect.bottom) || null;
  if (!targetRow) {
    targetRow = rows.reduce((closest, row) => {
      if (!closest) return row;
      const closestDistance = Math.abs(((closest.rect.top + closest.rect.bottom) / 2) - clientY);
      const nextDistance = Math.abs(((row.rect.top + row.rect.bottom) / 2) - clientY);
      return nextDistance < closestDistance ? row : closest;
    }, null);
  }
  if (!targetRow) return null;
  const stepSpan = stepWidth + gap;
  const offsetX = Math.max(0, clientX - targetRow.rect.left);
  const clampedWholeStep = Math.max(0, Math.min(totalSteps - 1, Math.floor(offsetX / Math.max(1, stepSpan))));
  const withinStep = offsetX - (clampedWholeStep * stepSpan);
  const fraction = Math.max(0, Math.min(1, withinStep / Math.max(1, stepWidth)));
  const rawPosition = Math.min(totalSteps - INSTRUMENT_MIN_NOTE_LENGTH, clampedWholeStep + fraction);
  const snappedPosition = snapInstrumentGridPosition(rawPosition, { maxStart: totalSteps - INSTRUMENT_MIN_NOTE_LENGTH });
  return {
    rowId: targetRow.rowId,
    step: Math.max(0, Math.min(totalSteps - 1, Math.floor(snappedPosition))),
    position: snappedPosition,
  };
}

function hasDirtyInstrumentGestureNotes(sourceNotes = [], currentNotes = []) {
  if (sourceNotes.length !== currentNotes.length) return true;
  return sourceNotes.some((note, index) => {
    const current = currentNotes[index];
    return !current
      || current.row !== note.row
      || current.start !== note.start
      || current.length !== note.length;
  });
}

function hasDirtyInstrumentVelocityNotes(sourceNotes = [], currentNotes = []) {
  if (sourceNotes.length !== currentNotes.length) return true;
  return sourceNotes.some((note, index) => {
    const current = currentNotes[index];
    return !current || current.velocity !== note.velocity;
  });
}

function getDisplayedInstrumentNotes(track) {
  const gesturePreviewMap = instrumentNoteGesture && instrumentNoteGesture.trackId === track.id
    ? new Map(
      (instrumentNoteGesture.currentNotes || []).map((note, index) => {
        const source = instrumentNoteGesture.sourceNotes?.[index];
        return [
          source?.key || getInstrumentNoteKey(track.id, note.row, note.start),
          { ...note, __gesture: true },
        ];
      }),
    )
    : null;
  const velocityPreviewMap = instrumentVelocityGesture && instrumentVelocityGesture.trackId === track.id
    ? new Map(
      (instrumentVelocityGesture.currentNotes || []).map((note, index) => {
        const source = instrumentVelocityGesture.sourceNotes?.[index];
        return [
          source?.key || getInstrumentNoteKey(track.id, note.row, note.start),
          { velocity: note.velocity, __velocityGesture: true },
        ];
      }),
    )
    : null;
  return (track.notes || []).map((note, noteIndex) => {
    const key = getInstrumentNoteKey(track.id, note.row, note.start);
    const noteGesture = gesturePreviewMap?.get(key) || null;
    const velocityGesture = velocityPreviewMap?.get(key) || null;
    return {
      ...note,
      ...(noteGesture || {}),
      ...(velocityGesture || {}),
      noteIndex,
    };
  });
}

function updateInstrumentSelectionGesture(pointerEvent) {
  if (!instrumentSelectionGesture || !instrumentGrid) return false;
  if (instrumentSelectionGesture.pointerId !== undefined && pointerEvent.pointerId !== undefined && instrumentSelectionGesture.pointerId !== pointerEvent.pointerId) {
    return false;
  }
  const gridRect = instrumentGrid.getBoundingClientRect();
  const left = Math.max(0, Math.min(pointerEvent.clientX, instrumentSelectionGesture.startClientX) - gridRect.left);
  const top = Math.max(0, Math.min(pointerEvent.clientY, instrumentSelectionGesture.startClientY) - gridRect.top);
  const right = Math.max(0, Math.max(pointerEvent.clientX, instrumentSelectionGesture.startClientX) - gridRect.left);
  const bottom = Math.max(0, Math.max(pointerEvent.clientY, instrumentSelectionGesture.startClientY) - gridRect.top);
  instrumentSelectionGesture.box = {
    left,
    top,
    width: Math.max(4, right - left),
    height: Math.max(4, bottom - top),
  };
  const noteBlocks = [...instrumentGrid.querySelectorAll(`.instrument-note-block[data-instrument-track-id="${instrumentSelectionGesture.trackId}"]`)];
  const hits = noteBlocks
    .filter((block) => {
      const rect = block.getBoundingClientRect();
      return !(rect.right < Math.min(pointerEvent.clientX, instrumentSelectionGesture.startClientX)
        || rect.left > Math.max(pointerEvent.clientX, instrumentSelectionGesture.startClientX)
        || rect.bottom < Math.min(pointerEvent.clientY, instrumentSelectionGesture.startClientY)
        || rect.top > Math.max(pointerEvent.clientY, instrumentSelectionGesture.startClientY));
    })
    .map((block) => getInstrumentNoteKey(
      block.dataset.instrumentTrackId || "",
      block.dataset.instrumentNoteRow || "",
      Number(block.dataset.instrumentNoteStart || 0),
    ));
  const preview = instrumentSelectionGesture.additive
    ? [...new Set([...(instrumentSelectionGesture.baseKeys || []), ...hits])]
    : hits;
  instrumentSelectionGesture.previewKeys = preview;
  return true;
}

function commitInstrumentSelectionGesture() {
  if (!instrumentSelectionGesture) return false;
  const gesture = instrumentSelectionGesture;
  instrumentSelectionGesture = null;
  instrumentSuppressClickUntil = performance.now() + 240;
  selectedInstrumentNoteKeys = [...(gesture.previewKeys || [])];
  if (!selectedInstrumentNoteKeys.length) {
    selectedInstrumentNote = null;
    renderInstrumentDeck();
    return stepDuration * 4.1 * 1000;
  }
  const [trackId, rowId, start] = selectedInstrumentNoteKeys[0].split("::");
  selectedInstrumentNote = { trackId, row: rowId, start: Number(start || 0) };
  return stepDuration * 4.2 * 1000;
}

function cancelInstrumentSelectionGesture() {
  if (!instrumentSelectionGesture) return;
  instrumentSelectionGesture = null;
  renderInstrumentDeck();
}

function startInstrumentNoteGesture(mode, trackId, rowId, start, length, pointerEvent) {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track) return;
  const rows = getInstrumentRows(track);
  const rowIndexMap = new Map(rows.map((row, index) => [row.id, index]));
  const selectedStates = getSelectedInstrumentNoteStates(trackId);
  const clickedKey = getInstrumentNoteKey(trackId, rowId, start);
  const useGroup = selectedStates.length > 1 && selectedStates.some(({ note }) => getInstrumentNoteKey(trackId, note.row, note.start) === clickedKey);
  const sourceNotes = (useGroup ? selectedStates : [{ track, note: (track.notes || []).find((note) => note.row === rowId && note.start === start) || { row: rowId, start, length, velocity: 96 } }])
    .map(({ note }) => ({
      key: getInstrumentNoteKey(trackId, note.row, note.start),
      row: note.row,
      rowIndex: rowIndexMap.get(note.row) ?? 0,
      start: note.start,
      length: note.length,
      velocity: Math.max(1, Math.min(127, Number(note.velocity || 96))),
    }));
  const anchorNote = sourceNotes.find((note) => note.key === clickedKey) || sourceNotes[0];
  if (!anchorNote) return;
  const pointerTarget = getInstrumentPointerTarget(trackId, pointerEvent.clientX, pointerEvent.clientY);
  const pointerPosition = pointerTarget?.position ?? anchorNote.start;
  const clampedOffset = Math.max(0, Math.min(anchorNote.length - INSTRUMENT_MIN_NOTE_LENGTH, pointerPosition - anchorNote.start));
  const totalSteps = getInstrumentStepCount(track);
  const minMoveStepDelta = Math.max(...sourceNotes.map((note) => -note.start));
  const maxMoveStepDelta = Math.min(...sourceNotes.map((note) => totalSteps - note.length - note.start));
  const minMoveRowDelta = Math.max(...sourceNotes.map((note) => -note.rowIndex));
  const maxMoveRowDelta = Math.min(...sourceNotes.map((note) => (rows.length - 1) - note.rowIndex));
  const minResizeLeftDelta = Math.max(...sourceNotes.map((note) => -note.start));
  const maxResizeLeftDelta = Math.min(...sourceNotes.map((note) => note.length - INSTRUMENT_MIN_NOTE_LENGTH));
  const minResizeRightDelta = Math.max(...sourceNotes.map((note) => -(note.length - INSTRUMENT_MIN_NOTE_LENGTH)));
  const maxResizeRightDelta = Math.min(...sourceNotes.map((note) => totalSteps - note.start - note.length));
  instrumentNoteGesture = {
    mode,
    pointerId: pointerEvent.pointerId,
    trackId,
    sourceRow: anchorNote.row,
    sourceStart: anchorNote.start,
    sourceLength: anchorNote.length,
    currentRow: anchorNote.row,
    currentStart: anchorNote.start,
    currentLength: anchorNote.length,
    sourceNotes,
    currentNotes: sourceNotes.map((note) => ({ ...note })),
    activeKey: anchorNote.key,
    minMoveStepDelta,
    maxMoveStepDelta,
    minMoveRowDelta,
    maxMoveRowDelta,
    minResizeLeftDelta,
    maxResizeLeftDelta,
    minResizeRightDelta,
    maxResizeRightDelta,
    grabOffset: clampedOffset,
    dirty: false,
  };
  if (useGroup) {
    selectedInstrumentNote = { trackId, row: anchorNote.row, start: anchorNote.start };
  } else {
    setSelectedInstrumentNote(trackId, anchorNote.row, anchorNote.start);
  }
}

function startInstrumentSelectionGesture(trackId, pointerEvent, { initialKeys = [] } = {}) {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!(track && instrumentGrid)) return;
  const additive = Boolean(pointerEvent.shiftKey || pointerEvent.ctrlKey || pointerEvent.metaKey);
  const baseKeys = additive
    ? selectedInstrumentNoteKeys.filter((key) => key.startsWith(`${trackId}::`))
    : initialKeys.filter((key) => key.startsWith(`${trackId}::`));
  selectedInstrumentTrackId = track.id;
  instrumentSelectionGesture = {
    pointerId: pointerEvent.pointerId,
    trackId,
    startClientX: pointerEvent.clientX,
    startClientY: pointerEvent.clientY,
    additive,
    baseKeys,
    previewKeys: [...baseKeys],
    box: {
      left: 0,
      top: 0,
      width: 4,
      height: 4,
    },
  };
}

function resolveInstrumentSelectionTrackId(preferredTrackId = "") {
  const candidateIds = [
    preferredTrackId,
    selectedInstrumentTrackId,
    getSelectedInstrumentTrack()?.id || "",
    instrumentTracks[0]?.id || "",
  ];
  return candidateIds.find((candidateId) => candidateId && instrumentTracks.some((track) => track.id === candidateId)) || "";
}

function beginInstrumentWorkspaceSelection(pointerEvent, preferredTrackId = "", { initialKeys = [] } = {}) {
  const trackId = resolveInstrumentSelectionTrackId(preferredTrackId);
  if (!trackId) return false;
  pointerEvent.preventDefault();
  startInstrumentSelectionGesture(trackId, pointerEvent, { initialKeys });
  renderInstrumentDeck();
  return true;
}

function updateInstrumentNoteGesture(pointerEvent) {
  if (!instrumentNoteGesture) return false;
  const gesture = instrumentNoteGesture;
  if (gesture.pointerId !== undefined && pointerEvent.pointerId !== undefined && gesture.pointerId !== pointerEvent.pointerId) {
    return false;
  }
  const pointerTarget = getInstrumentPointerTarget(gesture.trackId, pointerEvent.clientX, pointerEvent.clientY);
  if (!pointerTarget) return false;
  const track = instrumentTracks.find((item) => item.id === gesture.trackId);
  if (!track) return false;
  const rows = getInstrumentRows(track);
  const rowIndexMap = new Map(rows.map((row, index) => [row.id, index]));
  const anchorNote = gesture.sourceNotes?.find((note) => note.key === gesture.activeKey) || gesture.sourceNotes?.[0];
  if (!anchorNote) return false;
  if (gesture.mode === "move") {
    const pointerRowIndex = rowIndexMap.get(pointerTarget.rowId) ?? anchorNote.rowIndex;
    const rawStepDelta = (pointerTarget.position - gesture.grabOffset) - anchorNote.start;
    const nextStepDelta = snapInstrumentGridDelta(
      Math.max(gesture.minMoveStepDelta, Math.min(gesture.maxMoveStepDelta, rawStepDelta)),
    );
    const rawRowDelta = pointerRowIndex - anchorNote.rowIndex;
    const nextRowDelta = Math.max(gesture.minMoveRowDelta, Math.min(gesture.maxMoveRowDelta, rawRowDelta));
    gesture.currentNotes = gesture.sourceNotes.map((note) => ({
      ...note,
      row: rows[note.rowIndex + nextRowDelta]?.id || note.row,
      start: normalizeInstrumentStepValue(note.start + nextStepDelta, note.start),
      length: note.length,
    }));
    const anchorCurrent = gesture.currentNotes.find((note) => note.key === gesture.activeKey) || gesture.currentNotes[0];
    gesture.currentStart = anchorCurrent.start;
    gesture.currentLength = anchorCurrent.length;
    gesture.currentRow = anchorCurrent.row;
    gesture.dirty = hasDirtyInstrumentGestureNotes(gesture.sourceNotes, gesture.currentNotes);
    return stepDuration * 4.1 * 1000;
  }
  if (gesture.mode === "resize-left") {
    const rawDelta = pointerTarget.position - anchorNote.start;
    const nextDelta = snapInstrumentGridDelta(
      Math.max(gesture.minResizeLeftDelta, Math.min(gesture.maxResizeLeftDelta, rawDelta)),
    );
    gesture.currentNotes = gesture.sourceNotes.map((note) => ({
      ...note,
      row: note.row,
      start: normalizeInstrumentStepValue(note.start + nextDelta, note.start),
      length: normalizeInstrumentStepValue(note.length - nextDelta, note.length),
    }));
    const anchorCurrent = gesture.currentNotes.find((note) => note.key === gesture.activeKey) || gesture.currentNotes[0];
    gesture.currentStart = anchorCurrent.start;
    gesture.currentLength = anchorCurrent.length;
    gesture.currentRow = anchorCurrent.row;
    gesture.dirty = hasDirtyInstrumentGestureNotes(gesture.sourceNotes, gesture.currentNotes);
    return true;
  }
  if (gesture.mode === "resize-right") {
    const rawDelta = (pointerTarget.position + INSTRUMENT_MIN_NOTE_LENGTH) - (anchorNote.start + anchorNote.length);
    const nextDelta = snapInstrumentGridDelta(
      Math.max(gesture.minResizeRightDelta, Math.min(gesture.maxResizeRightDelta, rawDelta)),
    );
    gesture.currentNotes = gesture.sourceNotes.map((note) => ({
      ...note,
      row: note.row,
      start: note.start,
      length: normalizeInstrumentStepValue(note.length + nextDelta, note.length),
    }));
    const anchorCurrent = gesture.currentNotes.find((note) => note.key === gesture.activeKey) || gesture.currentNotes[0];
    gesture.currentStart = anchorCurrent.start;
    gesture.currentLength = anchorCurrent.length;
    gesture.currentRow = anchorCurrent.row;
    gesture.dirty = hasDirtyInstrumentGestureNotes(gesture.sourceNotes, gesture.currentNotes);
    return true;
  }
  return false;
}

function commitInstrumentNoteGesture() {
  if (!instrumentNoteGesture) return false;
  const gesture = instrumentNoteGesture;
  instrumentNoteGesture = null;
  if (!gesture.dirty) {
    renderInstrumentDeck();
    return false;
  }
  selectedInstrumentNoteKeys = gesture.sourceNotes.map((note) => note.key);
  selectedInstrumentNote = { trackId: gesture.trackId, row: gesture.sourceRow, start: gesture.sourceStart };
  return updateSelectedInstrumentNotes((drafts) => {
    drafts.forEach((draft, index) => {
      const current = gesture.currentNotes[index];
      if (!current) return;
      draft.row = current.row;
      draft.start = current.start;
      draft.length = current.length;
      draft.velocity = current.velocity;
    });
  });
}

function cancelInstrumentNoteGesture() {
  if (!instrumentNoteGesture) return;
  instrumentNoteGesture = null;
  renderInstrumentDeck();
}

function startInstrumentVelocityGesture(trackId, rowId, start, pointerEvent) {
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track || !instrumentVelocityLane) return;
  const selectedStates = getSelectedInstrumentNoteStates(trackId);
  const clickedKey = getInstrumentNoteKey(trackId, rowId, start);
  const useGroup = selectedStates.length > 1 && selectedStates.some(({ note }) => getInstrumentNoteKey(trackId, note.row, note.start) === clickedKey);
  const sourceNotes = (useGroup
    ? selectedStates
    : [{ track, note: (track.notes || []).find((note) => note.row === rowId && note.start === start) || null }])
    .filter((entry) => entry?.note)
    .map(({ note }) => ({
      key: getInstrumentNoteKey(trackId, note.row, note.start),
      row: note.row,
      start: note.start,
      length: note.length,
      velocity: Math.max(1, Math.min(127, Number(note.velocity || 96))),
    }));
  if (!sourceNotes.length) return;
  if (useGroup) {
    selectedInstrumentNote = { trackId, row: sourceNotes[0].row, start: sourceNotes[0].start };
  } else {
    setSelectedInstrumentNote(trackId, rowId, start);
  }
  const laneRect = instrumentVelocityLane.getBoundingClientRect();
  instrumentVelocityGesture = {
    pointerId: pointerEvent.pointerId,
    trackId,
    sourceY: pointerEvent.clientY,
    laneHeight: laneRect.height || 120,
    sourceNotes,
    currentNotes: sourceNotes.map((note) => ({ ...note })),
    activeKey: clickedKey,
    dirty: false,
  };
}

function updateInstrumentVelocityGesture(pointerEvent) {
  if (!instrumentVelocityGesture) return false;
  if (instrumentVelocityGesture.pointerId !== undefined && pointerEvent.pointerId !== undefined && instrumentVelocityGesture.pointerId !== pointerEvent.pointerId) {
    return false;
  }
  const gesture = instrumentVelocityGesture;
  const deltaVelocity = Math.round(((gesture.sourceY - pointerEvent.clientY) / Math.max(40, gesture.laneHeight)) * 127);
  gesture.currentNotes = gesture.sourceNotes.map((note) => ({
    ...note,
    velocity: Math.max(1, Math.min(127, note.velocity + deltaVelocity)),
  }));
  gesture.dirty = hasDirtyInstrumentVelocityNotes(gesture.sourceNotes, gesture.currentNotes);
  return stepDuration * 4.2 * 1000;
}

function commitInstrumentVelocityGesture() {
  if (!instrumentVelocityGesture) return false;
  const gesture = instrumentVelocityGesture;
  instrumentVelocityGesture = null;
  if (!gesture.dirty) {
    renderInstrumentDeck();
    return false;
  }
  selectedInstrumentNoteKeys = gesture.sourceNotes.map((note) => note.key);
  const first = gesture.sourceNotes[0];
  selectedInstrumentNote = first ? { trackId: gesture.trackId, row: first.row, start: first.start } : null;
  return updateSelectedInstrumentNotes((drafts) => {
    drafts.forEach((draft, index) => {
      const current = gesture.currentNotes[index];
      if (!current) return;
      draft.velocity = current.velocity;
    });
  });
}

function cancelInstrumentVelocityGesture() {
  if (!instrumentVelocityGesture) return;
  instrumentVelocityGesture = null;
  renderInstrumentDeck();
}

function syncInstrumentDeckMeta() {
  if (!instrumentDeckMeta || !instrumentTrackCount || !instrumentPlayheadLabel || !instrumentGridSummary) return;
  const selected = getSelectedInstrumentTrack();
  const selectedNotes = selected ? getSelectedInstrumentNoteStates(selected.id) : [];
  const modeCopy = getInstrumentModeCopy();
  if (!instrumentTracks.length) {
    instrumentDeckMeta.textContent = "Pick a role, build a loop, then send the strongest musical idea back into the song.";
    instrumentTrackCount.textContent = "0 tracks";
    instrumentPlayheadLabel.textContent = instrumentTransport.playing ? "Playing" : "Stopped";
    instrumentGridSummary.textContent = "Add a track to unlock the piano roll.";
    if (instrumentGuideStatus) {
      instrumentGuideStatus.textContent = "1. Add a track to begin";
    }
    if (instrumentGuideHint) {
      instrumentGuideHint.textContent = "Start with drums, bass, or piano. Then choose Draw Notes, Select Notes, Audition Keys, or Record Keys.";
    }
    if (instrumentModeSummary) {
      instrumentModeSummary.textContent = modeCopy.summary;
    }
    if (instrumentSelectionSummary) {
      instrumentSelectionSummary.textContent = "No track selected";
    }
    if (instrumentShortcutSummary) {
      instrumentShortcutSummary.textContent = modeCopy.hint;
    }
    return;
  }
  const totalHits = instrumentTracks.reduce((sum, track) => sum + countInstrumentHits(track), 0);
  instrumentDeckMeta.textContent = `${instrumentTracks.length} instrument track${instrumentTracks.length === 1 ? "" : "s"} | ${totalHits} total notes | ${modeCopy.summary.replace("Mode: ", "")}`;
  instrumentTrackCount.textContent = `${instrumentTracks.length} track${instrumentTracks.length === 1 ? "" : "s"}`;
  instrumentPlayheadLabel.textContent = instrumentTransport.playing
    ? `Previewing ${describeInstrumentLoopRange(selected || instrumentTracks[0])}`
    : (instrumentAuditionState.activeUntil > performance.now() && instrumentAuditionState.label)
      ? instrumentAuditionState.label
      : "Preview stopped";
  instrumentGridSummary.textContent = selected
    ? `${selected.label} | ${summarizeInstrumentPattern(selected)} | ${formatInstrumentSoundLabel(selected.synth_type)} | cursor ${getInstrumentCursorStep(selected) + 1}`
    : "Choose a track to start drawing notes.";
  if (instrumentModeSummary) {
    instrumentModeSummary.textContent = modeCopy.summary;
  }
  if (instrumentSelectionSummary) {
    instrumentSelectionSummary.textContent = selectedNotes.length > 1
      ? `${selected.label} | ${selectedNotes.length} notes selected`
      : selectedNotes.length === 1
        ? `${selected.label} | 1 note selected`
        : `${selected?.label || "No track"} | ${selected ? "Track selected" : "No track selected"}`;
  }
  if (instrumentShortcutSummary) {
    instrumentShortcutSummary.textContent = modeCopy.hint;
  }
  if (instrumentGuideStatus) {
    instrumentGuideStatus.textContent = !selected
      ? "1. Pick a track to work on"
      : !countInstrumentHits(selected)
        ? `2. Put your first notes into ${selected.label}`
        : selectedNotes.length
          ? `3. Shape the selected note${selectedNotes.length > 1 ? "s" : ""} or keep recording`
          : `3. Add, preview, or record more notes into ${selected.label}`;
  }
  if (instrumentGuideHint) {
    instrumentGuideHint.textContent = !selected
      ? "Choose a track on the left or add a starter lane from the rack above."
      : !countInstrumentHits(selected)
        ? inputModeInstructionForEmptyTrack(selected)
        : selectedNotes.length
          ? "Use the inspector on the right for lane, timing, length, or velocity. Quantize or humanize from the toolbar when the phrase needs cleanup."
          : "Use Draw Notes for sketching, Select Notes for phrase editing, Audition Keys for trying ideas, or Record Keys if you want the loop to capture your timing.";
  }
}

function renderInstrumentTrackList() {
  if (!instrumentTrackList) return;
  if (!instrumentTracks.length) {
    instrumentTrackList.innerHTML = `
      <article class="empty-state compact">
        <h3>No instrument tracks yet</h3>
        <p>Choose a starter lane. You can build a groove with drums, a root with bass, chords with piano, or a hook with lead.</p>
        <div class="button-row">
          <button type="button" class="button-ghost" data-instrument-template="drums">Start with Drums</button>
          <button type="button" class="button-ghost" data-instrument-template="bass">Start with Bass</button>
          <button type="button" class="button-ghost" data-instrument-template="piano">Start with Piano</button>
        </div>
      </article>
    `;
    return;
  }
  instrumentTrackList.innerHTML = instrumentTracks.map((track, index) => `
    <button
      type="button"
      class="arrangement-part-row instrument-track-row ${track.id === selectedInstrumentTrackId ? "is-active" : ""}"
      data-instrument-select-id="${escapeHtml(track.id)}"
    >
      <span class="mix-track-swatch" data-accent="${escapeHtml(getMixRoleAccent(track.role))}"></span>
      <span class="mix-track-main">
        <strong>${escapeHtml(track.label || `Track ${index + 1}`)}</strong>
        <span>${escapeHtml(formatInstrumentRoleLabel(track.role))} | ${escapeHtml(formatInstrumentSoundLabel(track.synth_type))} | ${escapeHtml(summarizeInstrumentPattern(track))}</span>
      </span>
      <span class="instrument-track-mini">
        ${track.id === selectedInstrumentTrackId ? "Active" : ""}
        ${track.mute ? "Muted" : ""}
      </span>
    </button>
  `).join("");
}

function renderInstrumentGridHeader(track = null) {
  if (!instrumentGridHeader) return;
  if (!track) {
    instrumentGridHeader.innerHTML = "";
    return;
  }
  const steps = getInstrumentStepCount(track);
  const barSize = 16;
  const cursorStep = instrumentTransport.playing ? -1 : getInstrumentCursorStep(track);
  const loopRegion = getInstrumentLoopRegion(track);
  const playingStep = instrumentTransport.playing ? Math.floor(getCurrentTransportTrackStep(track)) : -1;
  instrumentGridHeader.innerHTML = `
    <div class="instrument-grid-corner" style="grid-column: 1 / 2;">Pitch / Step</div>
    ${Array.from({ length: steps }, (_, index) => `
      <span class="instrument-step-head ${playingStep === index ? "is-playing" : ""} ${cursorStep === index ? "is-cursor" : ""} ${loopRegion?.enabled && index >= loopRegion.start && index < loopRegion.end ? "is-loop" : ""} ${index % barSize === 0 ? "is-bar-start" : ""}">
        ${index % barSize === 0 ? `Bar ${Math.floor(index / barSize) + 1}` : index + 1}
      </span>
    `).join("")}
  `;
  instrumentGridHeader.style.gridTemplateColumns = `var(--instrument-label-width) repeat(${steps}, var(--instrument-step-width))`;
}

function renderInstrumentGrid() {
  if (!instrumentGrid || !instrumentGridHeader) return;
  const track = getSelectedInstrumentTrack();
  if (!track) {
    instrumentGridHeader.innerHTML = "";
    instrumentGrid.innerHTML = `
      <article class="empty-state compact">
        <h3>No pattern selected</h3>
        <p>Select or create a track and Astral will open a local step piano-roll here.</p>
      </article>
    `;
    return;
  }

  const rows = getInstrumentRows(track);
  const steps = getInstrumentStepCount(track);
  const cursorStep = instrumentTransport.playing ? -1 : getInstrumentCursorStep(track);
  const playbackStep = instrumentTransport.playing ? getCurrentTransportTrackStep(track) : -1;
  const activePlaybackStep = instrumentTransport.playing ? Math.floor(playbackStep) : -1;
  const loopRegion = getInstrumentLoopRegion(track);
  const visualMetrics = getInstrumentStepPixelMetrics();
  const rowNotes = new Map();
  const displayNotes = getDisplayedInstrumentNotes(track);
  displayNotes.forEach((note) => {
    const notesForRow = rowNotes.get(note.row) || [];
    notesForRow.push(note);
    rowNotes.set(note.row, notesForRow);
  });
  const drawingRange = instrumentDrawState && instrumentDrawState.trackId === track.id
    ? {
      row: instrumentDrawState.rowId,
      start: Math.min(instrumentDrawState.startStep, instrumentDrawState.currentStep),
      end: Math.max(instrumentDrawState.startStep, instrumentDrawState.currentStep),
    }
    : null;
  renderInstrumentGridHeader(track);
  const gridRowsMarkup = rows.map((row) => {
    const notesForRow = rowNotes.get(row.id) || [];
    return `
      <div class="instrument-grid-row-shell">
        <span class="instrument-row-label">${escapeHtml(row.label)}</span>
        <div class="instrument-row-canvas" data-instrument-row="${escapeHtml(row.id)}" data-instrument-track-id="${escapeHtml(track.id)}" style="grid-template-columns:repeat(${steps}, var(--instrument-step-width));">
        ${Array.from({ length: steps }, (_, step) => {
          const drawing = drawingRange
            && drawingRange.row === row.id
            && ((step + 1) > drawingRange.start && step < (drawingRange.end + INSTRUMENT_MIN_NOTE_LENGTH));
          return `
            <button
              type="button"
              class="instrument-cell ${drawing ? "is-drawing" : ""} ${activePlaybackStep === step ? "is-playing" : ""} ${cursorStep === step ? "is-cursor" : ""} ${loopRegion?.enabled && step >= loopRegion.start && step < loopRegion.end ? "is-loop" : ""} ${step % 16 === 0 ? "is-bar-start" : ""}"
              data-instrument-cell-step="${step}"
              data-instrument-cell-row="${escapeHtml(row.id)}"
              data-instrument-track-id="${escapeHtml(track.id)}"
              aria-label="${escapeHtml(row.label)} step ${step + 1}"
            ></button>
          `;
        }).join("")}
        ${notesForRow.map((note) => {
          const notePlaying = instrumentTransport.playing && playbackStep >= note.start && playbackStep < note.start + note.length;
          const noteSelected = note.__gesture || isInstrumentNoteVisuallySelected(track.id, note.row, note.start);
          const noteBounds = getInstrumentNotePixelBounds(note, visualMetrics);
          const noteLengthLabel = note.length >= 0.5 ? formatInstrumentStepValue(note.length) : "";
          return `
            <button
              type="button"
              class="instrument-note-block ${notePlaying ? "is-playing" : ""} ${noteSelected ? "is-selected" : ""} ${note.__gesture ? "is-gesture" : ""}"
              style="left:${noteBounds.left.toFixed(3)}px; width:${noteBounds.width.toFixed(3)}px; --instrument-note-velocity:${Math.max(0.15, Math.min(1, Number(note.velocity || 96) / 127)).toFixed(3)};"
              data-instrument-note-start="${note.start}"
              data-instrument-note-row="${escapeHtml(note.row)}"
              data-instrument-track-id="${escapeHtml(track.id)}"
              data-instrument-note-length="${note.length}"
              data-instrument-note-velocity="${note.velocity || 96}"
              aria-label="Note from step ${formatInstrumentStepValue(note.start + 1)} for ${formatInstrumentStepValue(note.length)} step${note.length === 1 ? "" : "s"}"
            ><span class="instrument-note-handle is-left" data-instrument-note-handle="left" aria-hidden="true"></span><span class="instrument-note-label">${escapeHtml(noteLengthLabel)}</span><span class="instrument-note-handle is-right" data-instrument-note-handle="right" aria-hidden="true"></span></button>
          `;
        }).join("")}
        </div>
      </div>
    `;
  }).join("");
  const selectionMarkup = instrumentSelectionGesture && instrumentSelectionGesture.trackId === track.id
    ? `<div class="instrument-selection-box" style="left:${instrumentSelectionGesture.box.left.toFixed(3)}px; top:${instrumentSelectionGesture.box.top.toFixed(3)}px; width:${instrumentSelectionGesture.box.width.toFixed(3)}px; height:${instrumentSelectionGesture.box.height.toFixed(3)}px;"></div>`
    : "";
  instrumentGrid.innerHTML = `${gridRowsMarkup}${selectionMarkup}`;
}

function renderInstrumentVelocityLane() {
  if (!instrumentVelocityLane || !instrumentVelocitySummary) return;
  const track = getSelectedInstrumentTrack();
  if (!track) {
    instrumentVelocitySummary.textContent = "Select a track to shape its dynamics.";
    instrumentVelocityLane.innerHTML = `
      <article class="empty-state compact">
        <h3>No dynamics yet</h3>
        <p>Select a track, then add notes so Astral can show and edit their velocity here.</p>
      </article>
    `;
    instrumentVelocityLane.style.width = "";
    return;
  }
  const notes = getDisplayedInstrumentNotes(track);
  if (!notes.length) {
    instrumentVelocitySummary.textContent = "Add notes to unlock the velocity lane.";
    instrumentVelocityLane.innerHTML = `
      <article class="empty-state compact">
        <h3>No note dynamics yet</h3>
        <p>Draw or record notes first, then drag the bars here to make hits softer or stronger.</p>
      </article>
    `;
    instrumentVelocityLane.style.width = "";
    return;
  }
  const visualMetrics = getInstrumentStepPixelMetrics();
  const steps = getInstrumentStepCount(track);
  const laneWidth = getInstrumentPixelPosition(steps, visualMetrics);
  instrumentVelocityLane.style.width = `${laneWidth.toFixed(3)}px`;
  const selectedCount = getVisualSelectedInstrumentNoteKeys(track.id).size;
  instrumentVelocitySummary.textContent = selectedCount
    ? `${selectedCount} selected | Drag bars up for more attack, down for softer hits`
    : "Click or drag a velocity bar to shape how strong each note feels.";
  instrumentVelocityLane.innerHTML = `
    <div class="instrument-velocity-guides">
      <span>127</span>
      <span>96</span>
      <span>64</span>
      <span>1</span>
    </div>
    ${notes.map((note) => {
      const noteBounds = getInstrumentNotePixelBounds(note, visualMetrics);
      const noteSelected = note.__gesture || isInstrumentNoteVisuallySelected(track.id, note.row, note.start);
      const height = Math.max(10, (Math.max(1, Math.min(127, Number(note.velocity || 96))) / 127) * 92);
      return `
        <button
          type="button"
          class="instrument-velocity-bar ${noteSelected ? "is-selected" : ""} ${note.__velocityGesture ? "is-gesture" : ""}"
          style="left:${noteBounds.left.toFixed(3)}px; width:${Math.max(10, noteBounds.width).toFixed(3)}px; height:${height.toFixed(3)}px;"
          data-instrument-velocity-start="${note.start}"
          data-instrument-velocity-row="${escapeHtml(note.row)}"
          data-instrument-track-id="${escapeHtml(track.id)}"
          data-instrument-velocity="${note.velocity || 96}"
          aria-label="Velocity ${note.velocity || 96} for note at step ${formatInstrumentStepValue(note.start + 1)}"
        >
          <span>${escapeHtml(String(Math.round(note.velocity || 96)))}</span>
        </button>
      `;
    }).join("")}
  `;
}

function renderInstrumentInspector() {
  if (!instrumentInspectorPanel || !instrumentSelectedLabel) return;
  const track = getSelectedInstrumentTrack();
  if (!track) {
    instrumentSelectedLabel.textContent = "No track selected";
    instrumentInspectorPanel.innerHTML = `
      <article class="empty-state compact">
        <h3>Select a track</h3>
        <p>Choose a lane to edit its role, sound, volume, note range, and pattern summary.</p>
      </article>
    `;
    return;
  }

  instrumentSelectedLabel.textContent = track.label || "Selected track";
  const selectedNotes = getSelectedInstrumentNoteStates(track.id);
  const selectedCount = selectedNotes.length;
  const selectedNoteState = getSelectedInstrumentNote();
  const selectedNote = selectedNoteState && selectedNoteState.track.id === track.id ? selectedNoteState.note : null;
  const rows = getInstrumentRows(track);
  const averageVelocity = selectedCount
    ? Math.round(selectedNotes.reduce((sum, { note }) => sum + Number(note.velocity || 96), 0) / selectedCount)
    : 96;
  instrumentInspectorPanel.innerHTML = `
    <div class="arrangement-inspector-grid">
      <div class="instrument-inspector-section field-wide">
        <div class="instrument-inspector-section-head">
          <strong>Track setup</strong>
          <p>Choose what this lane is, how long it loops, and how bright or heavy it should feel.</p>
        </div>
      </div>
      <label class="field field-wide">
        <span>Track name</span>
        <input type="text" value="${escapeHtml(track.label)}" data-instrument-track-field="label" data-instrument-track-id="${escapeHtml(track.id)}" />
      </label>
      <label class="field">
        <span>Role</span>
        <select data-instrument-track-field="role" data-instrument-track-id="${escapeHtml(track.id)}">
          ${INSTRUMENT_ROLE_OPTIONS
            .map((role) => `<option value="${role}" ${track.role === role ? "selected" : ""}>${escapeHtml(formatInstrumentRoleLabel(role))}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field">
        <span>Sound</span>
        <select data-instrument-track-field="synth_type" data-instrument-track-id="${escapeHtml(track.id)}">
          ${(isDrumInstrumentRole(track.role) ? ["drum-kit", "noise-kit"] : INSTRUMENT_SOUND_OPTIONS.filter((sound) => !["drum-kit", "noise-kit"].includes(sound)))
            .map((synthType) => `<option value="${synthType}" ${track.synth_type === synthType ? "selected" : ""}>${escapeHtml(formatInstrumentSoundLabel(synthType))}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field">
        <span>Loop length</span>
        <select data-instrument-track-field="steps" data-instrument-track-id="${escapeHtml(track.id)}">
          ${[
            [16, "1 bar"],
            [32, "2 bars"],
            [64, "4 bars"],
          ]
            .map(([count, label]) => `<option value="${count}" ${getInstrumentStepCount(track) === count ? "selected" : ""}>${label}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field">
        <span>Base note</span>
        <input type="number" min="24" max="84" step="1" value="${escapeHtml(String(track.base_midi))}" data-instrument-track-field="base_midi" data-instrument-track-id="${escapeHtml(track.id)}" ${isDrumInstrumentRole(track.role) ? "disabled" : ""} />
      </label>
      <label class="field slider-field">
        <span>Volume</span>
        <input type="range" min="0.1" max="1" step="0.01" value="${escapeHtml(String(track.volume))}" data-instrument-track-field="volume" data-instrument-track-id="${escapeHtml(track.id)}" />
        <strong>${escapeHtml(`${Math.round(track.volume * 100)}%`)}</strong>
      </label>
      <div class="mix-toggle-row field-wide">
        <label class="toggle mix-mini-toggle">
          <input type="checkbox" ${track.mute ? "checked" : ""} data-instrument-track-field="mute" data-instrument-track-id="${escapeHtml(track.id)}" />
          <span>Mute track</span>
        </label>
      </div>
      <div class="mix-track-facts field-wide">
        <strong>${escapeHtml(summarizeInstrumentPattern(track))}</strong>
        <p>${escapeHtml(isDrumInstrumentRole(track.role) ? "Percussion lane" : `Base note ${midiToNoteLabel(track.base_midi)}`)} | ${escapeHtml(formatInstrumentSoundLabel(track.synth_type))} | ${escapeHtml(formatInstrumentRoleLabel(track.role))} | ${escapeHtml(describeInstrumentLoopRange(track))}</p>
      </div>
      <div class="mix-track-facts field-wide instrument-note-editor">
        <div class="instrument-inspector-section-head">
          <strong>${selectedCount > 1 ? `${selectedCount} notes selected` : "Selected note"}</strong>
          <p>${selectedCount > 1
            ? "Batch edit timing, length, and velocity for the current selection."
            : selectedNote
              ? "Fine-tune the selected note without hunting through the grid."
              : "Click a note on the grid to tune it here, or stay in Draw Notes and sketch the next phrase."}</p>
        </div>
        ${selectedCount > 1 ? `
          <div class="arrangement-inspector-grid compact-grid">
            <label class="field">
              <span>Velocity</span>
              <input type="range" min="1" max="127" step="1" value="${escapeHtml(String(averageVelocity))}" data-instrument-note-batch-field="velocity" />
              <strong>${escapeHtml(String(averageVelocity))}</strong>
            </label>
          </div>
          <div class="button-row field-wide">
            <button type="button" class="button-ghost" data-instrument-note-action="left">Nudge Left</button>
            <button type="button" class="button-ghost" data-instrument-note-action="right">Nudge Right</button>
            <button type="button" class="button-ghost" data-instrument-note-action="shorter">Shorter</button>
            <button type="button" class="button-ghost" data-instrument-note-action="longer">Longer</button>
            <button type="button" class="button-tertiary" data-instrument-note-action="delete">Delete Selected</button>
          </div>
        ` : selectedNote ? `
          <div class="arrangement-inspector-grid compact-grid">
            <label class="field">
              <span>Lane</span>
              <select data-instrument-note-field="row">
                ${rows.map((row) => `<option value="${escapeHtml(row.id)}" ${selectedNote.row === row.id ? "selected" : ""}>${escapeHtml(row.label)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Start step</span>
              <input type="number" min="1" max="${getInstrumentStepCount(track)}" step="${INSTRUMENT_MIN_NOTE_LENGTH}" value="${escapeHtml(formatInstrumentStepValue(selectedNote.start + 1))}" data-instrument-note-field="start" />
            </label>
            <label class="field">
              <span>Length</span>
              <input type="number" min="${INSTRUMENT_MIN_NOTE_LENGTH}" max="${getInstrumentStepCount(track)}" step="${INSTRUMENT_MIN_NOTE_LENGTH}" value="${escapeHtml(formatInstrumentStepValue(selectedNote.length))}" data-instrument-note-field="length" />
            </label>
            <label class="field">
              <span>Velocity</span>
              <input type="range" min="1" max="127" step="1" value="${escapeHtml(String(selectedNote.velocity || 96))}" data-instrument-note-field="velocity" />
              <strong>${escapeHtml(String(selectedNote.velocity || 96))}</strong>
            </label>
          </div>
          <div class="button-row field-wide">
            <button type="button" class="button-ghost" data-instrument-note-action="left">Nudge Left</button>
            <button type="button" class="button-ghost" data-instrument-note-action="right">Nudge Right</button>
            <button type="button" class="button-ghost" data-instrument-note-action="shorter">Shorter</button>
            <button type="button" class="button-ghost" data-instrument-note-action="longer">Longer</button>
            <button type="button" class="button-tertiary" data-instrument-note-action="delete">Delete Note</button>
          </div>
        ` : `
          <p>Click any note block to edit it here. Shift or Ctrl/Cmd click adds more notes to the selection so you can nudge or resize them together.</p>
        `}
      </div>
      <div class="button-row field-wide">
        <button type="button" class="button-tertiary" data-instrument-track-action="clear" data-instrument-track-id="${escapeHtml(track.id)}">Clear Pattern</button>
        <button type="button" class="button-tertiary" data-instrument-track-action="duplicate" data-instrument-track-id="${escapeHtml(track.id)}">Duplicate</button>
        <button type="button" class="button-tertiary" data-instrument-track-action="remove" data-instrument-track-id="${escapeHtml(track.id)}">Remove</button>
      </div>
    </div>
  `;
}

function renderInstrumentDeck() {
  if (!getSelectedInstrumentTrack() && instrumentTracks.length) {
    selectedInstrumentTrackId = instrumentTracks[0].id;
  }
  renderInstrumentTemplatePalette();
  const selectedTrack = getSelectedInstrumentTrack();
  if (selectedTrack) {
    instrumentEditCursorStep = Math.max(0, Math.min(getInstrumentStepCount(selectedTrack) - 1, Number(instrumentEditCursorStep || 0)));
  } else {
    instrumentEditCursorStep = 0;
  }
  if (selectedInstrumentNote && selectedInstrumentNote.trackId !== selectedInstrumentTrackId) {
    clearSelectedInstrumentNotes();
  }
  syncSelectedInstrumentNotes();
  syncInstrumentInputControls();
  syncInstrumentDeckMeta();
  renderInstrumentTrackList();
  renderInstrumentGrid();
  renderInstrumentVelocityLane();
  renderInstrumentInspector();
  if (instrumentUndoButton) {
    instrumentUndoButton.disabled = instrumentHistoryIndex <= 0;
  }
  if (instrumentRedoButton) {
    instrumentRedoButton.disabled = instrumentHistoryIndex >= instrumentHistory.length - 1;
  }
  if (instrumentCopyButton) {
    instrumentCopyButton.disabled = !getSelectedInstrumentNoteStates(selectedInstrumentTrackId).length;
  }
  if (instrumentDuplicateButton) {
    instrumentDuplicateButton.disabled = !getSelectedInstrumentNoteStates(selectedInstrumentTrackId).length;
  }
  if (instrumentPasteButton) {
    instrumentPasteButton.disabled = !(getSelectedInstrumentTrack() && instrumentClipboard?.notes?.length);
  }
  if (instrumentLoopSelectionButton) {
    instrumentLoopSelectionButton.disabled = !(selectedTrack && ((selectedTrack.notes || []).length));
  }
  if (instrumentClearLoopButton) {
    instrumentClearLoopButton.disabled = !instrumentLoopEnabled;
  }
  if (instrumentQuantizeButton) {
    instrumentQuantizeButton.disabled = !(selectedTrack && ((selectedTrack.notes || []).length));
  }
  if (instrumentHumanizeButton) {
    instrumentHumanizeButton.disabled = !(selectedTrack && ((selectedTrack.notes || []).length));
  }
  recordInstrumentHistoryIfNeeded();
}

function addInstrumentTrack(overrides = {}) {
  const track = createInstrumentTrack(overrides);
  instrumentTracks.push(track);
  selectedInstrumentTrackId = track.id;
  clearSelectedInstrumentNotes();
  renderInstrumentDeck();
  return track;
}

function addInstrumentTemplate(templateId = "keys") {
  const preset = getInstrumentTemplatePreset(templateId);
  addInstrumentTrack({ role: preset.role, template_id: preset.template });
  setForgePane("instrument");
  setStatus(`Added ${preset.label} to the Instrument Deck.`);
}

function getAudioContext() {
  if (instrumentTransport.context) return instrumentTransport.context;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("This desktop runtime does not expose Web Audio, so local instrument playback is unavailable here.");
  }
  instrumentTransport.context = new AudioCtx();
  return instrumentTransport.context;
}

function getNoiseBuffer(context) {
  if (instrumentTransport.noiseBuffer) return instrumentTransport.noiseBuffer;
  const buffer = context.createBuffer(1, context.sampleRate * 0.35, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2) - 1;
  }
  instrumentTransport.noiseBuffer = buffer;
  return buffer;
}

function triggerNoiseBurst(context, time, duration, volume, highpassFreq = 1800) {
  const noise = context.createBufferSource();
  noise.buffer = getNoiseBuffer(context);
  const filter = context.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(highpassFreq, time);
  const gain = context.createGain();
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  noise.connect(filter).connect(gain).connect(context.destination);
  noise.start(time);
  noise.stop(time + duration);
}

function triggerDrumHit(context, voice, time, volume) {
  if (voice === "kick") {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.18);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    osc.connect(gain).connect(context.destination);
    osc.start(time);
    osc.stop(time + 0.22);
    return;
  }
  if (voice === "snare" || voice === "clap") {
    triggerNoiseBurst(context, time, 0.16, volume * 0.8, voice === "clap" ? 1400 : 1800);
    return;
  }
  if (voice === "rim") {
    triggerNoiseBurst(context, time, 0.05, volume * 0.32, 2600);
    return;
  }
  if (voice === "shaker") {
    triggerNoiseBurst(context, time, 0.1, volume * 0.36, 5200);
    return;
  }
  if (voice === "hat-closed" || voice === "hat-open" || voice === "crash") {
    triggerNoiseBurst(context, time, voice === "hat-open" ? 0.22 : voice === "crash" ? 0.42 : 0.08, volume * 0.5, 4000);
    return;
  }
  if (voice === "perc") {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, time);
    osc.frequency.exponentialRampToValueAtTime(170, time + 0.1);
    gain.gain.setValueAtTime(volume * 0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    osc.connect(gain).connect(context.destination);
    osc.start(time);
    osc.stop(time + 0.14);
    return;
  }
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, time);
  osc.frequency.exponentialRampToValueAtTime(100, time + 0.12);
  gain.gain.setValueAtTime(volume * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
  osc.connect(gain).connect(context.destination);
  osc.start(time);
  osc.stop(time + 0.18);
}

function getInstrumentSynthProfile(track = {}) {
  const role = `${track.role || ""}`.toLowerCase();
  const type = `${track.synth_type || "triangle"}`.toLowerCase();
  const baseProfile = {
    attack: 0.008,
    decay: 0.14,
    sustain: 0.42,
    release: 0.16,
    filterType: "lowpass",
    filterFrequency: role === "bass" || role === "sub" ? 520 : role === "pad" || role === "strings" || role === "choir" ? 1400 : 2600,
    filterQ: 0.8,
    voices: [{ type: "triangle", gain: 1 }],
    noiseAmount: 0,
    noiseHighpass: 2600,
  };
  if (type === "sine" || type === "triangle" || type === "square" || type === "sawtooth") {
    return { ...baseProfile, voices: [{ type, gain: 1 }] };
  }
  if (type === "pulse") {
    return { ...baseProfile, voices: [{ type: "square", gain: 0.72 }, { type: "square", gain: 0.3, detune: 8 }], filterFrequency: 2100, filterQ: 1.2 };
  }
  if (type === "supersaw") {
    return {
      ...baseProfile,
      attack: 0.012,
      decay: 0.16,
      sustain: 0.48,
      release: 0.22,
      filterFrequency: 2400,
      voices: [
        { type: "sawtooth", gain: 0.48, detune: -14 },
        { type: "sawtooth", gain: 0.36, detune: 0 },
        { type: "sawtooth", gain: 0.48, detune: 14 },
      ],
    };
  }
  if (type === "fm-bass") {
    return {
      ...baseProfile,
      attack: 0.004,
      decay: 0.12,
      sustain: 0.34,
      release: 0.18,
      filterFrequency: 620,
      voices: [
        { type: "sine", gain: 0.82 },
        { type: "triangle", gain: 0.22, multiplier: 0.5 },
        { type: "square", gain: 0.08, multiplier: 2 },
      ],
    };
  }
  if (type === "pluck") {
    return {
      ...baseProfile,
      attack: 0.003,
      decay: 0.09,
      sustain: 0.18,
      release: 0.1,
      filterFrequency: 1900,
      filterQ: 1.8,
      voices: [
        { type: "triangle", gain: 0.65 },
        { type: "sawtooth", gain: 0.22, detune: 5 },
      ],
    };
  }
  if (type === "bell") {
    return {
      ...baseProfile,
      attack: 0.002,
      decay: 0.28,
      sustain: 0.08,
      release: 0.22,
      filterType: "bandpass",
      filterFrequency: 2600,
      filterQ: 1.6,
      voices: [
        { type: "sine", gain: 0.75 },
        { type: "triangle", gain: 0.22, multiplier: 2.01 },
        { type: "sine", gain: 0.16, multiplier: 4.03 },
      ],
    };
  }
  if (type === "organ") {
    return {
      ...baseProfile,
      attack: 0.01,
      decay: 0.08,
      sustain: 0.78,
      release: 0.2,
      filterFrequency: 1800,
      voices: [
        { type: "sine", gain: 0.62 },
        { type: "square", gain: 0.16, multiplier: 2 },
        { type: "triangle", gain: 0.18, multiplier: 1.5 },
      ],
    };
  }
  if (type === "warm-pad") {
    return {
      ...baseProfile,
      attack: 0.08,
      decay: 0.22,
      sustain: 0.58,
      release: 0.34,
      filterFrequency: 1200,
      voices: [
        { type: "triangle", gain: 0.34, detune: -7 },
        { type: "sine", gain: 0.28 },
        { type: "triangle", gain: 0.34, detune: 7 },
      ],
    };
  }
  if (type === "brass") {
    return {
      ...baseProfile,
      attack: 0.016,
      decay: 0.14,
      sustain: 0.46,
      release: 0.18,
      filterFrequency: 1600,
      filterQ: 1.1,
      voices: [
        { type: "sawtooth", gain: 0.46, detune: -4 },
        { type: "sawtooth", gain: 0.46, detune: 4 },
        { type: "square", gain: 0.12 },
      ],
    };
  }
  if (type === "choir") {
    return {
      ...baseProfile,
      attack: 0.06,
      decay: 0.24,
      sustain: 0.54,
      release: 0.3,
      filterType: "bandpass",
      filterFrequency: 1500,
      filterQ: 1.2,
      voices: [
        { type: "triangle", gain: 0.42 },
        { type: "sine", gain: 0.24, multiplier: 2 },
        { type: "triangle", gain: 0.18, detune: 6 },
      ],
    };
  }
  if (type === "flute") {
    return {
      ...baseProfile,
      attack: 0.028,
      decay: 0.12,
      sustain: 0.5,
      release: 0.18,
      filterFrequency: 2200,
      voices: [
        { type: "sine", gain: 0.72 },
        { type: "triangle", gain: 0.16, multiplier: 2 },
      ],
      noiseAmount: 0.04,
      noiseHighpass: 4200,
    };
  }
  if (type === "shimmer") {
    return {
      ...baseProfile,
      attack: 0.01,
      decay: 0.18,
      sustain: 0.2,
      release: 0.22,
      filterType: "highpass",
      filterFrequency: 1800,
      voices: [
        { type: "sine", gain: 0.52 },
        { type: "triangle", gain: 0.22, multiplier: 2.01 },
        { type: "sine", gain: 0.12, multiplier: 4.03 },
      ],
      noiseAmount: 0.08,
      noiseHighpass: 4800,
    };
  }
  return baseProfile;
}

function createInstrumentVoiceBank(context, track, frequency, startTime) {
  const profile = getInstrumentSynthProfile(track);
  const sourceMix = context.createGain();
  sourceMix.gain.setValueAtTime(1, startTime);
  const filter = context.createBiquadFilter();
  filter.type = profile.filterType || "lowpass";
  filter.frequency.setValueAtTime(profile.filterFrequency || 2200, startTime);
  filter.Q.setValueAtTime(profile.filterQ || 0.8, startTime);
  sourceMix.connect(filter);
  const cleanup = [];

  (profile.voices || [{ type: "triangle", gain: 1 }]).forEach((voice) => {
    const oscillator = context.createOscillator();
    const voiceGain = context.createGain();
    oscillator.type = voice.type || "triangle";
    oscillator.frequency.setValueAtTime(frequency * Number(voice.multiplier || 1), startTime);
    oscillator.detune.setValueAtTime(Number(voice.detune || 0), startTime);
    voiceGain.gain.setValueAtTime(Number(voice.gain ?? 1), startTime);
    oscillator.connect(voiceGain).connect(sourceMix);
    oscillator.start(startTime);
    cleanup.push((stopTime) => oscillator.stop(stopTime));
  });

  if (profile.noiseAmount > 0) {
    const noise = context.createBufferSource();
    noise.buffer = getNoiseBuffer(context);
    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(profile.noiseHighpass || 3200, startTime);
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(profile.noiseAmount, startTime);
    noise.connect(noiseFilter).connect(noiseGain).connect(sourceMix);
    noise.start(startTime);
    cleanup.push((stopTime) => noise.stop(stopTime));
  }

  return {
    profile,
    output: filter,
    stop(stopTime) {
      cleanup.forEach((release) => {
        try {
          release(stopTime);
        } catch (error) {
          // Ignore stop races during rapid live audition.
        }
      });
    },
  };
}

function triggerSynthHit(context, track, row, time, duration, velocityMultiplier = 1) {
  const frequency = row.midi ? 440 * (2 ** ((row.midi - 69) / 12)) : 220;
  const voice = createInstrumentVoiceBank(context, track, frequency, time);
  const gain = context.createGain();
  const scaledVolume = Number(track.volume || 0.6) * Math.max(0.12, velocityMultiplier);
  const peakGain = Math.max(0.001, scaledVolume * 0.24);
  const sustainGain = Math.max(0.0004, peakGain * voice.profile.sustain);
  const attackEnd = time + voice.profile.attack;
  const decayEnd = Math.min(time + duration, attackEnd + voice.profile.decay);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peakGain, attackEnd);
  gain.gain.exponentialRampToValueAtTime(sustainGain, Math.max(attackEnd + 0.01, decayEnd));
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + voice.profile.release);
  voice.output.connect(gain).connect(context.destination);
  voice.stop(time + duration + voice.profile.release + 0.04);
}

function startInstrumentHold(context, track, row, velocityMultiplier = 1) {
  const frequency = row.midi ? 440 * (2 ** ((row.midi - 69) / 12)) : 220;
  const time = context.currentTime + 0.01;
  const voice = createInstrumentVoiceBank(context, track, frequency, time);
  const gain = context.createGain();
  const scaledVolume = Number(track.volume || 0.6) * Math.max(0.12, velocityMultiplier);
  const peakGain = Math.max(0.001, scaledVolume * 0.2);
  const sustainGain = Math.max(0.0008, peakGain * voice.profile.sustain);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + voice.profile.attack);
  gain.gain.exponentialRampToValueAtTime(sustainGain, time + voice.profile.attack + voice.profile.decay);
  voice.output.connect(gain).connect(context.destination);
  return () => {
    const releaseTime = context.currentTime;
    try {
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setValueAtTime(Math.max(0.0008, gain.gain.value || sustainGain), releaseTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + voice.profile.release);
      voice.stop(releaseTime + voice.profile.release + 0.04);
    } catch (error) {
      voice.stop(releaseTime + 0.08);
    }
  };
}

function commitHeldInstrumentRecording(held, { forceEndTick = null } = {}) {
  if (!held?.recordOnRelease) return false;
  const track = instrumentTracks.find((item) => item.id === held.trackId);
  if (!track) return false;
  const totalSteps = getInstrumentStepCount(track);
  const startTick = clampInstrumentNoteStart(
    Number.isFinite(Number(held.startTick)) ? Number(held.startTick) : held.startStep,
    totalSteps,
  );
  const hasForcedEndTick = forceEndTick !== null && forceEndTick !== undefined && Number.isFinite(Number(forceEndTick));
  const rawEndTick = hasForcedEndTick
    ? Number(forceEndTick)
    : instrumentTransport.playing
      ? getCurrentTransportTrackStep(track)
      : startTick;
  const normalizedEndTick = normalizeInstrumentStepValue(rawEndTick, startTick);
  const endTick = normalizedEndTick < startTick ? totalSteps : normalizedEndTick;
  const finalLength = clampInstrumentNoteLength(
    Math.max(INSTRUMENT_MIN_NOTE_LENGTH, endTick - startTick),
    startTick,
    totalSteps,
  );
  upsertInstrumentNote(track.id, held.rowId, startTick, finalLength, held.velocity || 112);
  instrumentEditCursorStep = Math.max(0, Math.min(totalSteps - 1, Math.floor(startTick + finalLength)));
  return true;
}

function stopHeldInstrumentInput(key = "", { commitRecording = true, forceEndTick = null } = {}) {
  const normalizedKey = `${key || ""}`.toLowerCase();
  const held = instrumentHeldInputs.get(normalizedKey);
  if (!held) return { released: false, recorded: false };
  instrumentHeldInputs.delete(normalizedKey);
  const recorded = commitRecording ? commitHeldInstrumentRecording(held, { forceEndTick }) : false;
  try {
    held.release?.();
  } catch (error) {
    // Ignore release cleanup failures; the next key press recreates the node.
  }
  return { released: true, recorded };
}

function stopAllHeldInstrumentInputs({ commitRecordings = true, forceEndTick = null } = {}) {
  let recordedAny = false;
  Array.from(instrumentHeldInputs.keys()).forEach((key) => {
    const result = stopHeldInstrumentInput(key, { commitRecording: commitRecordings, forceEndTick });
    recordedAny = recordedAny || Boolean(result?.recorded);
  });
  return recordedAny;
}

function getInstrumentKeyboardRow(track, key = "") {
  const normalizedKey = `${key || ""}`.toLowerCase();
  if (!normalizedKey || normalizedKey.length !== 1) return null;
  const rows = getInstrumentRows(track);
  if (isDrumInstrumentRole(track.role)) {
    const drumIndex = INSTRUMENT_DRUM_KEYBOARD.indexOf(normalizedKey);
    return drumIndex >= 0 ? rows[drumIndex] || null : null;
  }
  const melodicIndex = INSTRUMENT_MELODIC_KEYBOARD.indexOf(normalizedKey);
  if (melodicIndex === -1) return null;
  const playableRows = [...rows].reverse();
  return playableRows[melodicIndex] || null;
}

function recordInstrumentKeyboardNote(track, row, { startStep = null, stepLength = null } = {}) {
  const steps = getInstrumentStepCount(track);
  const resolvedStartStep = clampInstrumentNoteStart(
    startStep === null
      ? (
        instrumentTransport.playing
          ? getCurrentTransportTrackStep(track)
          : getInstrumentCursorStep(track)
      )
      : Number(startStep || 0),
    steps,
  );
  const resolvedLength = clampInstrumentNoteLength(
    Number(stepLength || instrumentInputStepLength),
    resolvedStartStep,
    steps,
  );
  selectedInstrumentTrackId = track.id;
  upsertInstrumentNote(track.id, row.id, resolvedStartStep, resolvedLength, 104);
  instrumentEditCursorStep = Math.floor((resolvedStartStep + resolvedLength) % steps);
}

async function handleInstrumentKeyboardInput(key, { repeat = false } = {}) {
  if (!instrumentKeyboardMode) return false;
  const track = getSelectedInstrumentTrack();
  if (!track) {
    setStatus("Select an instrument track before using live keys.");
    return false;
  }
  const row = getInstrumentKeyboardRow(track, key);
  if (!row) return false;
  const context = await ensureInstrumentAudioContext();
  const normalizedKey = `${key || ""}`.toLowerCase();
  const isDrumTrack = isDrumInstrumentRole(track.role);
  if (isDrumInstrumentRole(track.role)) {
    if (!repeat) {
      triggerDrumHit(context, row.voice, context.currentTime + 0.01, Number(track.volume || 0.8));
    }
  } else if (!repeat && !instrumentHeldInputs.has(normalizedKey)) {
    const noteStart = instrumentTransport.playing
      ? getCurrentTransportTrackStep(track)
      : getInstrumentCursorStep(track);
    instrumentHeldInputs.set(normalizedKey, {
      release: startInstrumentHold(context, track, row, 0.9),
      trackId: track.id,
      rowId: row.id,
      startStep: noteStart,
      startTick: noteStart,
      velocity: 112,
      recordOnRelease: Boolean(instrumentRecordMode && instrumentTransport.playing),
    });
  }
  if (instrumentRecordMode && !repeat) {
    if (isDrumTrack) {
      const drumStartStep = instrumentTransport.playing
        ? Math.floor(getCurrentTransportTrackStep(track))
        : getInstrumentCursorStep(track);
      recordInstrumentKeyboardNote(track, row, { startStep: drumStartStep, stepLength: 1 });
    } else if (!instrumentTransport.playing) {
      recordInstrumentKeyboardNote(track, row);
    }
    renderInstrumentDeck();
    scheduleAutosave();
  }
  return true;
}

function triggerInstrumentStep(track, step, baseTime = null) {
  if (track.mute) return;
  const context = getAudioContext();
  const stepDuration = getInstrumentStepDurationSeconds();
  const rows = getInstrumentRows(track);
  const stepStart = Number(step || 0);
  const stepEnd = stepStart + 1;
  const activeNotes = (track.notes || []).filter((note) => note.start >= stepStart && note.start < stepEnd);
  const startTime = Number.isFinite(Number(baseTime)) ? Number(baseTime) : context.currentTime + 0.035;
  activeNotes.forEach((note) => {
    const row = rows.find((entry) => entry.id === note.row);
    if (!row) return;
    const velocityMultiplier = Math.max(0.12, Math.min(1, Number(note.velocity || 96) / 127));
    const noteOffset = Math.max(0, note.start - stepStart) * stepDuration;
    const scheduledTime = startTime + noteOffset;
    if (isDrumInstrumentRole(track.role)) {
      triggerDrumHit(context, row.voice, scheduledTime, Number(track.volume || 0.8) * velocityMultiplier);
      return;
    }
    triggerSynthHit(
      context,
      track,
      row,
      scheduledTime,
      Math.max(stepDuration * INSTRUMENT_MIN_NOTE_LENGTH * 0.92, stepDuration * note.length * 0.92),
      velocityMultiplier,
    );
  });
}

function setInstrumentAuditionState(label = "", durationMs = 0) {
  instrumentAuditionState = {
    activeUntil: durationMs > 0 ? performance.now() + durationMs : 0,
    label: label || "",
  };
  if (instrumentAuditionTimer) {
    window.clearTimeout(instrumentAuditionTimer);
    instrumentAuditionTimer = null;
  }
  if (durationMs > 0) {
    instrumentAuditionTimer = window.setTimeout(() => {
      instrumentAuditionState = { activeUntil: 0, label: "" };
      instrumentAuditionTimer = null;
      if (!instrumentTransport.playing) {
        renderInstrumentDeck();
      }
    }, durationMs + 180);
  }
}

function playInstrumentFallbackPreview(track, context) {
  if (!track || track.mute) return false;
  const startTime = context.currentTime + 0.05;
  const stepDuration = getInstrumentStepDurationSeconds();
  const rows = getInstrumentRows(track);
  if (!rows.length) return false;

  if (isDrumInstrumentRole(track.role)) {
    const byVoice = new Map(rows.map((row) => [row.voice, row]));
    const kick = byVoice.get("kick") || rows[0];
    const snare = byVoice.get("snare") || byVoice.get("clap") || rows[Math.min(1, rows.length - 1)];
    const hat = byVoice.get("hat-closed") || byVoice.get("shaker") || rows[Math.min(2, rows.length - 1)];
    [
      { row: kick, offset: 0, volume: 1.0 },
      { row: hat, offset: 0.5, volume: 0.62 },
      { row: snare, offset: 1, volume: 0.82 },
      { row: hat, offset: 1.5, volume: 0.58 },
      { row: kick, offset: 2, volume: 0.96 },
      { row: hat, offset: 2.5, volume: 0.62 },
      { row: snare, offset: 3, volume: 0.78 },
      { row: hat, offset: 3.5, volume: 0.56 },
    ].forEach((hit) => {
      if (!hit.row) return;
      triggerDrumHit(
        context,
        hit.row.voice,
        startTime + (hit.offset * stepDuration),
        Number(track.volume || 0.8) * hit.volume,
      );
    });
    return true;
  }

  const playableRows = [...rows].reverse();
  const centerIndex = Math.max(0, Math.min(playableRows.length - 1, Math.floor(playableRows.length * 0.45)));
  const indexPattern = [0, 2, 4, 2, 5, 4, 2, 0];
  indexPattern.forEach((indexOffset, stepIndex) => {
    const row = playableRows[Math.max(0, Math.min(playableRows.length - 1, centerIndex + indexOffset))] || playableRows[centerIndex];
    if (!row) return;
    triggerSynthHit(
      context,
      track,
      row,
      startTime + (stepIndex * stepDuration * 0.5),
      stepDuration * 0.42,
      1.15,
    );
  });
  return true;
}

function stopInstrumentPlayback() {
  const flushedRecording = stopAllHeldInstrumentInputs({
    commitRecordings: true,
  });
  if (instrumentTransport.timer) {
    window.clearInterval(instrumentTransport.timer);
    instrumentTransport.timer = null;
  }
  if (instrumentTransport.step >= 0) {
    instrumentEditCursorStep = instrumentTransport.step;
  }
  instrumentTransport.playing = false;
  instrumentTransport.step = -1;
  instrumentTransport.transportTick = -1;
  instrumentTransport.startAbsoluteStep = 0;
  instrumentTransport.startContextTime = 0;
  instrumentTransport.stepDurationSec = 0;
  instrumentTransport.loopLength = 0;
  instrumentTransport.loopStart = 0;
  setInstrumentAuditionState();
  document.body.dataset.instrumentPlaying = "false";
  document.body.dataset.instrumentStep = "";
  renderInstrumentDeck();
  if (flushedRecording) {
    scheduleAutosave();
  }
}

async function startInstrumentPlayback() {
  if (!instrumentTracks.length) {
    setStatus("Add an instrument track first.");
    return;
  }
  const selectedTrack = getSelectedInstrumentTrack() || instrumentTracks[0];
  if (!selectedTrack) {
    setStatus("Add an instrument track first.");
    return;
  }
  const context = await ensureInstrumentAudioContext();
  const audibleTracks = instrumentTracks.filter((track) => !track.mute && (track.notes || []).length);
  if (!audibleTracks.length) {
    if (selectedTrack.mute) {
      setStatus(`${selectedTrack.label || "The selected track"} is muted. Unmute it or choose another lane to hear the preview.`);
      return;
    }
    const auditionDurationMs = playInstrumentFallbackPreview(selectedTrack, context);
    if (auditionDurationMs) {
      setInstrumentAuditionState(`Auditioning ${selectedTrack.label || "selected track"}`, Math.max(auditionDurationMs, 1600));
      setStatus(`No notes yet, so Astral is auditioning ${selectedTrack.label || "the selected track"}. Draw or record notes to preview a real loop.`);
    } else {
      setInstrumentAuditionState();
      setStatus("No notes yet. Draw or record a phrase before previewing the loop.");
    }
    renderInstrumentDeck();
    return;
  }
  setInstrumentAuditionState();
  stopInstrumentPlayback();
  const stepDurationSec = getInstrumentStepDurationSeconds();
  const stepDurationMs = stepDurationSec * 1000;
  const previewLeadTrack = (!selectedTrack.mute && (selectedTrack.notes || []).length)
    ? selectedTrack
    : audibleTracks[0];
  const loopRegion = getInstrumentLoopRegion(previewLeadTrack);
  const maxTrackLength = Math.max(...instrumentTracks.map((track) => getInstrumentStepCount(track)));
  const loopStart = loopRegion?.enabled ? loopRegion.start : 0;
  const loopLength = loopRegion?.enabled ? loopRegion.length : maxTrackLength;
  const requestedStart = Math.max(0, Number(instrumentEditCursorStep || 0));
  const startStep = loopRegion?.enabled && (requestedStart < loopStart || requestedStart >= loopStart + loopLength)
    ? loopStart
    : Math.max(loopStart, Math.min(loopStart + loopLength - 1, requestedStart));
  const startTime = context.currentTime + 0.05;
  instrumentTransport.playing = true;
  instrumentTransport.step = startStep;
  instrumentTransport.transportTick = startStep;
  instrumentTransport.startAbsoluteStep = startStep;
  instrumentTransport.startContextTime = startTime;
  instrumentTransport.stepDurationSec = stepDurationSec;
  instrumentTransport.loopLength = loopLength;
  instrumentTransport.loopStart = loopStart;
  instrumentTransport.context = context;
  document.body.dataset.instrumentPlaying = "true";
  document.body.dataset.instrumentStep = `${startStep}`;
  instrumentTracks.forEach((track) => triggerInstrumentStep(track, startStep % getInstrumentStepCount(track), startTime));
  renderInstrumentDeck();
  setStatus(`Previewing ${previewLeadTrack?.label || "the current pattern"}${loopRegion?.enabled ? " inside the selected loop." : "."}`);
  instrumentTransport.timer = window.setInterval(() => {
    instrumentTransport.transportTick = getCurrentTransportAbsoluteStep();
    const loopEnd = loopStart + loopLength;
    instrumentTransport.step += 1;
    if (instrumentTransport.step >= loopEnd) {
      instrumentTransport.step = loopStart;
    }
    document.body.dataset.instrumentStep = `${instrumentTransport.step}`;
    instrumentTracks.forEach((track) => {
      const trackStep = instrumentTransport.step % getInstrumentStepCount(track);
      triggerInstrumentStep(track, trackStep);
    });
    renderInstrumentDeck();
  }, stepDurationMs);
}

function beginInstrumentDraw(trackId, rowId, step, pointerId = null) {
  clearSelectedInstrumentNotes();
  instrumentDrawState = {
    trackId,
    rowId,
    startStep: step,
    currentStep: step,
    pointerId,
  };
  selectedInstrumentTrackId = trackId;
  renderInstrumentDeck();
}

function updateInstrumentDraw(trackId, rowId, step, pointerId = null) {
  if (!instrumentDrawState) return;
  if (instrumentDrawState.pointerId !== null && pointerId !== null && instrumentDrawState.pointerId !== pointerId) return;
  if (instrumentDrawState.trackId !== trackId || instrumentDrawState.rowId !== rowId) return;
  instrumentDrawState.currentStep = step;
  renderInstrumentDeck();
}

function commitInstrumentDraw() {
  if (!instrumentDrawState) return false;
  const { trackId, rowId, startStep, currentStep } = instrumentDrawState;
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track) {
    instrumentDrawState = null;
    return false;
  }
  const totalSteps = getInstrumentStepCount(track);
  const rangeStart = clampInstrumentNoteStart(Math.min(startStep, currentStep), totalSteps);
  const rangeEnd = snapInstrumentGridPosition(Math.max(startStep, currentStep), { maxStart: totalSteps - INSTRUMENT_MIN_NOTE_LENGTH });
  const rangeLength = clampInstrumentNoteLength(
    (rangeEnd - rangeStart) + INSTRUMENT_MIN_NOTE_LENGTH,
    rangeStart,
    totalSteps,
  );
  upsertInstrumentNote(trackId, rowId, rangeStart, rangeLength, 96);
  instrumentEditCursorStep = Math.min(getInstrumentStepCount(track) - 1, Math.ceil(rangeStart + rangeLength));
  instrumentDrawState = null;
  renderInstrumentDeck();
  return true;
}

function cancelInstrumentDraw() {
  if (!instrumentDrawState) return;
  instrumentDrawState = null;
  renderInstrumentDeck();
}

function applyInstrumentStudioState(state = {}) {
  instrumentTracks = Array.isArray(state.instrument_tracks)
    ? state.instrument_tracks.map((track) => createInstrumentTrack(track))
    : [];
  selectedInstrumentTrackId = state.selected_instrument_track_id || instrumentTracks[0]?.id || "";
  clearSelectedInstrumentNotes();
  setInstrumentZoom(state.instrument_zoom || "medium", { render: false });
  instrumentInputStepLength = normalizeInstrumentInputStepLength(state.instrument_input_step_length || 2);
  instrumentEditCursorStep = Number(state.instrument_edit_cursor_step || 0);
  instrumentLoopEnabled = Boolean(state.instrument_loop_enabled);
  instrumentLoopStart = normalizeInstrumentStepValue(state.instrument_loop_start || 0, 0);
  instrumentLoopLength = Math.max(1, Number(state.instrument_loop_length || 16));
  instrumentQuantizeResolution = normalizeInstrumentQuantizeResolution(state.instrument_quantize_resolution || 0.25);
  instrumentSelectMode = false;
  instrumentKeyboardMode = false;
  instrumentRecordMode = false;
  instrumentClipboard = null;
  resetInstrumentHistory();
}

function pushInstrumentTracksToArrangement() {
  if (!instrumentTracks.length) {
    setStatus("Add instrument tracks before pushing them into Arrangement Deck.");
    return;
  }
  instrumentTracks.forEach((track) => {
    const sectionDefaults = {
      drums: ["prechorus", "chorus", "verse2", "finalchorus"],
      perc: ["intro", "verse1", "prechorus", "bridge", "outro"],
      bass: ["verse1", "prechorus", "chorus", "verse2", "bridge", "finalchorus"],
      sub: ["prechorus", "chorus", "bridge", "finalchorus"],
      keys: ["intro", "verse1", "verse2", "bridge", "outro"],
      piano: ["intro", "verse1", "verse2", "bridge", "outro"],
      epiano: ["verse1", "verse2", "bridge", "outro"],
      organ: ["prechorus", "chorus", "bridge", "finalchorus"],
      synth: ["prechorus", "chorus", "finalchorus"],
      lead: ["prechorus", "chorus", "bridge", "finalchorus"],
      pluck: ["verse1", "prechorus", "verse2", "outro"],
      guitar: ["verse1", "chorus", "verse2", "finalchorus"],
      pad: ["intro", "verse1", "prechorus", "bridge", "outro"],
      strings: ["prechorus", "chorus", "bridge", "finalchorus"],
      brass: ["chorus", "bridge", "finalchorus"],
      choir: ["prechorus", "chorus", "bridge", "finalchorus"],
      bell: ["intro", "verse1", "outro"],
      flute: ["verse1", "verse2", "bridge", "outro"],
      fx: ["intro", "prechorus", "bridge", "outro"],
      arp: ["verse1", "prechorus", "chorus", "finalchorus"],
    };
    const notes = summarizeInstrumentPattern(track);
    const arrangementRole = normalizeInstrumentArrangementRole(track.role);
    const existing = arrangementParts.find((part) => part.label === track.label || part.role === arrangementRole);
    if (existing) {
      existing.texture = `${formatInstrumentSoundLabel(track.synth_type)} ${formatInstrumentRoleLabel(track.role)}`.trim();
      existing.movement = notes;
      if (!existing.sections.length) {
        existing.sections = [...(sectionDefaults[track.role] || ["verse1", "chorus"])];
      }
      return;
    }
    arrangementParts.push(createArrangementPart({
      label: track.label,
      role: arrangementRole,
      texture: `${formatInstrumentSoundLabel(track.synth_type)} ${formatInstrumentRoleLabel(track.role)}`.trim(),
      movement: notes,
      notes: `Pattern sketched in Instrument Deck.`,
      sections: [...(sectionDefaults[track.role] || ["verse1", "chorus"])],
    }));
  });
  if (!selectedArrangementPartId && arrangementParts.length) {
    selectedArrangementPartId = arrangementParts[0].id;
  }
  renderArrangementDeck();
  setStudioPane("songforge");
  setForgePane("arrangement", { focusId: "arrangementDeck" });
  setStatus("Pushed the Instrument Deck into Arrangement Deck.");
}

function readMixPayload() {
  const title = byId("mix_title")?.value.trim() || "";
  const normalizeOutput = Boolean(byId("mix_normalize_output")?.checked);
  const tracks = mixLabTracks
    .map((track) => ({
      path: track.path.trim(),
      label: track.label.trim(),
      role: track.role || "auto",
      gain_db: Number(track.gain_db),
      pan: Number(track.pan),
      mute: Boolean(track.mute),
      solo: Boolean(track.solo),
      start_seconds: Number(track.start_seconds),
      trim_in_seconds: Number(track.trim_in_seconds),
      trim_out_seconds: Number(track.trim_out_seconds),
      fade_in_seconds: Number(track.fade_in_seconds),
      fade_out_seconds: Number(track.fade_out_seconds),
    }))
    .filter((track) => track.path);

  return { title, normalize_output: normalizeOutput, tracks };
}

function applyMixAssistTracks(tracks = []) {
  const nextTracks = tracks.map((track) => {
    const existing = mixLabTracks.find((item) => item.path === track.path && item.label === track.label);
    return createMixTrack({ ...(existing || {}), ...track, id: existing?.id || undefined });
  });
  const preferredId = selectedMixTrackId && nextTracks.some((track) => track.id === selectedMixTrackId)
    ? selectedMixTrackId
    : nextTracks[0]?.id || "";
  mixLabTracks = nextTracks;
  selectedMixTrackId = preferredId;
  renderMixDeck();
}

function renderMixResults(data) {
  const trackList = (data.tracks || [])
    .map((track) => `<li>${escapeHtml(track.label || track.path || "Track")} | ${escapeHtml(track.role || "other")} | ${escapeHtml(String(track.gain_db))} dB | ${escapeHtml(String(track.pan))} pan</li>`)
    .join("");

  mixResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">Mix Bounce</p>
      <h3>${escapeHtml(data.path || "Mixdown ready")}</h3>
      <audio controls preload="none" src="${escapeHtml(data.url)}"></audio>
      <p class="path-row">${escapeHtml(data.path)}</p>
      <p class="result-meta">${escapeHtml(data.summary || "")}</p>
      <p class="result-meta">
        ${escapeHtml(String(data.active_track_count || 0))} active track(s) | ${escapeHtml(String(data.duration_seconds || 0))}s | Peak ${escapeHtml(String(data.peak_after || 0))}
      </p>
      ${trackList ? `<ul class="line-list">${trackList}</ul>` : ""}
      <div class="result-actions">
        <button type="button" class="button-secondary" data-fill-target="split_audio_path" data-fill-value="${escapeHtml(data.path)}">
          Use Mix In Stem Studio
        </button>
        <button type="button" class="button-secondary" data-fill-target="alignment_audio_path" data-fill-value="${escapeHtml(data.path)}">
          Use Mix In Match Lab
        </button>
      </div>
    </article>
  `;
}

function readPayload({ includeStudioState = false } = {}) {
  syncVoicePreview();
  const formData = new FormData(form);
  const payload = {
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
  if (includeStudioState) {
    payload._studio_state = collectStudioState();
  }
  return payload;
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
  if (payload._studio_state) {
    applyArrangementStudioState(payload._studio_state);
    applyInstrumentStudioState(payload._studio_state);
    if (payload._studio_state.forge_pane) {
      forgePane = payload._studio_state.forge_pane;
      document.body.dataset.forgePane = forgePane;
    }
  }

  updateSliderMirrors();
  syncVoicePreview();
  updateComposeButtonLabel();
  syncSelectedCloneProfileMeta();
  syncSelectedVoiceboxProfileMeta();
  syncAliceLabMeta();
  renderArrangementDeck();
  renderInstrumentDeck();
  syncForgeWorkspace();
  isHydrating = false;
}

function storeAutosave() {
  const snapshot = {
    draftName: draftName.value,
    currentDraftId,
    payload: readPayload({ includeStudioState: true }),
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
            <button
              type="button"
              class="button-secondary"
              data-mix-add-path="${escapeHtml(track.path || "")}"
              data-mix-add-label="${escapeHtml(track.label || `Candidate ${track.candidate || ""}`)}"
              data-mix-add-role="${escapeHtml(track.role || "instrumental")}"
            >
              Add To Mix Lab
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
      <button
        type="button"
        class="button-secondary"
        data-mix-add-path="${escapeHtml(track.path)}"
        data-mix-add-label="${escapeHtml(label)}"
        data-mix-add-role="${escapeHtml(track.role || "instrumental")}"
      >
        Add To Mix Lab
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
            <button
              type="button"
              class="button-secondary"
              data-mix-add-path="${escapeHtml(data.vocals.path)}"
              data-mix-add-label="Vocals"
              data-mix-add-role="vocals"
            >
              Add Vocals To Mix Lab
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
            <button
              type="button"
              class="button-secondary"
              data-mix-add-path="${escapeHtml(data.instrumental.path)}"
              data-mix-add-label="Instrumental"
              data-mix-add-role="instrumental"
            >
              Add Instrumental To Mix Lab
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
        <button
          type="button"
          class="button-secondary"
          data-mix-add-path="${escapeHtml(data.path)}"
          data-mix-add-label="Rebuilt mix"
          data-mix-add-role="instrumental"
        >
          Add Rebuilt Mix To Mix Lab
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
        <button
          type="button"
          class="button-secondary"
          data-mix-add-path="${escapeHtml(track.path)}"
          data-mix-add-label="${escapeHtml(data.preview_singer_name || "Voice preview")}"
          data-mix-add-role="vocals"
        >
          Add To Mix Lab
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
        <button
          type="button"
          class="button-secondary"
          data-mix-add-path="${escapeHtml(data.path)}"
          data-mix-add-label="${escapeHtml(data.profile?.name || "Cloned speech")}"
          data-mix-add-role="spoken"
        >
          Add To Mix Lab
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
        <button
          type="button"
          class="button-secondary"
          data-mix-add-path="${escapeHtml(data.path)}"
          data-mix-add-label="${escapeHtml(data.profile?.name || "Alice cue")}"
          data-mix-add-role="spoken"
        >
          Add To Mix Lab
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

let syntheticVoices = [];

function renderSyntheticVoiceResult(voice, message = "Synthetic voice ready.") {
  if (!syntheticVoiceResults || !voice) return;
  const fileName = String(voice.path || "").split(/[\\/]/).pop();
  const audioUrl = fileName ? `/voice-anchors/${encodeURIComponent(fileName)}` : "";
  syntheticVoiceResults.innerHTML = `
    <article class="result-card">
      <p class="section-tag">${escapeHtml(message)}</p>
      <h3>${escapeHtml(voice.name || "Synthetic voice")}</h3>
      <p class="result-meta">${escapeHtml(voice.preset_voice_id || "preset")} · seed ${escapeHtml(String(voice.seed ?? ""))} · ${escapeHtml(voice.language || "en")}</p>
      ${audioUrl ? `<audio controls preload="none" src="${audioUrl}"></audio>` : ""}
      <p class="path-row">${escapeHtml(voice.path || "")}</p>
      <p class="microcopy">${escapeHtml(voice.design_prompt || "")}</p>
    </article>`;
  if (syntheticVoiceMeta) syntheticVoiceMeta.textContent = `${voice.name || "Synthetic voice"} selected · ${voice.preset_voice_id || "preset"}`;
}

function populateSyntheticVoices(voices = []) {
  syntheticVoices = voices.filter((voice) => voice.ready !== false);
  const select = byId("synthetic_voice_id");
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">Select a saved character voice</option>`;
  syntheticVoices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.id || voice.path || "";
    option.textContent = `${voice.name || "Synthetic voice"} · ${voice.preset_voice_id || "preset"}`;
    select.appendChild(option);
  });
  if (current && syntheticVoices.some((voice) => (voice.id || voice.path) === current)) select.value = current;
}

async function loadSyntheticVoices() {
  const data = await fetchJson("/api/synthetic-voices");
  populateSyntheticVoices(data.voices || []);
  return syntheticVoices;
}

function selectedSyntheticVoice() {
  const value = byId("synthetic_voice_id")?.value || "";
  return syntheticVoices.find((voice) => (voice.id || voice.path) === value) || null;
}

async function createSyntheticVoice() {
  const payload = {
    name: byId("synthetic_voice_name").value.trim() || "Synthetic Character",
    design_prompt: byId("synthetic_voice_design").value.trim() || "Warm, clear, curious, luminous, emotionally present",
    seed: Number(byId("synthetic_voice_seed").value || 2718),
    language: byId("vocal_language").value.trim() || "en",
  };
  const data = await fetchJson("/api/synthetic-voices/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await loadSyntheticVoices();
  byId("synthetic_voice_id").value = data.id || "";
  renderSyntheticVoiceResult(data, data.cached ? "Synthetic voice reused." : "Synthetic voice created.");
  setStatus(`${data.name || "Synthetic voice"} is ready.`);
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
    const gpu = data.cuda_available ? data.gpu_name || "CUDA GPU" : "CPU-only mode";
    const aceStep = data.ace_step?.running
      ? `ACE-Step ${data.ace_step.health?.loaded_model || data.ace_step.default_model} online`
      : data.ace_step?.available
        ? "ACE-Step ready"
        : data.ace_step?.requires_cuda && !data.cuda_available
          ? "ACE-Step needs CUDA"
        : "ACE-Step missing";
    const musicgen = data.musicgen?.available
      ? `MusicGen ${data.musicgen.device === "cpu" ? "CPU-ready" : "ready"}`
      : "MusicGen unavailable";
    const ollamaCount = Array.isArray(data.ollama?.available_models) ? data.ollama.available_models.length : 0;
    const ollama = data.ollama?.available
      ? `Ollama ${data.ollama.default_model} ready${ollamaCount ? ` (${ollamaCount} model${ollamaCount === 1 ? "" : "s"})` : ""}`
      : "Astral AI unavailable";
    const stems = data.audio_tools?.available ? `Stem tools on ${data.audio_tools.device}` : "Stem tools unavailable";
    const badge = `${gpu} | ${aceStep} | ${musicgen} | ${ollama} | ${stems}`;
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
      payload: readPayload({ includeStudioState: true }),
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
  if (uiMode === "studio") {
    setStudioPane("outputdeck");
  }
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
    openVoicePreviewWorkspace("voicePreviewResults");
    const autoplayWorked = await tryPlayResultAudio("#voicePreviewResults");
    setStatus(
      autoplayWorked
        ? `Voice preview ready on ${data.device}. Opened Voice Booth and started playback.`
        : `Voice preview ready on ${data.device}. Opened Voice Booth for listening.`,
    );
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

async function runMixAssist() {
  mixAssistButton.disabled = true;
  setToolStatus("Alice is shaping a starting multitrack balance...");
  setMixDeckStatus("Alice Mix Assist is listening to the session.");
  try {
    const payload = readMixPayload();
    if (!payload.tracks.length) {
      throw new Error("Add at least one track to Mix Lab first.");
    }
    const data = await fetchJson("/api/mix/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    applyMixAssistTracks(data.tracks || []);
    mixResults.innerHTML = `
      <article class="result-card">
        <p class="section-tag">Alice Mix Assist</p>
        <h3>Starting mix applied</h3>
        <p class="alignment-summary">${escapeHtml(data.summary || "Alice suggested a starting balance for this session.")}</p>
      </article>
    `;
    setToolStatus("Alice Mix Assist updated the session.");
    setMixDeckStatus("Alice Mix Assist updated the session.");
  } catch (error) {
    showError(mixResults, error.message || "Alice Mix Assist failed.");
    setToolStatus("Alice Mix Assist failed.");
    setMixDeckStatus("Alice Mix Assist failed.");
  } finally {
    mixAssistButton.disabled = false;
  }
}

async function runMixRender() {
  mixRenderButton.disabled = true;
  setToolStatus("Bouncing the Mix Lab session...");
  setMixDeckStatus("Bouncing the current session.");
  try {
    const payload = readMixPayload();
    if (!payload.tracks.length) {
      throw new Error("Add at least one track with a real path before bouncing the mix.");
    }
    const data = await fetchJson("/api/mix/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    renderMixResults(data);
    openMixDeckWorkspace("mixResults");
    await tryPlayResultAudio("#mixResults");
    byId("split_audio_path").value = data.path;
    byId("alignment_audio_path").value = data.path;
    setToolStatus("Mix bounce ready.");
    setMixDeckStatus("Mix bounce ready.");
  } catch (error) {
    showError(mixResults, error.message || "Mix bounce failed.");
    setToolStatus("Mix bounce failed.");
    setMixDeckStatus("Mix bounce failed.");
  } finally {
    mixRenderButton.disabled = false;
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
mixAddTrackButton?.addEventListener("click", () => addMixTrack());
mixQuickAddButton?.addEventListener("click", async () => {
  const path = mixQuickPath?.value?.trim() || "";
  if (!path) {
    setMixDeckStatus("Paste a local audio path before importing a track.");
    return;
  }
  await addTrackToMixLab({ path, label: "", role: "auto" });
  if (mixQuickPath) {
    mixQuickPath.value = "";
  }
});
mixAssistButton?.addEventListener("click", runMixAssist);
mixRenderButton?.addEventListener("click", runMixRender);
arrangementAddPartButton?.addEventListener("click", () => {
  addArrangementTemplate("other");
  setForgePane("arrangement");
  scheduleAutosave();
});
instrumentAddTrackButton?.addEventListener("click", () => {
  addInstrumentTrack();
  setForgePane("instrument");
  scheduleAutosave();
});
instrumentPlayButton?.addEventListener("click", () => {
  startInstrumentPlayback().catch((error) => {
    setStatus(error.message || "Instrument playback failed.");
  });
});
instrumentStopButton?.addEventListener("click", () => {
  stopInstrumentPlayback();
});
instrumentUndoButton?.addEventListener("click", () => {
  if (undoInstrumentHistory()) {
    scheduleAutosave();
    setStatus("Undid the last Instrument Deck change.");
  }
});
instrumentRedoButton?.addEventListener("click", () => {
  if (redoInstrumentHistory()) {
    scheduleAutosave();
    setStatus("Redid the next Instrument Deck change.");
  }
});
instrumentCopyButton?.addEventListener("click", () => {
  if (copySelectedInstrumentNotes()) {
    renderInstrumentDeck();
    setStatus("Copied the selected notes.");
  }
});
instrumentPasteButton?.addEventListener("click", () => {
  if (pasteInstrumentClipboard()) {
    renderInstrumentDeck();
    scheduleAutosave();
    setStatus("Pasted notes into the selected track.");
  }
});
instrumentDuplicateButton?.addEventListener("click", () => {
  if (duplicateSelectedInstrumentNotes()) {
    renderInstrumentDeck();
    scheduleAutosave();
    setStatus("Duplicated the selected notes.");
  }
});
instrumentDrawModeButton?.addEventListener("click", () => {
  setInstrumentInputMode("draw");
  scheduleAutosave();
  setStatus("Draw Notes mode is active. Drag on the grid to sketch notes.");
});
instrumentSelectModeButton?.addEventListener("click", () => {
  setInstrumentInputMode("select");
  scheduleAutosave();
  setStatus("Select Notes mode is active. Drag across the roll or header to gather a phrase.");
});
instrumentKeyboardButton?.addEventListener("click", () => {
  setInstrumentInputMode("keys");
  scheduleAutosave();
  setStatus("Audition Keys mode is active. Play A..J to hear the selected track without writing notes.");
});
instrumentRecordButton?.addEventListener("click", () => {
  setInstrumentInputMode("record");
  scheduleAutosave();
  setStatus("Record Keys mode is active. Press Space to start the loop, then play A..J to capture notes.");
});
instrumentPushArrangementButton?.addEventListener("click", () => {
  pushInstrumentTracksToArrangement();
  scheduleAutosave();
});
instrumentLoopSelectionButton?.addEventListener("click", () => {
  if (setInstrumentLoopFromSelection()) {
    renderInstrumentDeck();
    scheduleAutosave();
    setStatus("Loop region set from the current phrase.");
  }
});
instrumentClearLoopButton?.addEventListener("click", () => {
  clearInstrumentLoopRegion();
  renderInstrumentDeck();
  scheduleAutosave();
  setStatus("Loop region cleared. Preview will use the full pattern.");
});
instrumentQuantizeButton?.addEventListener("click", () => {
  if (quantizeInstrumentNotes()) {
    renderInstrumentDeck();
    scheduleAutosave();
    setStatus("Quantized the current phrase to the selected grid.");
  }
});
instrumentHumanizeButton?.addEventListener("click", () => {
  if (humanizeInstrumentNotes()) {
    renderInstrumentDeck();
    scheduleAutosave();
    setStatus("Humanized timing and velocity for a looser feel.");
  }
});
instrumentInputLengthField?.addEventListener("change", () => {
  instrumentInputStepLength = normalizeInstrumentInputStepLength(instrumentInputLengthField.value);
  renderInstrumentDeck();
  scheduleAutosave();
});
instrumentQuantizeResolutionField?.addEventListener("change", () => {
  instrumentQuantizeResolution = normalizeInstrumentQuantizeResolution(instrumentQuantizeResolutionField.value);
  renderInstrumentDeck();
  scheduleAutosave();
});
instrumentCursorBackButton?.addEventListener("click", () => {
  moveInstrumentEditCursor(-instrumentInputStepLength);
  scheduleAutosave();
});
instrumentCursorForwardButton?.addEventListener("click", () => {
  moveInstrumentEditCursor(instrumentInputStepLength);
  scheduleAutosave();
});

instrumentZoomControls?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-instrument-zoom]");
  if (!button) return;
  setInstrumentZoom(button.dataset.instrumentZoom || "medium");
  scheduleAutosave();
});
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
refreshSyntheticVoicesButton?.addEventListener("click", async () => {
  try {
    await loadSyntheticVoices();
    setStatus("Synthetic voice bank refreshed.");
  } catch (error) {
    showError(syntheticVoiceResults, error.message || "Could not load synthetic voices.");
  }
});
byId("synthetic_voice_id")?.addEventListener("change", () => {
  const voice = selectedSyntheticVoice();
  if (voice) renderSyntheticVoiceResult(voice);
});
previewSyntheticVoiceButton?.addEventListener("click", () => {
  const voice = selectedSyntheticVoice();
  if (!voice) return showError(syntheticVoiceResults, "Choose a synthetic voice first.");
  renderSyntheticVoiceResult(voice, "Synthetic voice preview.");
});
createSyntheticVoiceButton?.addEventListener("click", async () => {
  createSyntheticVoiceButton.disabled = true;
  setStatus("Creating synthetic character voice...");
  try {
    await createSyntheticVoice();
  } catch (error) {
    showError(syntheticVoiceResults, error.message || "Synthetic voice creation failed.");
    setStatus("Synthetic voice creation failed.");
  } finally {
    createSyntheticVoiceButton.disabled = false;
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
railPreviewVoiceButton?.addEventListener("click", () => {
  openVoicePreviewWorkspace("cloneStudio");
  previewVoiceButton.click();
});
railAliceVoiceboxButton?.addEventListener("click", () => {
  setUiMode("studio");
  setStudioPane("songforge", { focusId: "aliceLabResults" });
  setForgePane("alice", { focusId: "aliceLabResults" });
  previewAliceVoiceboxButton?.click();
});
mixTrackList?.addEventListener("click", (event) => {
  const lane = event.target.closest("[data-mix-select-id]");
  if (!lane) return;
  selectMixTrack(lane.dataset.mixSelectId || "");
});
function applyMixInspectorField(target, { live = false } = {}) {
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return false;
  const trackId = target.dataset.mixTrackId;
  const field = target.dataset.mixTrackField;
  if (!trackId || !field) return false;
  const track = mixLabTracks.find((item) => item.id === trackId);
  if (!track) return false;
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    track[field] = target.checked;
  } else if (["gain_db", "pan", "start_seconds", "trim_in_seconds", "trim_out_seconds", "fade_in_seconds", "fade_out_seconds"].includes(field)) {
    track[field] = Number(target.value || 0);
  } else {
    track[field] = target.value;
  }
  if (live) {
    renderMixDeck();
  } else {
    storeMixSession();
  }
  return true;
}
mixInspectorPanel?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
  const field = target.dataset.mixTrackField;
  if (!field) return;
  const isLiveField = ["gain_db", "pan", "start_seconds", "trim_in_seconds", "trim_out_seconds", "fade_in_seconds", "fade_out_seconds"].includes(field)
    || (target instanceof HTMLInputElement && target.type === "checkbox");
  if (!isLiveField) return;
  applyMixInspectorField(target, { live: true });
});
mixInspectorPanel?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
  const applied = applyMixInspectorField(target, { live: true });
  if (!applied) return;
});
byId("mix_title")?.addEventListener("input", () => {
  storeMixSession();
});
byId("mix_normalize_output")?.addEventListener("change", () => {
  storeMixSession();
});
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
  if (modeButton && modeSwitch?.contains(modeButton)) {
    setUiMode(modeButton.dataset.uiMode || "quick");
    return;
  }

  const studioPaneButton = event.target.closest("[data-studio-pane]");
  if (studioPaneButton && studioWorkspaceNav?.contains(studioPaneButton)) {
    setStudioPane(
      studioPaneButton.dataset.studioPane || "songforge",
      { focusId: studioPaneButton.dataset.studioFocus || "" },
    );
    if (studioPaneButton.dataset.forgePaneTarget) {
      setForgePane(
        studioPaneButton.dataset.forgePaneTarget,
        { focusId: studioPaneButton.dataset.studioFocus || studioPaneButton.dataset.forgeFocus || "" },
      );
    }
    return;
  }

  const forgePaneButton = event.target.closest("[data-forge-pane]");
  if (forgePaneButton && forgeRoomNav?.contains(forgePaneButton)) {
    setForgePane(
      forgePaneButton.dataset.forgePane || "blueprint",
      { focusId: forgePaneButton.dataset.forgeFocus || "" },
    );
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

  const mixTrackAction = event.target.closest("[data-mix-track-action]");
  if (mixTrackAction) {
    const trackId = mixTrackAction.dataset.mixTrackId || "";
    const trackIndex = mixLabTracks.findIndex((track) => track.id === trackId);
    if (trackIndex === -1) return;
    if (mixTrackAction.dataset.mixTrackAction === "remove") {
      mixLabTracks.splice(trackIndex, 1);
      if (selectedMixTrackId === trackId) {
        selectedMixTrackId = mixLabTracks[Math.max(0, trackIndex - 1)]?.id || mixLabTracks[0]?.id || "";
      }
      renderMixDeck();
      setMixDeckStatus("Removed that track from Mix Deck.");
    }
    if (mixTrackAction.dataset.mixTrackAction === "duplicate") {
      const source = mixLabTracks[trackIndex];
      addMixTrack({ ...source, id: undefined, label: `${source.label || "Track"} copy` });
      setMixDeckStatus("Duplicated that track inside Mix Deck.");
    }
    if (mixTrackAction.dataset.mixTrackAction === "inspect") {
      inspectMixTrack(trackId)
        .then(() => {
          setMixDeckStatus("Track analysis complete.");
        })
        .catch((error) => {
          showError(mixResults, error.message || "Track analysis failed.");
          setMixDeckStatus("Track analysis failed.");
        });
    }
    return;
  }

  const mixLaneSelect = event.target.closest("[data-mix-select-id]");
  if (mixLaneSelect && !event.target.closest("[data-mix-track-action]")) {
    selectMixTrack(mixLaneSelect.dataset.mixSelectId || "");
    return;
  }

  const mixAddButton = event.target.closest("[data-mix-add-path]");
  if (mixAddButton) {
    addTrackToMixLab({
      path: mixAddButton.dataset.mixAddPath || "",
      label: mixAddButton.dataset.mixAddLabel || "",
      role: mixAddButton.dataset.mixAddRole || "auto",
    });
    return;
  }

  const mixTemplateButton = event.target.closest("[data-mix-template]");
  if (mixTemplateButton) {
    addMixTemplate(mixTemplateButton.dataset.mixTemplate || "other");
    return;
  }

  const arrangementTemplateButton = event.target.closest("[data-arrangement-template]");
  if (arrangementTemplateButton) {
    addArrangementTemplate(arrangementTemplateButton.dataset.arrangementTemplate || "other");
    setForgePane("arrangement");
    scheduleAutosave();
    return;
  }

  const instrumentTemplateButton = event.target.closest("[data-instrument-template]");
  if (instrumentTemplateButton) {
    addInstrumentTemplate(instrumentTemplateButton.dataset.instrumentTemplate || "keys");
    scheduleAutosave();
    return;
  }

  const arrangementSelect = event.target.closest("[data-arrangement-select-id]");
  if (arrangementSelect && arrangementPartList?.contains(arrangementSelect)) {
    selectedArrangementPartId = arrangementSelect.dataset.arrangementSelectId || "";
    renderArrangementDeck();
    scheduleAutosave();
    return;
  }

  const arrangementPartSection = event.target.closest("[data-arrangement-part-section]");
  if (arrangementPartSection) {
    const part = arrangementParts.find((item) => item.id === arrangementPartSection.dataset.arrangementPartId);
    const sectionId = arrangementPartSection.dataset.arrangementPartSection || "";
    if (part && sectionId) {
      if (part.sections.includes(sectionId)) {
        part.sections = part.sections.filter((value) => value !== sectionId);
      } else {
        part.sections = [...part.sections, sectionId];
      }
      selectedArrangementPartId = part.id;
      renderArrangementDeck();
      scheduleAutosave();
    }
    return;
  }

  const instrumentSelect = event.target.closest("[data-instrument-select-id]");
  if (instrumentSelect && instrumentTrackList?.contains(instrumentSelect)) {
    selectedInstrumentTrackId = instrumentSelect.dataset.instrumentSelectId || "";
    instrumentEditCursorStep = getInstrumentCursorStep(getSelectedInstrumentTrack());
    clearSelectedInstrumentNotes();
    renderInstrumentDeck();
    scheduleAutosave();
    return;
  }

  const instrumentNoteBlock = event.target.closest("[data-instrument-note-start]");
  if (instrumentNoteBlock && instrumentGrid?.contains(instrumentNoteBlock)) {
    if (performance.now() < instrumentSuppressClickUntil) {
      return;
    }
    const trackId = instrumentNoteBlock.dataset.instrumentTrackId || "";
    const rowId = instrumentNoteBlock.dataset.instrumentNoteRow || "";
    const start = Number(instrumentNoteBlock.dataset.instrumentNoteStart || 0);
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      toggleSelectedInstrumentNote(trackId, rowId, start);
    } else {
      setSelectedInstrumentNote(trackId, rowId, start);
    }
    instrumentEditCursorStep = start;
    renderInstrumentDeck();
    return;
  }

  const instrumentTrackAction = event.target.closest("[data-instrument-track-action]");
  if (instrumentTrackAction) {
    const trackId = instrumentTrackAction.dataset.instrumentTrackId || "";
    const trackIndex = instrumentTracks.findIndex((track) => track.id === trackId);
    if (trackIndex === -1) return;
    if (instrumentTrackAction.dataset.instrumentTrackAction === "remove") {
      instrumentTracks.splice(trackIndex, 1);
      if (selectedInstrumentTrackId === trackId) {
        selectedInstrumentTrackId = instrumentTracks[Math.max(0, trackIndex - 1)]?.id || instrumentTracks[0]?.id || "";
      }
      if (selectedInstrumentNoteKeys.some((key) => key.startsWith(`${trackId}::`))) {
        clearSelectedInstrumentNotes();
      }
    }
    if (instrumentTrackAction.dataset.instrumentTrackAction === "duplicate") {
      const source = instrumentTracks[trackIndex];
      instrumentTracks.push(createInstrumentTrack({
        ...source,
        id: undefined,
        label: `${source.label || "Track"} copy`,
        notes: [...(source.notes || [])],
      }));
      selectedInstrumentTrackId = instrumentTracks[instrumentTracks.length - 1].id;
    }
    if (instrumentTrackAction.dataset.instrumentTrackAction === "clear") {
      instrumentTracks[trackIndex].notes = [];
      if (selectedInstrumentNoteKeys.some((key) => key.startsWith(`${trackId}::`))) {
        clearSelectedInstrumentNotes();
      }
      selectedInstrumentTrackId = instrumentTracks[trackIndex].id;
    }
    renderInstrumentDeck();
    scheduleAutosave();
    return;
  }

  const arrangementPartAction = event.target.closest("[data-arrangement-part-action]");
  if (arrangementPartAction) {
    const partId = arrangementPartAction.dataset.arrangementPartId || "";
    const partIndex = arrangementParts.findIndex((part) => part.id === partId);
    if (partIndex === -1) return;
    if (arrangementPartAction.dataset.arrangementPartAction === "remove") {
      arrangementParts.splice(partIndex, 1);
      if (selectedArrangementPartId === partId) {
        selectedArrangementPartId = arrangementParts[Math.max(0, partIndex - 1)]?.id || arrangementParts[0]?.id || "";
      }
      renderArrangementDeck();
      scheduleAutosave();
    }
    if (arrangementPartAction.dataset.arrangementPartAction === "duplicate") {
      const source = arrangementParts[partIndex];
      arrangementParts.push(createArrangementPart({
        ...source,
        id: undefined,
        label: `${source.label || "Part"} copy`,
        sections: [...(source.sections || [])],
      }));
      selectedArrangementPartId = arrangementParts[arrangementParts.length - 1].id;
      renderArrangementDeck();
      scheduleAutosave();
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

window.addEventListener("hashchange", () => {
  if (STUDIO_HASHES.has(window.location.hash)) {
    setUiMode("studio");
    const pane = studioPaneFromHash();
    if (pane) {
      setStudioPane(pane, { persist: true });
    }
    const nextForgePane = forgePaneFromHash();
    if (nextForgePane) {
      setForgePane(nextForgePane, { persist: true, focusId: window.location.hash.replace("#", "") });
    }
  }
});

function applyArrangementPartField(target) {
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement) && !(target instanceof HTMLTextAreaElement)) return false;
  const partId = target.dataset.arrangementPartId;
  const field = target.dataset.arrangementPartField;
  if (!partId || !field) return false;
  const part = arrangementParts.find((item) => item.id === partId);
  if (!part) return false;
  part[field] = target.value;
  renderArrangementDeck();
  return true;
}

function applyArrangementSectionField(target) {
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return false;
  const sectionId = target.dataset.arrangementSectionId;
  const field = target.dataset.arrangementSectionField;
  if (!sectionId || !field) return false;
  const section = arrangementSections.find((item) => item.id === sectionId);
  if (!section) return false;
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    section[field] = target.checked;
  } else {
    section[field] = target.value;
  }
  renderArrangementDeck();
  return true;
}

function applyInstrumentTrackField(target) {
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement) && !(target instanceof HTMLTextAreaElement)) return false;
  const trackId = target.dataset.instrumentTrackId;
  const field = target.dataset.instrumentTrackField;
  if (!trackId || !field) return false;
  const track = instrumentTracks.find((item) => item.id === trackId);
  if (!track) return false;

  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    track[field] = target.checked;
  } else if (["volume"].includes(field)) {
    track[field] = Number(target.value || 0);
  } else if (["steps", "base_midi"].includes(field)) {
    track[field] = Number(target.value || 0);
  } else {
    track[field] = target.value;
  }

  if (field === "role") {
    const nextPreset = getInstrumentTemplatePreset(track.role);
    track.template_id = nextPreset.template;
    track.synth_type = nextPreset.synth_type;
    track.base_midi = nextPreset.base_midi;
    track.notes = [];
  }

  if (field === "steps") {
    const stepCount = getInstrumentStepCount(track);
    track.steps = stepCount;
    track.notes = (track.notes || [])
      .filter((note) => note.start < stepCount)
      .map((note) => ({ ...note, length: Math.min(note.length, stepCount - note.start) }));
  }

  renderInstrumentDeck();
  return true;
}

arrangementInspectorPanel?.addEventListener("input", (event) => {
  if (applyArrangementPartField(event.target)) {
    scheduleAutosave();
  }
});

arrangementInspectorPanel?.addEventListener("change", (event) => {
  if (applyArrangementPartField(event.target)) {
    scheduleAutosave();
  }
});

arrangementSectionGrid?.addEventListener("input", (event) => {
  if (applyArrangementSectionField(event.target)) {
    scheduleAutosave();
  }
});

arrangementSectionGrid?.addEventListener("change", (event) => {
  if (applyArrangementSectionField(event.target)) {
    scheduleAutosave();
  }
});

instrumentGrid?.addEventListener("pointerdown", (event) => {
  const noteBlock = event.target.closest("[data-instrument-note-start]");
  if (noteBlock && instrumentGrid.contains(noteBlock)) {
    const trackId = noteBlock.dataset.instrumentTrackId || "";
    const rowId = noteBlock.dataset.instrumentNoteRow || "";
    const start = Number(noteBlock.dataset.instrumentNoteStart || 0);
    const noteKey = getInstrumentNoteKey(trackId, rowId, start);
    if (getInstrumentInputMode() === "select") {
      event.preventDefault();
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        toggleSelectedInstrumentNote(trackId, rowId, start);
        renderInstrumentDeck();
        return;
      }
      setSelectedInstrumentNote(trackId, rowId, start);
      startInstrumentSelectionGesture(trackId, event, { initialKeys: [noteKey] });
      renderInstrumentDeck();
      return;
    }
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }
    event.preventDefault();
    const handle = event.target.closest("[data-instrument-note-handle]")?.dataset.instrumentNoteHandle || "";
    const mode = handle === "left"
      ? "resize-left"
      : handle === "right"
        ? "resize-right"
        : "move";
    startInstrumentNoteGesture(
      mode,
      trackId,
      rowId,
      start,
      Number(noteBlock.dataset.instrumentNoteLength || 1),
      event,
    );
    renderInstrumentDeck();
    return;
  }
  const cell = event.target.closest("[data-instrument-cell-step]");
  if (getInstrumentInputMode() === "select") {
    const rowCanvas = event.target.closest(".instrument-row-canvas[data-instrument-track-id]");
    const fallbackTrackId = rowCanvas?.dataset.instrumentTrackId || selectedInstrumentTrackId || getSelectedInstrumentTrack()?.id || "";
    if (fallbackTrackId && beginInstrumentWorkspaceSelection(event, fallbackTrackId)) {
      return;
    }
  }
  if (!cell) return;
  if (instrumentNoteGesture) return;
  if (getInstrumentInputMode() === "select") {
    if (beginInstrumentWorkspaceSelection(event, cell.dataset.instrumentTrackId || "")) return;
  }
  const pointerTarget = getInstrumentPointerTarget(
    cell.dataset.instrumentTrackId || "",
    event.clientX,
    event.clientY,
  );
  if (!pointerTarget) return;
  event.preventDefault();
  if (typeof cell.setPointerCapture === "function") {
    try {
      cell.setPointerCapture(event.pointerId);
    } catch (error) {
      // Ignore capture failures; drawing still works without it.
    }
  }
  beginInstrumentDraw(
    cell.dataset.instrumentTrackId || "",
    pointerTarget.rowId || cell.dataset.instrumentCellRow || "",
    pointerTarget.position,
    event.pointerId,
  );
});

instrumentGridHeader?.addEventListener("pointerdown", (event) => {
  if (getInstrumentInputMode() !== "select") return;
  beginInstrumentWorkspaceSelection(event);
});

instrumentRollViewport?.addEventListener("pointerdown", (event) => {
  if (getInstrumentInputMode() !== "select") return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  if (target.closest("#instrumentGrid") || target.closest("#instrumentGridHeader")) return;
  beginInstrumentWorkspaceSelection(event);
});

instrumentGrid?.addEventListener("pointermove", (event) => {
  if (instrumentNoteGesture || instrumentSelectionGesture) return;
  if (!instrumentDrawState || event.buttons !== 1) return;
  const cell = event.target.closest("[data-instrument-cell-step]");
  if (!cell) return;
  const pointerTarget = getInstrumentPointerTarget(
    cell.dataset.instrumentTrackId || instrumentDrawState.trackId || "",
    event.clientX,
    event.clientY,
  );
  if (!pointerTarget) return;
  updateInstrumentDraw(
    cell.dataset.instrumentTrackId || instrumentDrawState.trackId || "",
    pointerTarget.rowId || cell.dataset.instrumentCellRow || "",
    pointerTarget.position,
    event.pointerId,
  );
});

instrumentGrid?.addEventListener("pointerup", (event) => {
  if (instrumentNoteGesture) return;
  if (!instrumentDrawState) return;
  const cell = event.target.closest("[data-instrument-cell-step]");
  if (cell) {
    const pointerTarget = getInstrumentPointerTarget(
      cell.dataset.instrumentTrackId || instrumentDrawState.trackId || "",
      event.clientX,
      event.clientY,
    );
    updateInstrumentDraw(
      cell.dataset.instrumentTrackId || instrumentDrawState.trackId || "",
      pointerTarget?.rowId || cell.dataset.instrumentCellRow || "",
      pointerTarget?.position ?? Number(cell.dataset.instrumentCellStep || 0),
      event.pointerId,
    );
  }
  if (commitInstrumentDraw()) {
    scheduleAutosave();
  }
});

document.addEventListener("pointerdown", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const bar = target?.closest?.("[data-instrument-velocity-start]");
  if (!bar) return;
  event.preventDefault();
  const trackId = bar.dataset.instrumentTrackId || "";
  const rowId = bar.dataset.instrumentVelocityRow || "";
  const start = Number(bar.dataset.instrumentVelocityStart || 0);
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    toggleSelectedInstrumentNote(trackId, rowId, start);
  } else {
    setSelectedInstrumentNote(trackId, rowId, start);
  }
  startInstrumentVelocityGesture(trackId, rowId, start, event);
  renderInstrumentDeck();
});

document.addEventListener("pointermove", (event) => {
  if (instrumentSelectionGesture) {
    if (updateInstrumentSelectionGesture(event)) {
      renderInstrumentDeck();
    }
    return;
  }
  if (instrumentVelocityGesture) {
    if (updateInstrumentVelocityGesture(event)) {
      renderInstrumentDeck();
    }
    return;
  }
  if (!instrumentNoteGesture || event.buttons !== 1) return;
  if (updateInstrumentNoteGesture(event)) {
    renderInstrumentDeck();
  }
});

document.addEventListener("pointerup", () => {
  if (commitInstrumentSelectionGesture()) {
    renderInstrumentDeck();
    scheduleAutosave();
    return;
  }
  if (commitInstrumentVelocityGesture()) {
    renderInstrumentDeck();
    scheduleAutosave();
    return;
  }
  if (commitInstrumentNoteGesture()) {
    renderInstrumentDeck();
    scheduleAutosave();
    return;
  }
  if (commitInstrumentDraw()) {
    scheduleAutosave();
  }
});

instrumentInspectorPanel?.addEventListener("input", (event) => {
  const target = event.target;
  if (applyInstrumentTrackField(target)) {
    scheduleAutosave();
    return;
  }
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
  const singleField = target.dataset.instrumentNoteField || "";
  const batchField = target.dataset.instrumentNoteBatchField || "";
  if (!singleField && !batchField) return;
  const changed = singleField
    ? applySelectedInstrumentNoteField(singleField, target.value)
    : applySelectedInstrumentNoteField(batchField, target.value, { batch: true });
  if (changed) {
    renderInstrumentDeck();
    scheduleAutosave();
  }
});

instrumentInspectorPanel?.addEventListener("change", (event) => {
  const target = event.target;
  if (applyInstrumentTrackField(target)) {
    scheduleAutosave();
    return;
  }
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
  const singleField = target.dataset.instrumentNoteField || "";
  const batchField = target.dataset.instrumentNoteBatchField || "";
  if (!singleField && !batchField) return;
  const changed = singleField
    ? applySelectedInstrumentNoteField(singleField, target.value)
    : applySelectedInstrumentNoteField(batchField, target.value, { batch: true });
  if (changed) {
    renderInstrumentDeck();
    scheduleAutosave();
  }
});

instrumentInspectorPanel?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-instrument-note-action]");
  if (!button) return;
  const action = button.dataset.instrumentNoteAction || "";
  const changed = runSelectedInstrumentNoteAction(action);
  if (changed) {
    renderInstrumentDeck();
    scheduleAutosave();
  }
});

document.addEventListener("keydown", (event) => {
  if (forgePane !== "instrument") return;
  const activeTag = document.activeElement?.tagName || "";
  if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;
  const normalizedKey = `${event.key || ""}`.toLowerCase();
  const modifierPressed = event.ctrlKey || event.metaKey;
  if (modifierPressed && normalizedKey === "z") {
    event.preventDefault();
    const changed = event.shiftKey ? redoInstrumentHistory() : undoInstrumentHistory();
    if (changed) {
      scheduleAutosave();
      setStatus(event.shiftKey ? "Redid the next Instrument Deck change." : "Undid the last Instrument Deck change.");
    }
    return;
  }
  if (modifierPressed && normalizedKey === "y") {
    event.preventDefault();
    if (redoInstrumentHistory()) {
      scheduleAutosave();
      setStatus("Redid the next Instrument Deck change.");
    }
    return;
  }
  if (modifierPressed && normalizedKey === "c") {
    event.preventDefault();
    if (copySelectedInstrumentNotes()) {
      renderInstrumentDeck();
      setStatus("Copied the selected notes.");
    }
    return;
  }
  if (modifierPressed && normalizedKey === "v") {
    event.preventDefault();
    if (pasteInstrumentClipboard()) {
      renderInstrumentDeck();
      scheduleAutosave();
      setStatus("Pasted notes into the selected track.");
    }
    return;
  }
  if (modifierPressed && normalizedKey === "d") {
    event.preventDefault();
    if (duplicateSelectedInstrumentNotes()) {
      renderInstrumentDeck();
      scheduleAutosave();
      setStatus("Duplicated the selected notes.");
    }
    return;
  }
  if (!instrumentKeyboardMode && normalizedKey === "d") {
    event.preventDefault();
    setInstrumentInputMode("draw");
    scheduleAutosave();
    return;
  }
  if (!instrumentKeyboardMode && normalizedKey === "v") {
    event.preventDefault();
    setInstrumentInputMode("select");
    scheduleAutosave();
    return;
  }
  if (!instrumentKeyboardMode && normalizedKey === "q") {
    event.preventDefault();
    if (quantizeInstrumentNotes()) {
      renderInstrumentDeck();
      scheduleAutosave();
      setStatus("Quantized the current phrase to the selected grid.");
    }
    return;
  }
  if (!instrumentKeyboardMode && normalizedKey === "h") {
    event.preventDefault();
    if (humanizeInstrumentNotes()) {
      renderInstrumentDeck();
      scheduleAutosave();
      setStatus("Humanized timing and velocity for a looser feel.");
    }
    return;
  }
  if (!instrumentKeyboardMode && normalizedKey === "l") {
    event.preventDefault();
    if (setInstrumentLoopFromSelection()) {
      renderInstrumentDeck();
      scheduleAutosave();
      setStatus("Loop region set from the current phrase.");
    }
    return;
  }
  if (event.code === "Space") {
    event.preventDefault();
    if (instrumentTransport.playing) {
      stopInstrumentPlayback();
    } else {
      startInstrumentPlayback().catch((error) => {
        setStatus(error.message || "Instrument playback failed.");
      });
    }
    return;
  }
  if (normalizedKey === "k") {
    const nextMode = getInstrumentInputMode() === "keys" ? "draw" : "keys";
    const recordedAny = getInstrumentInputMode() === "record"
      ? stopAllHeldInstrumentInputs({
        commitRecordings: true,
      })
      : false;
    setInstrumentInputMode(nextMode);
    if (recordedAny) {
      scheduleAutosave();
    }
    scheduleAutosave();
    event.preventDefault();
    return;
  }
  if (normalizedKey === "r") {
    const nextMode = getInstrumentInputMode() === "record" ? "draw" : "record";
    const recordedAny = getInstrumentInputMode() === "record"
      ? stopAllHeldInstrumentInputs({
        commitRecordings: true,
      })
      : false;
    setInstrumentInputMode(nextMode);
    if (recordedAny) {
      scheduleAutosave();
    }
    scheduleAutosave();
    event.preventDefault();
    return;
  }
  if (event.key === "ArrowLeft") {
    moveInstrumentEditCursor(-instrumentInputStepLength);
    scheduleAutosave();
    event.preventDefault();
    return;
  }
  if (event.key === "ArrowRight") {
    moveInstrumentEditCursor(instrumentInputStepLength);
    scheduleAutosave();
    event.preventDefault();
    return;
  }
  const selectedTrack = getSelectedInstrumentTrack();
  if (instrumentKeyboardMode && selectedTrack && getInstrumentKeyboardRow(selectedTrack, normalizedKey)) {
    event.preventDefault();
    void handleInstrumentKeyboardInput(normalizedKey, { repeat: event.repeat }).catch((error) => {
      setStatus(error.message || "Live key playback failed.");
    });
    return;
  }
  if (event.key !== "Delete" && event.key !== "Backspace") return;
  if (!selectedTrack || !getSelectedInstrumentNoteStates(selectedTrack.id).length) return;
  if (removeSelectedInstrumentNotes()) {
    renderInstrumentDeck();
    scheduleAutosave();
    event.preventDefault();
  }
});

document.addEventListener("keyup", (event) => {
  if (forgePane !== "instrument") return;
  const activeTag = document.activeElement?.tagName || "";
  if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;
  const result = stopHeldInstrumentInput(`${event.key || ""}`.toLowerCase(), {
    commitRecording: true,
  });
  if (result?.recorded) {
    renderInstrumentDeck();
    scheduleAutosave();
  }
});

window.addEventListener("blur", () => {
  const recordedAny = stopAllHeldInstrumentInputs({
    commitRecordings: true,
  });
  if (recordedAny) {
    renderInstrumentDeck();
    scheduleAutosave();
  }
});

restoreForgePane();
restoreStudioPane();
restoreUiMode();
setInstrumentZoom(instrumentZoom, { render: false });
restoreAutosave();
restoreMixSession();
hydrateCatalog().catch((error) => {
  composerModelNote.textContent = error.message || "Model catalog unavailable.";
});
hydrateSystem();
loadDraftLibrary();
updateComposeButtonLabel();
loadVoiceCloneProfiles().catch((error) => {
  cloneProfileMeta.textContent = error.message || "Voice clone profiles unavailable.";
});
loadSyntheticVoices().catch(() => {});
renderMixDeck();
renderArrangementDeck();
renderInstrumentDeck();
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
