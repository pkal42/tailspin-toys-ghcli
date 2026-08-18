/**
 * Tests publisher data-access ordering and empty-database behavior.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { publishers } from '../../db/schema';
import { createTestDatabase } from '../../db/test-helpers';
import type { Database } from './db';
import { getAllPublishers } from './publishers';

describe('publisher data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns publishers ordered by name', async () => {
        await db.insert(publishers).values([
            { name: 'Zeta Games', description: 'zeta' },
            { name: 'Alpha Games', description: 'alpha' },
        ]);

        const all = await getAllPublishers(db);

        expect(all).toHaveLength(2);
        expect(all.map((publisher) => publisher.name)).toEqual(['Alpha Games', 'Zeta Games']);
        expect(all[0]).toEqual({ id: expect.any(Number), name: 'Alpha Games' });
    });

    it('returns an empty array when no publishers exist', async () => {
        expect(await getAllPublishers(db)).toEqual([]);
    });
});
