# Web Crawler

A CLI based concurrent web crawler with configurable concurrency limits, max page controls, and CSV export for extracted page data

## Features

-  **Concurrent crawling** with configurable concurrency limits using `p-limit`
-  **Max page control** to limit the number of pages crawled
-  **URL normalization** for consistent tracking and deduplication
-  **Data extraction**: Extracts H1 tags, first paragraph, outgoing links, and image URLs
-  **CSV export**: Automatically generates a CSV report of all crawled pages
-  **Domain restriction**: Only crawls pages within the same domain

## Key Concepts & Libraries

### `p-limit`
Controls concurrency by limiting the number of promises that can run simultaneously. This prevents overwhelming the target server and your local machine.

### `AbortController`
Provides a mechanism to cancel in-flight HTTP requests when the crawler reaches its maximum page limit.

### URL Normalization
Converts URLs to a consistent format (e.g., `www.example.com/path`) for accurate duplicate detection across different URL representations.

## Examples

### Crawl a blog with moderate concurrency
```bash
npm start https://blog.example.com 3 20
```

### Quick scan with high concurrency
```bash
npm start https://example.com 10 5
```

### Deep crawl with conservative rate limiting
```bash
npm start https://docs.example.com 2 100
```

## Installation

```bash
# Clone the repository
git clone https://github.com/khalatevarun/webcrawler.git
cd webcrawler

# Install dependencies
npm install
```

## Usage

### Basic Usage

```bash
npm start <URL> <maxConcurrency> <maxPages>
```

### Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `URL` | The starting URL to crawl | Yes | - |
| `maxConcurrency` | Max number of concurrent HTTP requests | Yes | - |
| `maxPages` | Maximum number of pages to crawl | Yes | - |

## Output

The crawler generates a `report.csv` file in the project root with the following columns:

- **page_url**: The URL of the crawled page
- **h1**: The H1 heading text
- **first_paragraph**: The first paragraph text (prioritizes `<main>` content)
- **outgoing_link_urls**: Semicolon-separated list of outgoing links
- **image_urls**: Semicolon-separated list of image URLs

### Sample CSV Output

```csv
page_url,h1,first_paragraph,outgoing_link_urls,image_urls
https://example.com,Welcome to Example,This is the first paragraph.,https://example.com/about;https://example.com/contact,https://example.com/logo.png
https://example.com/about,About Us,Learn more about our company.,https://example.com/;https://example.com/team,https://example.com/team-photo.jpg
```

