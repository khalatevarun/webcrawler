import { JSDOM } from 'jsdom';
import { ExtractedPageData } from './types';
import pLimit from "p-limit";

/**
 * Normalize a URL for consistent comparison and storage.
 * - Removes the protocol (http/https)
 * - Returns host + pathname only
 *
 * Examples:
 *  - https://www.varunhnk.com/blog  => "www.varunhnk.com/blog"
 *  - https://www.varunhnk.com/blog/ => "www.varunhnk.com/blog"
 *  - HTTP://WWW.Example.com/Path/   => "www.example.com/path"
 *  - https://example.com/           => "example.com" 
 * 
 * @param input Full absolute URL to normalize
 * @returns Normalized URL string in the form "host/path" (lowercased, no trailing slash)
 */
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


/**
 * Extracts all valid absolute URLs from <a> tags in the given HTML string.
 * - Resolves relative links using the provided baseURL
 * - Skips invalid URLs 
 * - Returns an array of absolute URLs as strings
 *
 * @param html HTML string to parse for <a> tags
 * @param baseURL Base URL to resolve relative links
 * @returns Array of absolute URLs as strings
 */
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

export const getHTML = async (url: string): Promise<string> => {
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
        return "";
    }

    const contentType = res.headers.get("content-type") || "";
    if(!contentType || !contentType.includes("text/html")) {
        console.log(`Get non-html response: ${contentType}`);
        return "";
    }
    return await res.text();
}

/**
 * A recursive function to crawl pages of a given website
 * @param baseURL - to store the parent url 
 * @param currentURL - to keep track of current url and make sure the hostname matches with baseurl, we want to only parse baseURl's domain specific url and not all
 * @param pages - to store the url: count found while crawling the whole website
 */
export const crawlPage = async(baseURL: string, currentURL: string = baseURL, pages: Record<string, number> = {}) => {

    const baseURLObj = new URL(baseURL);
    const currentURLObj = new URL(currentURL);

    // if the currenturl is outside the website's domain, we want to skip it
    if(baseURLObj.hostname !== currentURLObj.hostname){
        return pages;
    }

    let currentNormalizedURL = normalizeURL(currentURL); // normalizing the url for consistent formatted entries in pages object

    if(pages[currentNormalizedURL] > 0){
        pages[currentNormalizedURL]++;
        return pages;
    }
    
    pages[currentNormalizedURL] = 1;

    let html = "";

    try { 
        html = await getHTML(currentURL);
    }
    catch(error){
        console.log(`Error: ${(error as Error).message}`)
    }

    const allURLs = getURLsFromHTML(html, baseURL); // returns all "absolute" urls to new pages in the html

    for(const nextURL of allURLs) {
        pages = await crawlPage(baseURL, nextURL, pages);
    }

    return pages;
}



class ConcurrentCrawler {
    private baseURL:string = "";
    private pages: Record<string, number> = {};
    private limit: <T>(fn: () => Promise<T>) => Promise<T>;

    constructor(baseURL: string, maxConcurrency: number = 1) {
        this.baseURL = baseURL;
        this.pages = {};
        this.limit = pLimit(maxConcurrency);
  }

    private addPageVisit(normalizedURL: string): boolean {
        if(this.pages[normalizedURL] > 0){
            this.pages[normalizedURL]++;
            return false;
        }
        else {
            this.pages[normalizedURL] = 1;
            return true;
        }
    }

    private getHTML = async (url: string): Promise<string> => {

        return await this.limit(async () => {
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
                return "";
            }

            const contentType = res.headers.get("content-type") || "";
            if(!contentType || !contentType.includes("text/html")) {
                console.log(`Get non-html response: ${contentType}`);
                return "";
            }
            return await res.text();
         })
}

/**
 * A recursive function to crawl pages of a given website
 * @param baseURL - to store the parent url 
 * @param currentURL - to keep track of current url and make sure the hostname matches with baseurl, we want to only parse baseURl's domain specific url and not all
 * @param pages - to store the url: count found while crawling the whole website
 */
private async crawlPage(currentURL: string): Promise<void> {

const baseURLObj = new URL(this.baseURL);
const currentURLObj = new URL(currentURL);

// if the currenturl is outside the website's domain, we want to skip it
if(baseURLObj.hostname !== currentURLObj.hostname){
    return
}

let currentNormalizedURL = normalizeURL(currentURL); // normalizing the url for consistent formatted entries in pages object

if(!this.addPageVisit(currentNormalizedURL)){
    return;
}

    console.log(`crawling ${currentURL}`);


let html = "";

try { 
    html = await this.getHTML(currentURL);
}
catch(error){
    console.log(`Error: ${(error as Error).message}`)
}

const nextURLs = getURLsFromHTML(html, this.baseURL);

const crawlPromises = nextURLs.map((nextURL) => this.crawlPage(nextURL));

await Promise.all(crawlPromises);

}

    async crawl(): Promise<Record<string, number>> {
    await this.crawlPage(this.baseURL);
    return this.pages;
  }

}

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 5,
): Promise<Record<string, number>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency);
  return await crawler.crawl();
}
