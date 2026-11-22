// Deterministic browser mocks; these do not measure real microphone accuracy.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
function load(file, dependencies = {}, globals = {}) {
  const output = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
      },
    },
  ).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: (name) => dependencies[name] || require(name),
    console,
    ...globals,
  });
  return exports;
}
const commands = load("src/lib/voice/commands.ts");
for (const [spoken, type, value] of [
  ["मुझे मौसम बताओ।", "navigate", "/weather"],
  ["Open dashboard", "navigate", "/dashboard"],
  ["डार्क मोड चालू करो।", "theme", "dark"],
  ["light mode", "theme", "light"],
  ["होम पेज पर वापस जाओ।", "navigate", "/"],
  ["पिछले पेज पर जाओ।", "back"],
  ["ये जानकारी पढ़कर सुनाओ।", "read"],
  ["भाषा भोजपुरी कर दो।", "language", "bho"],
  ["मेरा नाम राम कुमार है।", "fill", "राम कुमार"],
  ["मेरी फसल गेहूं है।", "fill", "गेहूं"],
  ["हाँ", "confirm"],
  ["नहीं", "cancel"],
  ["resume", "resume"],
  ["repeat", "repeat"],
])
  test(spoken, () => {
    const actual = commands.parseCommand(spoken);
    assert.equal(actual.type, type);
    if (value) assert.equal(actual.value, value);
  });
for (const question of [
  "गेहूं में पीले पत्ते क्यों हो रहे हैं?",
  "आज टमाटर का भाव क्या है?",
  "बारिश कब होगी?",
  "How do I grow tomatoes?",
])
  test("Question remains a question: " + question, () =>
    assert.equal(commands.parseCommand(question), null),
  );
test("Voice destinations exist", () => {
  for (const [route] of commands.ROUTE_COMMANDS)
    assert.ok(
      fs.existsSync(path.join(__dirname, "../src/app", route, "page.tsx")),
      route,
    );
});

function harness({ supported = true } = {}) {
  let slot = 0;
  const slots = [],
    effects = [],
    recognizers = [],
    said = [],
    requests = [],
    routes = [];
  let state;
  const listeners = {};
  const react = {
    createContext: () => ({ Provider: "provider" }),
    createElement: (_type, props) => props,
    useRef: (value) => {
      const n = slot++;
      return slots[n] || (slots[n] = { current: value });
    },
    useState: (value) => {
      const n = slot++;
      if (!(n in slots)) slots[n] = value;
      return [
        slots[n],
        (next) => {
          slots[n] = typeof next === "function" ? next(slots[n]) : next;
        },
      ];
    },
    useEffect: (fn, deps) => {
      const n = slot++;
      if (!slots[n]) {
        slots[n] = deps;
        effects.push(fn);
      }
    },
    useContext: () => null,
  };
  react.default = react;
  class Recognition {
    constructor() {
      recognizers.push(this);
    }
    start() {
      this.onstart?.();
    }
    stop() {
      this.onend?.();
    }
    abort() {
      this.aborted = true;
      this.onend?.();
    }
  }
  const synth = {
    getVoices: () => [
      { lang: "en-IN", voiceURI: "english", localService: true },
      { lang: "hi-IN", voiceURI: "hindi", localService: true },
    ],
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak: (u) => {
      said.push(u);
      u.onstart?.();
    },
    pause() {},
    resume() {},
  };
  const window = {
    isSecureContext: true,
    speechSynthesis: synth,
    SpeechRecognition: supported ? Recognition : undefined,
    addEventListener: (name, fn) => (listeners[name] = fn),
    removeEventListener() {},
  };
  const doc = {
    hidden: false,
    addEventListener: (name, fn) => (listeners[name] = fn),
    removeEventListener() {},
  };
  const cleanup = [];
  const api = load(
    "src/lib/voice/VoiceContext.tsx",
    {
      react,
      "next/navigation": {
        useRouter: () => ({ push: (r) => routes.push(r), back() {} }),
        usePathname: () => "/weather",
      },
      "@/lib/language": {
        useLanguage: () => ({
          lang: "en",
          setLang() {},
          openLanguageModal() {},
        }),
        LANG_NAMES: { en: "English", hi: "Hindi" },
      },
      "next-themes": { useTheme: () => ({ setTheme: (t) => routes.push(t) }) },
      "./commands": commands,
      "./pageAccess": {
        readablePage: () => "Actual page content",
        safeFields: () => [],
        findField: () => null,
      },
    },
    {
      window,
      document: doc,
      navigator: {},
      SpeechSynthesisUtterance: class {
        constructor(text) {
          this.text = text;
        }
      },
      AbortController,
      setTimeout: () => 1,
      clearTimeout() {},
      cancelAnimationFrame() {},
      fetch: async (url, options) => {
        requests.push({ url, options });
        return {
          ok: true,
          json: async () => ({
            content: "Test advisor response",
            session_id: "test-session",
          }),
        };
      },
    },
  );
  function render() {
    slot = 0;
    state = api.VoiceProvider({ children: null }).value;
  }
  render();
  for (const effect of effects) {
    const result = effect();
    if (result) cleanup.push(result);
  }
  render();
  return {
    get state() {
      render();
      return state;
    },
    recognizers,
    said,
    requests,
    routes,
    doc,
    listeners,
    cleanup,
  };
}
test("Browser command uses no paid interpretation or TTS request", async () => {
  const h = harness();
  await h.state.sendVoiceCommand("Open dashboard");
  assert.equal(h.routes[0], "/dashboard");
  assert.equal(h.requests.length, 0);
});
test("Natural question calls the existing advisor once", async () => {
  const h = harness();
  await h.state.sendVoiceCommand("Why are wheat leaves yellow?");
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url, "/api/chat/message");
  assert.equal(h.state.lastReply, "Test advisor response");
});
test("Unsupported browser never opens microphone", async () => {
  const h = harness({ supported: false });
  assert.equal(await h.state.startListening(), false);
  assert.equal(h.recognizers.length, 0);
  assert.equal(h.state.phase, "error");
});
test("Duplicate start is ignored and cancellation discards transcript", async () => {
  const h = harness();
  await h.state.startListening();
  await h.state.startListening();
  assert.equal(h.recognizers.length, 1);
  h.recognizers[0].onresult({
    results: [
      Object.assign([{ transcript: "open dashboard" }], { isFinal: true }),
    ],
  });
  h.state.stopAll();
  assert.equal(h.recognizers[0].aborted, true);
  assert.equal(h.routes.length, 0);
  assert.equal(h.state.isListening, false);
});
test("Permission denial disables hands-free without retry loop", async () => {
  const h = harness();
  await h.state.startListening();
  h.recognizers[0].onerror({ error: "not-allowed" });
  assert.equal(h.state.phase, "error");
  assert.match(h.state.error, /permission/);
  assert.equal(h.state.continuousMode, false);
});
test("Speech output has no active recognition to hear itself", async () => {
  const h = harness();
  await h.state.startListening();
  await h.state.sendVoiceCommand("read this page");
  assert.equal(h.recognizers[0].aborted, true);
  assert.equal(h.state.isListening, false);
  assert.equal(h.said[0].text, "Actual page content");
});
test("Hidden tab cancels active microphone", async () => {
  const h = harness();
  await h.state.startListening();
  h.doc.hidden = true;
  h.listeners.visibilitychange();
  assert.equal(h.recognizers[0].aborted, true);
  assert.equal(h.state.isListening, false);
});
