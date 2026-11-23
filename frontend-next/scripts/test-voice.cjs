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

for (const [spoken, route] of [
  ['mosam kholo', '/weather'], ['weather kholo', '/weather'],
  ['बारिश वाला पेज दिखाओ', '/weather'], ['open wether', '/weather'],
  ['schems kholo', '/schemes'], ['sarkari madad dikhao', '/schemes'],
  ['yojna dikhao', '/schemes'], ['majdoor chahiye', '/worker-connect'],
  ['mitti ki janch', '/soil-health'], ['open markeplace', '/marketplace'],
  ['meri profile dikha do', '/profile'], ['open dashbord', '/dashboard'],
]) test('Similar navigation: ' + spoken, () => {
  assert.equal(commands.parseCommand(spoken)?.value, route);
});
for (const spoken of ['do not open weather', 'mausam mat kholo', 'मंडी मत खोलो',
  'open weather and mandi', 'how does weather affect wheat', 'barish kab hogi',
  'homeopathy', 'confrm']) {
  test('No accidental action: ' + spoken, () => assert.equal(commands.parseCommand(spoken), null));
}
const local = load('src/lib/voice/LocalVoiceInterpreter.ts', { './commands': commands });
test('API interpreter shares flexible navigation', () => {
  assert.equal(local.interpretLocally('open wether', {}).action.payload.path, '/weather');
  assert.equal(local.interpretLocally('बारिश कब होगी?', {}), null);
  assert.equal(local.interpretLocally('open weather and mandi', {}), null);
});

for (const [spoken, route] of [
  ['कौन सी फसल लगाऊँ वाला पेज', '/crop-predictor'],
  ['kaun si fasal lagau page kholo', '/crop-predictor'],
  ['मिट्टी चेक करनी है', '/soil-health'], ['mitti test karna hai', '/soil-health'],
  ['ट्रैक्टर किराये पर चाहिए', '/marketplace'], ['kheti ke auzar dikhao', '/marketplace'],
  ['खेती का हिसाब खोलो', '/khet-diary'], ['kharcha diary kholiye', '/khet-diary'],
  ['खेत में काम करने वाले चाहिए', '/worker-connect'], ['farm workers dikhao', '/worker-connect'],
  ['मंडी के रेट दिखाइए', '/mandi'], ['crop prices page open', '/mandi'],
  ['सरकारी सहायता वाला पेज', '/schemes'], ['government benefits dikhao', '/schemes'],
  ['पत्ते की जांच वाला पेज', '/disease'], ['crop scan kholo', '/disease'],
  ['नया खाता खोलना है', '/signup'], ['naya account banana hai', '/signup'],
  ['मेरी जानकारी दिखाओ', '/profile'], ['mera account kholiye', '/profile'],
  ['टीम से बात करनी है', '/contact'], ['customer support', '/contact'],
  ['कृषि विशेषज्ञ वाला पेज', '/chatbot'], ['krishi salahkar dikhao', '/chatbot'],
  ['खेती सीखना है', '/crops'], ['cultivation guide', '/crops'],
  ['मदद केंद्र', '/madad'], ['help centre', '/madad'],
  ['किसानबडी के बारे में', '/about'], ['about kisaanbuddy', '/about'],
  ['open waether', '/weather'], ['open prof ile', undefined],
  ['dashbaord kholiye', '/dashboard'], ['मौसम वाला पेज', '/weather'],
]) test('Expanded phrase: ' + spoken, () => {
  assert.equal(commands.parseCommand(spoken)?.value, route);
  if (route) assert.equal(local.interpretLocally(spoken, {}).action.payload.path, route);
});
for (const spoken of ["don't open weather", 'मौसम खोलो मत', 'कौन सी फसल लगाऊँ',
  'kaun si fasal lagau', 'मिट्टी टेस्ट कैसे करें', 'crop prices kab badhenge']) {
  test('Expanded phrases preserve questions and refusals: ' + spoken, () => {
    assert.equal(commands.parseCommand(spoken), null);
  });
}

for (const [spoken, type] of [
  ['vaapas chalo', 'back'], ['पिछली स्क्रीन पर जाओ', 'back'],
  ['फिर से सुनाओ', 'repeat'], ['phir se sunao', 'repeat'], ['say that again', 'repeat'],
  ['थोड़ा रुको', 'pause'], ['padhna roko', 'pause'],
  ['पढ़ना जारी रखो', 'resume'], ['aage padho', 'resume'],
  ['ye page padho', 'read'], ['पढ़ कर सुनाओ', 'read'],
  ['bas karo', 'cancel'], ['रहने दो', 'cancel'],
]) test('Natural control: ' + spoken, () => assert.equal(commands.parseCommand(spoken)?.type, type));
for (const spoken of ['open government benefits and weather', 'मौसम और सरकारी सहायता खोलो',
  'mandi ya soil test dikhao', 'canfirm', 'submt form', 'phir se sunao mat'])
  test('Ambiguity and sensitive actions stay strict: ' + spoken, () => assert.equal(commands.parseCommand(spoken), null));
