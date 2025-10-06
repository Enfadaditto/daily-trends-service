import { z } from "zod";

export const TopicSchema = z.string();

export class TopicVO {
    private constructor(private readonly value: string) {
        Object.freeze(this);
    }

    static create(input: string) {
        const parsed = TopicSchema.safeParse(input.trim().toLowerCase());
        if (!parsed.success) {
            throw new Error('Invalid topic');
        }
        return new TopicVO(parsed.data);
    }

    toPrimitive() {
        return this.value;
    }
    
    equals(source: TopicVO) {
        return this.value === source.value;
    }
}