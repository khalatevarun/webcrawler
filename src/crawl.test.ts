import { test, expect } from 'vitest';
import { getFirstParagraphFromHTML, getH1FromHTML, normalizeURL } from './crawl';

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

