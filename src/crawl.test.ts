import { test, expect } from 'vitest';
import { getFirstParagraphFromHTML, getH1FromHTML, getImagesFromHTML, getURLsFromHTML, normalizeURL } from './crawl';

test('normalizeURL protocol',() => {
    const input = "https://www.varunhnk.com/blog";
    const actual = normalizeURL(input);
    const expected = "www.varunhnk.com/blog";
    expect(actual).toBe(expected);
})

test('normalizeURL slash', ()=> {
    const input = "https://www.varunhnk.com/blog/";
    const actual = normalizeURL(input);
    const expected = "www.varunhnk.com/blog";
    expect(actual).toBe(expected);
})

test('normalizeURL capitals', ()=> {
    const input = "https://WWW.varunhnk.com/blog/";
    const actual = normalizeURL(input);
    const expected = "www.varunhnk.com/blog";
    expect(actual).toBe(expected);
})

test('normalizeURL http', ()=> {
    const input = "http://www.varunhnk.com/blog/";
    const actual = normalizeURL(input);
    const expected = "www.varunhnk.com/blog";
    expect(actual).toBe(expected);
})

test("getH1FromHTML basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  const actual = getH1FromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getH1FromHTML no h1", () => {
  const inputBody = `<html><body><p>No H1 here</p></body></html>`;
  const actual = getH1FromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>`;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML fallback to first p", () => {
  const inputBody = `
    <html><body>
      <p>First outside paragraph.</p>
      <p>Second outside paragraph.</p>
    </body></html>`;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "First outside paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML no paragraphs", () => {
  const inputBody = `<html><body><h1>Title</h1></body></html>`;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});


test("getURLsFromHTML absolute", () => {
  const inputURL = "https://www.varunhnk.com";
  const inputBody = `<html><body><a href="https://www.varunhnk.com"><span>Boot.dev</span></a></body></html>`;

   const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://www.varunhnk.com/"];

  expect(actual).toEqual(expected);
});


test("getURLsFromHTML absolute", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a href="https://blog.boot.dev"><span>Boot.dev</span></a></body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/path/one"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML both absolute and relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody =
    `<html><body>` +
    `<a href="/path/one"><span>Boot.dev</span></a>` +
    `<a href="https://other.com/path/one"><span>Boot.dev</span></a>` +
    `</body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = [
    "https://blog.boot.dev/path/one",
    "https://other.com/path/one",
  ];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="https://blog.boot.dev/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody =
    `<html><body>` +
    `<img src="/logo.png" alt="Logo">` +
    `<img src="https://cdn.boot.dev/banner.jpg">` +
    `</body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = [
    "https://blog.boot.dev/logo.png",
    "https://cdn.boot.dev/banner.jpg",
  ];
  expect(actual).toEqual(expected);
});
