import { browser } from 'wxt/browser';

import type { Tab, TabResult, ValueCallback } from './types'
import { Dirty } from './types'

import * as linkCleaner from "link-cleaner-js";


// Function injected into each tab to check for dirty forms
const hasUnsavedFormInput = () => {
  const inputs = document.querySelectorAll('input, textarea, select');
  for (const el of inputs) {
    const typeAttr = el.getAttribute('type')
    if (typeAttr === 'hidden' || typeAttr === 'submit' || typeAttr === 'button') {
      continue;
    }
    
    const checkedAttr = el.getAttribute('checked')
    const defaultCheckedCheckedAttr = el.getAttribute('defaultChecked')
    // Check checkboxes/radios against their initial HTML state
    if ((typeAttr === 'checkbox' || typeAttr === 'radio') && checkedAttr !== defaultCheckedCheckedAttr) {
      return true;
    }

    const valueAttr = el.getAttribute('value');
    const defaultValueAttr = el.getAttribute('defaultValue');
    // Check text inputs/textareas against their initial HTML value
    if (valueAttr && valueAttr !== defaultValueAttr && valueAttr.trim() !== '') {
      return true;
    }
  }
  // Also check rich-text editors (like Gmail, Notion, Reddit comments)
  const editables = document.querySelectorAll('[contenteditable="true"]');
  for (const el of editables) {
    if (el.textContent.trim().length > 0) return true;
  }
  return false;
}

export const checkIsDirty = async (tab: Tab): Promise<Dirty> => {
  if (!tab.id || tab.discarded) {
    // Fail safe
    return Dirty.DISCARDED;
  }
  console.log('Checking isDirty', tab.title, tab.url, tab);
  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: hasUnsavedFormInput,
    });
    return result?.result ? Dirty.DIRTY : Dirty.CLEAN;
  } catch (e) {
    // If script injection fails (e.g., Chrome Web Store or PDF), skip closing for safety
    console.warn(`Skipped tab ${tab.id}:`, e);
    return Dirty.NO_SCRIPT;
  }
}

export const getTitle = ({ title, url }: Pick<Tab, 'title' | 'url'>): string => {
  if (!title) {
    return "(N/A)";
  }

  const parsedUrl = URL.parse(url || '');
  if (url?.includes('google.com') && url.includes('q=')) {
    const query = parsedUrl?.searchParams.get('q');
    return `Google: ${query}`
  }

  const redirect = ["returnTo", "redirect_uri"]
    .map((p) => parsedUrl?.searchParams.get(p))
    .filter(x => x)
    .map(destination => `${title} -> ${destination}`);
  if (redirect.length > 0) {
    return redirect[0] || title;
  }

  // SAML
  const relayState = parsedUrl?.searchParams.get('RelayState');
  if (relayState) {
    const relayUrl = URL.parse(relayState);
    const cont = relayUrl?.searchParams.get('continue');
    if (cont) {
      return `${title} -> ${cont}`
    }
  }

  // GMail
  if (parsedUrl?.hash.includes('#search/')) {
    console.log('Gmail search, hash:', parsedUrl.hash);
    const { hash } = parsedUrl;
    const query = decodeURIComponent(hash.substring('#search/'.length).replaceAll(/\/.*/g, '').replaceAll('+', ' '));
    return `${title} - search: ${query}`
  }

  const decodedUrl = decodeURI(url || '').replace(/^https?:\/\/(www\.)?/, '')
  const normalizedTitle = title.replace(/^https?:\/\/(www\.)?/, '')
  if (normalizedTitle === decodedUrl) {
    return "(URL)";
  }

  return title;
}

export const checkIsInternal = (tab: Tab): Boolean => {
  const { url } = tab;
  return url && (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) || false;
}


export const scanTabs = async (
    onTabCount?: ValueCallback<number>,
    onTabProgress?: ValueCallback<number>
): Promise<TabResult[]> => {
  const tabs = await browser.tabs.query({});
  const result: TabResult[] = [];
  const windowIndex: Map<number, number> = new Map()
  const getWindowIndex = (windowId: number) => {
    return windowIndex.getOrInsertComputed(windowId, () => windowIndex.size + 1)
  }

  onTabCount?.(tabs.length);

  for (const tab of tabs) {
    // Normalize URL (customize this if you want to ignore #hashes or ?query params)
    const url = tab.url || '';

    const isInternal = checkIsInternal(tab);
    if (isInternal) {
      continue;
    }

    if (!tab.id) {
      continue;
    }

    const { discarded: isDiscarded } = tab;
    // const dirty = await checkIsDirty(tab);
    const dirty = Dirty.NO_SCRIPT;
    const title = getTitle(tab);

    const cleanedLink = linkCleaner.clean(url).toString();
    const isCleanLink = cleanedLink === url;

    result.push({
      tab,
      window: getWindowIndex(tab.windowId),
      windowId: tab.windowId,
      id: tab.id,
      title,
      url,
      isDiscarded,
      isInternal,
      dirty,
      isCleanLink,
      cleanedLink,
    })
    onTabProgress?.(result.length);
  }

  return result;
};

