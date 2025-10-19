import { test, expect } from 'vitest';
import { normalizeURL } from './crawl';

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