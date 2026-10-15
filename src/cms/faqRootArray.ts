// Decap 3.0's built-in JSON formatter expects named editor fields. Adapt only
// this file at the backend boundary; the repository always stores a root array.
export const FAQ_FILE = "src/content/faq.json";

export interface FaqAnswer {
  question: string;
  answer: string;
  [key: string]: unknown;
}

function answers(value: unknown): FaqAnswer[] {
  if (!Array.isArray(value) || value.some(item => !item || typeof item !== "object" ||
    typeof item.question !== "string" || typeof item.answer !== "string")) {
    throw new Error("FAQ must be an array of question/answer records. Nothing was saved.");
  }
  return value;
}

export function readFaqForEditor(raw: string): string {
  return JSON.stringify({ faqs: answers(JSON.parse(raw)) }, null, 2);
}

export function writeFaqFromEditor(raw: string): string {
  const value = JSON.parse(raw);
  if (!value || Array.isArray(value) || Object.keys(value).length !== 1 || !("faqs" in value)) {
    throw new Error("Unexpected FAQ editor shape. Nothing was saved.");
  }
  return JSON.stringify(answers(value.faqs), null, 2) + "\n";
}

interface ReadFile { file: { path: string }; data: string }
interface WriteFile { path: string; raw: string; [key: string]: unknown }
interface WriteEntry { dataFiles: WriteFile[]; [key: string]: unknown }
export interface FaqBackend {
  getEntry(path: string): Promise<ReadFile>;
  entriesByFiles(...args: unknown[]): Promise<ReadFile[]>;
  persistEntry(entry: WriteEntry, ...args: unknown[]): unknown;
}

function editorFile<T extends ReadFile>(file: T): T {
  return file.file.path === FAQ_FILE ? { ...file, data: readFaqForEditor(file.data) } : file;
}

export function adaptFaqBackend<T extends FaqBackend>(backend: T): T {
  return new Proxy(backend, {
    get(target, property) {
      if (property === "getEntry") return async (path: string) => editorFile(await target.getEntry(path));
      if (property === "entriesByFiles") return async (...args: unknown[]) =>
        (await target.entriesByFiles(...args)).map(editorFile);
      if (property === "persistEntry") return (entry: WriteEntry, ...args: unknown[]) => {
        // Validate all target files before handing anything to the real backend.
        const dataFiles = entry.dataFiles.map(file => file.path === FAQ_FILE
          ? { ...file, raw: writeFaqFromEditor(file.raw) } : file);
        return target.persistEntry({ ...entry, dataFiles }, ...args);
      };
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export interface FaqBackendCMS {
  getBackend(name: string): { init: (...args: unknown[]) => FaqBackend } | undefined;
}

const registered = new WeakSet<object>();
export function registerFaqRootArrayAdapter(cms: FaqBackendCMS) {
  // Decorate the existing registered factories rather than replacing backend
  // names, authentication, branch settings or the local proxy transport.
  for (const name of ["github", "proxy"]) {
    const registration = cms.getBackend(name);
    if (!registration) throw new Error(`FAQ adapter: ${name} backend is unavailable.`);
    if (registered.has(registration)) continue;
    const init = registration.init.bind(registration);
    registration.init = (...args) => adaptFaqBackend(init(...args));
    registered.add(registration);
  }
}
