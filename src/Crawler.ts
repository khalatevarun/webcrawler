import pLimit from "p-limit";
import { ExtractedPageData, extractPageData, getURLsFromHTML, normalizeURL } from "./utils/crawl";


class Crawler {
    private baseURL: string = "";
    private pages: Record<string, ExtractedPageData> = {};
    private limit: <T>(fn: () => Promise<T>) => Promise<T>;
    private maxPages: number;
    private shouldStop = false;
    private allTasks = new Set<Promise<void>>();
    private abortController = new AbortController();
    private visited = new Set<string>();

    constructor(baseURL: string, maxConcurrency: number = 1, maxPages: number = 10) {
        this.baseURL = baseURL;
        this.pages = {};
        this.limit = pLimit(maxConcurrency);
        this.maxPages = Math.max(1, maxPages);
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop) {
            return false;
        }
        if (Object.keys(this.pages).length === this.maxPages) {
            console.log("Reached maximum number of pages to crawl.");
            this.abortController.abort();
            return false;
        }
        if (this.visited.has(normalizedURL)) {
            return false;
        }
        if (this.visited.size >= this.maxPages) {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.");
            this.abortController.abort();
            return false;
        }
        this.visited.add(normalizedURL);
        return true;
    }

    private getHTML = async (url: string): Promise<string> => {
        const { signal } = this.abortController;
        return await this.limit(async () => {
            let res;

            try {
                res = await fetch(url, {
                    headers: {
                        "User-Agent": "VCrawler/1.0"
                    },
                    signal
                });
            } catch(error) {
                if ((error as any)?.name === "AbortError") {
                throw new Error("Fetch aborted");
                }
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
    if (this.shouldStop) {
        return;
    }
    const baseURLObj = new URL(this.baseURL);
    const currentURLObj = new URL(currentURL);
    if (baseURLObj.hostname !== currentURLObj.hostname) {
        return;
    }
    let currentNormalizedURL = normalizeURL(currentURL);
    if (!this.addPageVisit(currentNormalizedURL)) {
        return;
    }
    console.log(`crawling ${currentURL}`);
    let html = "";
    try {
        html = await this.getHTML(currentURL);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}`);
    }
    if (this.shouldStop) return;
    // Store ExtractedPageData for this page
    this.pages[currentNormalizedURL] = extractPageData(html, currentURL);
    const nextURLs = getURLsFromHTML(html, this.baseURL);
    const crawlPromises: Promise<void>[] = [];
    for (const nextURL of nextURLs) {
        if (this.shouldStop) break;
        const task = this.crawlPage(nextURL);
        this.allTasks.add(task);
        task.finally(() => this.allTasks.delete(task));
        crawlPromises.push(task);
    }
    await Promise.all(crawlPromises);
}

        async crawl(): Promise<Record<string, ExtractedPageData>> {
                const rootTask = this.crawlPage(this.baseURL);
                this.allTasks.add(rootTask);
                try {
                        await rootTask;
                } finally {
                        this.allTasks.delete(rootTask);
                }
                await Promise.allSettled(Array.from(this.allTasks));
                return this.pages;
        }

}

export async function crawlSite(
    baseURL: string,
    maxConcurrency: number = 5,
    maxPages: number = 10
): Promise<Record<string, ExtractedPageData>> {
    const crawler = new Crawler(baseURL, maxConcurrency, maxPages);
    return await crawler.crawl();
}