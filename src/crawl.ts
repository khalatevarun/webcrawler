import { JSDOM } from 'jsdom';
import { ExtractedPageData } from './types';

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

export const getURLsFromHTML = (html: string, baseURL: string): string[] => {

    const urls:string[] = [];

    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const aTags = doc.querySelectorAll("a");
        aTags.forEach((aTag) => {
            const href = aTag.getAttribute("href");
            if(href) {
                try {
                    const urlObj = new URL(href, baseURL).toString();
                    urls.push(urlObj);
                } catch {
                    console.log(`Invalid URL found: ${href}`);
                }
            }
        });
    }

         catch {

    }
    finally {
        return urls;
    }
}
      
export const getImagesFromHTML = (html: string, baseURL: string): string[] => {

    const urls:string[] = [];
    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const imageTags = doc.querySelectorAll("img");
        imageTags.forEach((imgTag) => {
            const src = imgTag.getAttribute("src");
            if(src) {
                try {
                    const urlObj = new URL(src, baseURL).toString();
                    urls.push(urlObj);
                } catch {
                    console.log(`Invalid Image URL found: ${src}`);
                }
            }
        });

    }
    catch {

    }
    finally {
        return urls;
    }
}


export const extractPageData = (
  html: string,
  pageURL: string,
): ExtractedPageData => {
  return {
    url: pageURL,
    h1: getH1FromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  };
}

export const getHTML = async (url: string) => {
    console.log(`crawling ${url}`);
    let res;

    try {
        res = await fetch(url, {
            headers: {
                "User-Agent": "VCrawler/1.0"
            }
        });
    } catch(error) {
        throw new Error(`Network error: ${error}`);
    }
    
    if(res.status >= 399){
        console.log(`HTTP error: ${res.status} ${res.statusText}`);
        return;
    }

    const contentType = res.headers.get("content-type") || "";
    if(!contentType || !contentType.includes("text/html")) {
        console.log(`Get non-html response: ${contentType}`);
        return;
    }
    console.log(await res.text());
}

