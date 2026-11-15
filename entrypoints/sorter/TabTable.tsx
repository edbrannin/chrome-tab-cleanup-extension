import { useState } from "react";
import type { FC } from "react";

import './TabTable.css'
import type { TabCallback, TabResult } from "./types";

type TabTableProps = {
    tabs: TabResult[];
    onCloseTab: TabCallback;
    onOpenTab: TabCallback;
}

const filterTab = (tab: TabResult, text: string) => {
    const q = text?.toLowerCase();
    if (tab.title?.toLowerCase().includes(q)) {
        return true;
    }
    if (tab.url?.toLowerCase().includes(q)) {
        return true;
    }
    return false;
}

const TabTable: FC<TabTableProps> = ({ tabs, onCloseTab, onOpenTab }) => {
  const [filterText, setFilterText] = useState('');

  const visibleTabs = tabs.filter((tab) => filterTab(tab, filterText))
  return (
    <div>
      <div>
        {visibleTabs.length !== tabs.length && `${visibleTabs.length} /`}{tabs.length} tabs
        in {' '}
        {tabs[tabs.length - 1]?.window} windows</div>
      <div>
        Filter:
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        ></input>
      </div>
      <table>
        <thead>
          <tr>
            <th>Window</th>
            <th>Open</th>
            <th className="title">Title</th>
            <th className="url">URL</th>
            <th>Discarded?</th>
            {/* <th>Dirty?</th> */}
          </tr>
        </thead>
        <tbody>
          {tabs
            .filter((tab) => filterTab(tab, filterText))
            .map((tab) => (
              <tr key={tab.id}>
                <td>{tab.window}</td>
                <td>
                  <button onClick={() => onOpenTab(tab)}>Open</button>
                </td>
                <td className="title">{tab.title}</td>
                <td className="url">{tab.url}</td>
                <td>{tab.isDiscarded && "discarded"}</td>
                {/* <td>{tab.dirty}</td> */}
                <td>
                  <button onClick={() => onCloseTab(tab)}>Close</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabTable;