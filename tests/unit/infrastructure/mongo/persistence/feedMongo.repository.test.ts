import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FeedMongoRepository } from '../../../../../src/infrastructure/adapters/persistence/mongo/repositories/feedMongo.repository';
import * as ModelModule from '../../../../../src/infrastructure/adapters/persistence/mongo/models/feed.schema';
import * as MapperModule from '../../../../../src/infrastructure/adapters/persistence/mongo/mappers/feed.mapper';

describe('FeedMongoRepository', () => {
  const repo = new FeedMongoRepository();

  let toPersistenceSpy: any;
  let toEntitySpy: any;
  let updateOneSpy: any;
  let bulkWriteSpy: any;
  let findByIdSpy: any;
  let findOneSpy: any;
  let findSpy: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    toPersistenceSpy = vi
      .spyOn(MapperModule.FeedMapper, 'toPersistence')
      .mockImplementation(() => ({ url: 'https://url' } as any));
    toEntitySpy = vi
      .spyOn(MapperModule.FeedMapper, 'toEntity')
      .mockImplementation((doc: any) => ({ __entity: true, doc } as any));

    updateOneSpy = vi.spyOn(ModelModule.FeedMongoModel, 'updateOne' as any);
    bulkWriteSpy = vi.spyOn(ModelModule.FeedMongoModel, 'bulkWrite' as any);
    findByIdSpy = vi.spyOn(ModelModule.FeedMongoModel, 'findById' as any);
    findOneSpy = vi.spyOn(ModelModule.FeedMongoModel, 'findOne' as any);
    findSpy = vi.spyOn(ModelModule.FeedMongoModel, 'find' as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('save: returns upsertedId when upsert occurs', async () => {
    updateOneSpy.mockResolvedValue({
      upsertedCount: 1, modifiedCount: 0, upsertedId: { toString: () => 'abc' },
    } as any);

    const id = await repo.save({} as any);
    expect(id).toBe('abc');
    expect(ModelModule.FeedMongoModel.updateOne).toHaveBeenCalledWith(
      { url: 'https://url' }, expect.any(Object), { upsert: true }
    );
  });

  it('save: returns "" when only modified (no upsertedId)', async () => {
    updateOneSpy.mockResolvedValue({
      upsertedCount: 0, modifiedCount: 2, upsertedId: undefined,
    } as any);

    const id = await repo.save({} as any);
    expect(id).toBe('');
  });

  it('save: throws when nothing is modified or upserted', async () => {
    updateOneSpy.mockResolvedValue({
      upsertedCount: 0, modifiedCount: 0,
    } as any);

    await expect(repo.save({} as any)).rejects.toThrow('Failed to save feed');
  });

  it('upsertMany: calculates number and ids from bulkWrite', async () => {
    bulkWriteSpy.mockResolvedValue({
      upsertedCount: 2,
      modifiedCount: 3,
      upsertedIds: {
        0: { toString: () => 'idA' },
        5: { toString: () => 'idB' },
      },
    } as any);

    const res = await repo.upsertMany([{} as any, {} as any]);
    expect(res).toEqual({ number: 5, ids: ['idA', 'idB'] });
    expect(ModelModule.FeedMongoModel.bulkWrite).toHaveBeenCalledWith(expect.any(Array));
  });

  it('findById: returns entity when exists and null when not', async () => {
    findByIdSpy.mockResolvedValueOnce({ _id: 'x' } as any);
    const a = await repo.findById('x');
    expect((a as any).__entity).toBe(true);

    findByIdSpy.mockResolvedValueOnce(null as any);
    const b = await repo.findById('y');
    expect(b).toBeNull();
  });

  it('findByUrl: returns entity when exists and null when not', async () => {
    findOneSpy.mockResolvedValueOnce({ url: 'u' } as any);
    const a = await repo.findByUrl('u');
    expect((a as any).__entity).toBe(true);

    findOneSpy.mockResolvedValueOnce(null as any);
    const b = await repo.findByUrl('v');
    expect(b).toBeNull();
  });

  it('find: maps a list of documents to entities', async () => {
    findSpy.mockResolvedValue([{ _id: 1 } as any, { _id: 2 } as any]);
    const res = await repo.find({} as any);
    expect(res).toHaveLength(2);
    expect(MapperModule.FeedMapper.toEntity).toHaveBeenCalledTimes(2);
  });
});