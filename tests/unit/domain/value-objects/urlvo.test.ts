import { expect, describe, it } from "vitest";
import { UrlVO } from "../../../../src/domain/value-objects/url.vo";

describe('UrlVO', () => {
    it('should throw an error if the url is invalid', () => {
        expect(() => UrlVO.create('invalid')).toThrow('Invalid url');
        expect(() => UrlVO.create('')).toThrow('Invalid url');
    });

    it('normalize the url', () => {
        const urlVO = UrlVO.create('  http://www.GOOGLE.com    ');
        expect(urlVO.toPrimitive()).toBe('http://www.google.com');
    });

    it('equals compares by value', () => {
        const a = UrlVO.create('https://www.google.com');
        const b = UrlVO.create('https://www.google.com');
        const c = UrlVO.create('https://www.example.com');
        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
    });

    it('should create a valid UrlVO', () => {
        const urlVO = UrlVO.create('https://www.google.com');
        expect(urlVO).toBeDefined();
    });
});