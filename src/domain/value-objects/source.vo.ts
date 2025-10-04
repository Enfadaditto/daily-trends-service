import { z } from "zod";

export const SourceSchema = z.enum(['EL PAIS', 'EL MUNDO']);
export type SourceType = z.infer<typeof SourceSchema>;

export class SourceVO {
    private constructor(private readonly value: SourceType) {
        Object.freeze(this);
    }

    static create(input: string) {
        const parsed = SourceSchema.safeParse(input.trim().toUpperCase());
        if (!parsed.success) {
            throw new Error('Invalid source');
        }
        return new SourceVO(parsed.data);
    }

    toPrimitive() {
        return this.value;
    }
    
    equals(source: SourceVO) {
        return this.value === source.value;
    }
}