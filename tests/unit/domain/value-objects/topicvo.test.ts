import { expect, describe, it } from "vitest";
import { TopicVO } from "../../../../src/domain/value-objects/topic.vo";

describe('TopicVO', () => {
    it('normalize the topic', () => {
        const topicVO = TopicVO.create(' pOLitiCs    ');
        expect(topicVO.toPrimitive()).toBe('politics');
    });

    it('equals compares by value', () => {
        const a = TopicVO.create('politics');
        const b = TopicVO.create('politics');
        const c = TopicVO.create('economy');
        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
    });

    it('should create a valid TopicVO', () => {
        const topicVO = TopicVO.create('politics');
        expect(topicVO).toBeDefined();
    });
});