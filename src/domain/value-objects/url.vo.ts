import { z } from "zod";

export const UrlSchema = z.url();

export class UrlVO {
    private constructor(private readonly value: string) {
        Object.freeze(this);
    }

    static create(input: string) {
        const parsed = UrlSchema.safeParse(input);
        if (!parsed.success) {
            throw new Error('Invalid url');
        }
        return new UrlVO(parsed.data);
    }

    toPrimitive() {
        return this.value;
    }
    
    equals(url: UrlVO) {
        return this.value === url.value;
    }
}