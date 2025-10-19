import { JSDOM } from 'jsdom';

export const normalizeURL = (input: string) => {
    const urlObj = new URL(input);
    let fullPath = `${urlObj.host}${urlObj.pathname}`;
    if(fullPath.endsWith('/')) {
        fullPath = fullPath.slice(0, -1);
    }
    return fullPath.toLowerCase();
}

export const getH1FromHTML = (html: string): string => {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const h1 = doc.querySelector("h1");
    return (h1?.textContent ?? "").trim();
  } catch {
    return "";
  }
}

export const getFirstParagraphFromHTML = (html: string): string => {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const main = doc.querySelector("main");
    const p = main?.querySelector("p") ?? doc.querySelector("p");
    return (p?.textContent ?? "").trim();
  } catch {
    return "";
  }
}

