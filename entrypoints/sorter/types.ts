export type Tab = globalThis.Browser.tabs.Tab;

export enum Dirty {
  DIRTY = "Dirty",
  DISCARDED = 'Discarded',
  CLEAN = 'Clean',
  NO_SCRIPT = 'NoScript',
}

export type TabResult = {
  tab: Tab;
  id: number;
  // Simple 1-indexed window count
  window: number;
  // Browser's windowId
  windowId: number;
  title?: string;
  url?: string;
  isDiscarded: Boolean;
  isInternal: Boolean;
  dirty: Dirty;
}

export type ValueCallback<I, O=void> = (input: I) => O;
export type TabCallback<O=void> = ValueCallback<TabResult, O>