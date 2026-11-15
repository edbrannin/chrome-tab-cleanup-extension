import { useState, useCallback } from 'react';

import type { TabResult } from './types';

import './App.css';
import { scanTabs } from './helpers';
import TabTable from './TabTable';

const openTab = async ({ windowId, id }: TabResult) => {
    // 2. Focus the window containing the tab
    await browser.windows.update(windowId, { focused: true });
    // 3. Switch to the tab
    await browser.tabs.update(id, { active: true });
}

const closeTab = async ({ id }: TabResult) => {
    await browser.tabs.remove(id);
}

function App() {
  const [tabs, setTabs] = useState<TabResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [tabsScanned, setTabsScanned] = useState(0);
  const [tabsCount, setTabsCount] = useState(0);
  const doScanTabs = useCallback(async () => {
    setIsScanning(true);
    try {
      setTabs(await scanTabs(setTabsCount, setTabsScanned));
    } finally {
      setIsScanning(false);
    }
  }, [setTabs, setIsScanning, setTabsCount, setTabsScanned])
  const doCloseTab = useCallback(async (tab: TabResult) => {
    setTabs(tabs.filter(t => t.id !== tab.id))
    await closeTab(tab);
  });
  return (
    <>
      <h1>Tab Cleanup</h1>
      <button onClick={doScanTabs} disabled={isScanning}>
        Scan Tabs
      </button>
      {isScanning && (
        <div>
          Scanning ({tabsScanned}/{tabsCount})...
        </div>
      )}

      {tabs.length > 0 && !isScanning && (
        <TabTable
          tabs={tabs}
          onCloseTab={doCloseTab}
          onOpenTab={openTab}
        />
      )}

      <div className="card">
        <p>
          Edit <code>entrypoint/sorter/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;
