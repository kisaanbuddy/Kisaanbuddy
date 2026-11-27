// Component tests use explicit provider mocks; no live data is fabricated.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const root=path.join(__dirname,'..');
function load(file,deps={}) {
  const exports={};
  const js=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  vm.runInNewContext(js,{exports,require:n=>deps[n]||require(n),console});
  return exports;
}
const dictionary=load('src/lib/mobile-nav-i18n.ts');
const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
for(const lang of ['hi','en','kn']) {
  const deps={ 'next/link':Link,'@/lib/language':{useLanguage:()=>({lang,openLanguageModal(){}}),LANG_NAMES:{hi:'हिन्दी',en:'English',kn:'ಕನ್ನಡ'}},'@/lib/mobile-nav-i18n':dictionary,'@/lib/auth':{useAuth:()=>({user:null})},'next/navigation':{usePathname:()=>'/weather'},'@/components/assistant/VoiceAssistantModal':{openVoiceAssistant(){}}};
  test(`Service directory has valid routes and no duplicate links (${lang})`,()=>{
    const {MobileServiceDirectory}=load('src/components/mobile/MobileServiceDirectory.tsx',deps);
    const html=renderToStaticMarkup(React.createElement(MobileServiceDirectory));
    const routes=[...html.matchAll(/href="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(new Set(routes).size,routes.length);
    for(const route of routes) assert.ok(fs.existsSync(path.join(root,'src/app',route,'page.tsx')),route);
    assert.ok(routes.includes('/crops') && routes.includes('/settings'));
  });
  test(`Mobile navigation has five accessible destinations (${lang})`,()=>{
    const {MobileBottomNav}=load('src/components/MobileBottomNav.tsx',deps);
    const html=renderToStaticMarkup(React.createElement(MobileBottomNav));
    assert.equal([...html.matchAll(/<a /g)].length,5);
    assert.equal([...html.matchAll(/aria-current="page"/g)].length,1);
    assert.match(html,/md:hidden/);
  });
  test(`Mobile header uses real language and account controls (${lang})`,()=>{
    const {MobileAppHeader}=load('src/components/mobile/MobileAppHeader.tsx',deps);
    const html=renderToStaticMarkup(React.createElement(MobileAppHeader));
    assert.match(html,/href="\/login"/);
    assert.doesNotMatch(html,/Notifications|Bell/);
  });
}
test('Every mobile CSS declaration is scoped below the tablet breakpoint',()=>{
 const postcss=require('postcss');
 const css=postcss.parse(fs.readFileSync(path.join(root,'src/app/mobile-clean.css'),'utf8'));
 css.walkDecls(decl=>{let parent=decl.parent;let mobile=false;while(parent){if(parent.type==='atrule' && parent.name==='media' && parent.params==='(max-width: 767px)') mobile=true;parent=parent.parent;}assert.ok(mobile,decl.toString());});
});

const welcome = load('src/components/mobile/MobileWelcome.tsx', {
 'next/link':Link,
 'next/navigation':{usePathname:()=> '/'},
 '@/lib/language':{},
 '@/lib/mobile-nav-i18n':dictionary,
 '@/components/announcement/AnnouncementPopup':{AnnouncementPopup:()=>null},
 './MobileServiceDirectory':{MOBILE_SERVICES:[]},
});
const eligible={mobile:true,ready:true,languageSelected:true,languageOpen:false,seen:false,pathname:'/'};
test('Welcome opens for a ready mobile visitor',()=>assert.equal(welcome.shouldShowMobileWelcome(eligible),true));
for(const state of [{mobile:false},{ready:false},{languageSelected:false},{languageOpen:true},{seen:true},{pathname:'/admin'},{pathname:'/login'}])
 test('Welcome respects readiness, dismissal and desktop boundary '+JSON.stringify(state),()=>assert.equal(welcome.shouldShowMobileWelcome({...eligible,...state}),false));
test('Welcome includes farming, AgriLabour, equipment and schemes',()=>{
 for(const key of ['cropDoctor','cropRec','workers','marketplace','schemes','weather','mandi','chatbot','soilHealth','khetDiary']) assert.ok(welcome.WELCOME_SERVICE_KEYS.includes(key));
});
