import { expect, describe, it } from "vitest";
import { SourceVO } from "../../../../src/domain/value-objects/source.vo";

describe('SourceVO', () => {
    it('should throw an error if the source is invalid', () => {
        expect(() => SourceVO.create('invalid')).toThrow('Invalid source');
        expect(() => SourceVO.create('')).toThrow('Invalid source');
    });

    it('normalize the source', () => {
        const sourceVO = SourceVO.create(' EL_PaIS    ');
        expect(sourceVO.toPrimitive()).toBe('el_pais');
    });

    it('equals compares by value', () => {
        const a = SourceVO.create('el_pais');
        const b = SourceVO.create('el_pais');
        const c = SourceVO.create('el_mundo');
        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
      });

    it('should create a valid SourceVO', () => {
        const sourceVO = SourceVO.create('el_pais');
        expect(sourceVO).toBeDefined();
    });
});