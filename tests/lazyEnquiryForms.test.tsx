import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync("src/components/shared/LazyEnquiryForms.tsx", "utf8");
function harness() {
  let active: any;
  const effects: (() => void | (() => void))[] = [];
  class Component { props: any; constructor(props: any) { this.props = props; } }
  const react = {
    Component, Suspense: "suspense", lazy: (load: any) => Object.assign(() => null, { load }),
    useState(initial: any) {
      const i = active.cursor++; const owner = active;
      if (!(i in owner.slots)) owner.slots[i] = initial;
      return [owner.slots[i], (value: any) => { owner.slots[i] = typeof value === "function" ? value(owner.slots[i]) : value; owner.changed = true; }];
    },
    useRef(initial: any) { const i = active.cursor++; return active.slots[i] ??= { current: initial }; },
    useMemo(make: any, deps: any[]) { const i = active.cursor++; const old = active.slots[i]; if (!old || deps.some((d, i) => d !== old.deps[i])) active.slots[i] = { value: make(), deps }; return active.slots[i].value; },
    useEffect(effect: any) { effects.push(effect); }, useId: () => "fallback-title",
  };
  const js = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: any = {};
  const trigger = { isConnected: true, focuses: 0, focus() { this.focuses++; } };
  const document = { activeElement: trigger };
  new Function("require", "exports", "document", "requestAnimationFrame", "cancelAnimationFrame", js + "\nexports.create = deferredForm; exports.Fallback = FormFallback; exports.Boundary = FormLoadBoundary;")(
    (id: string) => id === "react" ? react : require(id), exports, document, (callback: any) => { callback(); return 1; }, () => {},
  );
  const host = (fn: any) => {
    const owner = { cursor: 0, slots: [] as any[], changed: false };
    return (props: any) => {
      active = owner;
      let tree: any;
      do { owner.cursor = 0; owner.changed = false; tree = fn(props); } while (owner.changed);
      return tree;
    };
  };
  const flushEffects = () => effects.splice(0).map(effect => effect());
  return { ...exports, host, trigger, document, flushEffects };
}
const child = (tree: any) => tree.props.children.props.children;

for (const name of ["registration", "contact"]) {
  test(`${name}: closed hosts defer loading; multiple instances and reopen share one request and component identity`, async () => {
    const h = harness(); let loads = 0; let resolve!: (value: any) => void;
    const Deferred = h.create(() => { loads++; return new Promise(yes => { resolve = yes; }); });
    const first = h.host(Deferred), second = h.host(Deferred);
    const props = { open: false, onOpenChange() {} };
    assert.equal(first(props), null); assert.equal(loads, 0);
    const opened = first({ ...props, open: true });
    const other = second({ ...props, open: true });
    assert.equal(child(opened).type, child(other).type);
    const request = child(opened).type.load(); assert.equal(request, child(other).type.load()); assert.equal(loads, 1);
    const pendingClosed = first(props);
    assert.equal(child(pendingClosed).type, child(opened).type);
    assert.equal(child(pendingClosed).props.open, false, "closing while a chunk loads remains safe");
    assert.equal(child(first({ ...props, open: true })).type.load(), request);
    const Form = () => null; resolve({ default: Form }); await request;
    const closed = first(props), reopened = first({ ...props, open: true });
    assert.equal(child(closed).type, child(opened).type, "closed form remains mounted rather than discarding entered values");
    assert.equal(child(closed).props.open, false);
    assert.equal(child(reopened).type, child(opened).type);
    assert.equal(child(reopened).type.load(), request); assert.equal(loads, 1);
  });
}

test("chunk rejection exposes a dismissible error fallback and permits a fresh shared import attempt", async () => {
  const h = harness(); let loads = 0;
  const Deferred = h.create(() => ++loads === 1 ? Promise.reject(new Error("chunk unavailable")) : Promise.resolve({ default: () => null }));
  const render = h.host(Deferred), props = { open: true, onOpenChange() {} };
  const failed = render(props); await assert.rejects(child(failed).type.load(), /chunk unavailable/);
  assert.deepEqual(h.Boundary.getDerivedStateFromError(), { failed: true });
  const boundary = new h.Boundary(failed.props); boundary.state = { failed: true };
  assert.equal(boundary.render(), failed.props.fallback);
  failed.props.fallback.props.retry(); const retry = render(props);
  assert.notEqual(retry.key, failed.key); assert.notEqual(child(retry).type, child(failed).type);
  await child(retry).type.load(); assert.equal(loads, 2);
});

test("loading/error fallback uses a native modal, handles Escape and closes safely", () => {
  const h = harness(); const changes: boolean[] = [];
  const render = h.host(h.Fallback);
  const tree = render({ open: true, onOpenChange: (value: boolean) => changes.push(value) });
  assert.equal(tree.type, "dialog"); assert.ok(tree.props["aria-labelledby"]);
  let opens = 0, closes = 0;
  tree.ref.current = { open: false, showModal() { this.open = true; opens++; }, close() { this.open = false; closes++; } };
  const cleanup = h.flushEffects()[0]; assert.equal(opens, 1);
  let prevented = false; tree.props.onCancel({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.deepEqual(changes, [false]);
  cleanup?.(); assert.equal(closes, 1);
  assert.equal(render({ open: false, onOpenChange() {} }), null);
});

test("closing restores focus to the opening trigger without remounting the form", () => {
  const h = harness(); const render = h.host(h.create(() => Promise.resolve({ default: () => null })));
  render({ open: true, onOpenChange() {} }); h.flushEffects();
  h.document.activeElement = { focus() {} } as any;
  render({ open: false, onOpenChange() {} }); h.flushEffects();
  assert.equal(h.trigger.focuses, 1);
});

test("all frontend form imports pass through the shared lazy boundary", () => {
  function walk(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]); }
  for (const path of walk("src").filter(path => /\.[jt]sx?$/.test(path))) {
    const file = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest);
    for (const statement of file.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        assert.doesNotMatch(statement.moduleSpecifier.text, /(?:^|\/)(?:EventRegistrationForm|ContactForm)$/, path);
      }
    }
  }
});


test("a removed mobile menu trigger restores focus to the menu toggle", () => {
  const h = harness(); const render = h.host(h.create(() => Promise.resolve({ default: () => null })));
  const toggle = { isConnected: true, focuses: 0, focus() { this.focuses++; } };
  const props = { onOpenChange() {}, fallbackFocusRef: { current: toggle } };
  render({ ...props, open: true }); h.flushEffects();
  h.trigger.isConnected = false;
  render({ ...props, open: false }); h.flushEffects();
  assert.equal(toggle.focuses, 1); assert.equal(h.trigger.focuses, 0);
});
