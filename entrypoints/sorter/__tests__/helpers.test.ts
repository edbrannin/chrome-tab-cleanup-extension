import { describe, expect, it } from "vitest";
import { getTitle } from "../helpers";

const tab = (
  title: string,
  url: string = "https://www.example.com",
): Parameters<typeof getTitle>[0] => ({
  title,
  url,
});

describe("getTitle", () => {
  it("should return (N/A) for falsy titles", () => {
    expect(getTitle({ title: "", url: "http" })).toBe("(N/A)");
  });
  it("should return the title", () => {
    const title = "My Page"
    expect(getTitle({ title, url: "http" })).toBe(title);
  });
  it("should return (URL) for URL matches", () => {
    const url = 'http://example.com/whatever'
    expect(getTitle({
      title: url,
      url,
    })).toBe("(URL)");
  });
  it("should parse Google searches", () => {
    expect(getTitle({
      title: `google.com/search?q="the+redaction"&sca_esv=5ff99a7b89444a86&rlz=1C5GCEM_enUS1191US1191&sxsrf=APpeQnuA9BglgSVzl8hg5wmaoDdmvoJBuA%3A1792676268881&ei=rBHaasaQNbX_ptQPv-OfoQQ&biw=1388&bih=848&uact=5&oq="the+redaction"&gs_lp=Egxnd3Mtd2l6LXNlcnAiDyJ0aGUgcmVkYWN0aW9uIjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeSLUPUOIHWM8NcAF4AZABAJgBhgGgAeABqgEDMS4xuAEDyAEA-AEBmAIDoAKUAsICChAAGEcY1gQYsAPCAg4QABjkAhjWBBiwA9gBAcICFxAuGNwGGLgGGNoGGNgCGMgDGLAD2AEBwgIGEAAYFhgemAMAiAYBkAYNugYGCAEQARgJkgcDMS4yoAfhDbIHAzAuMrgHhgLCBwMyLTPIBxOACAE&sclient=gws-wiz-serp`,
      url: "https://www.google.com/search?q=%22the+redaction%22&sca_esv=5ff99a7b89444a86&rlz=1C5GCEM_enUS1191US1191&sxsrf=APpeQnuA9BglgSVzl8hg5wmaoDdmvoJBuA%3A1792676268881&ei=rBHaasaQNbX_ptQPv-OfoQQ&biw=1388&bih=848&uact=5&oq=%22the+redaction%22&gs_lp=Egxnd3Mtd2l6LXNlcnAiDyJ0aGUgcmVkYWN0aW9uIjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeSLUPUOIHWM8NcAF4AZABAJgBhgGgAeABqgEDMS4xuAEDyAEA-AEBmAIDoAKUAsICChAAGEcY1gQYsAPCAg4QABjkAhjWBBiwA9gBAcICFxAuGNwGGLgGGNoGGNgCGMgDGLAD2AEBwgIGEAAYFhgemAMAiAYBkAYNugYGCAEQARgJkgcDMS4yoAfhDbIHAzAuMrgHhgLCBwMyLTPIBxOACAE&sclient=gws-wiz-serp"
    })).toBe('Google: "the redaction"');
  });
  it('should note GMail Searches', () => {
    expect(getTitle({
      title: 'Gmail',
      url: 'https://mail.google.com/mail/u/0/#search/technology+survey/FMfcgzQjggsXxZhqXdSPQCCGxxXsPRZB'
    })).toBe('Gmail - search: technology survey')

    expect(getTitle({
      title: 'Search results - myself@gmail.com - Gmail',
      url: 'https://mail.google.com/mail/u/0/#search/from%3Agandi'
    })).toBe('Search results - myself@gmail.com - Gmail - search: from:gandi')
  })
});
