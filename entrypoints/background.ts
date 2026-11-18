export default defineBackground(() => {
  // Handle MV3 (browser.action) and MV2 (browser.browserAction)
  const action = browser.action ?? browser.browserAction;

  action.onClicked.addListener(async () => {
    const url = browser.runtime.getURL('/sorter.html');
    const existingTabs = await browser.tabs.query({ url });

    if (existingTabs.length > 0 && existingTabs?.[0]?.id) {
      const { id, windowId } = existingTabs[0];
      await browser.windows.update(windowId, { focused: true });
      await browser.tabs.update(id, { active: true });
    } else {
      await browser.tabs.create({ url });
    }
  });
});
