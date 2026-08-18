import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
    getGamesCount,
    getGamesPage,
    getGamesPageCount,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });
});

describe('games pagination helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns the total number of games', async () => {
        await seedGames(db, 5);
        expect(await getGamesCount(db)).toBe(5);
    });

    it('returns zero for an empty database', async () => {
        expect(await getGamesCount(db)).toBe(0);
    });

    it('computes the number of pages needed for a given page size', async () => {
        await seedGames(db, 5);
        expect(await getGamesPageCount(db, 2)).toBe(3);
        expect(await getGamesPageCount(db, 5)).toBe(1);
        expect(await getGamesPageCount(db, 10)).toBe(1);
    });

    it('returns at least one page when the database is empty', async () => {
        expect(await getGamesPageCount(db, 2)).toBe(1);
    });

    it('returns the requested page of games ordered by title', async () => {
        await seedGames(db, 5);
        const pageOne = await getGamesPage(db, 1, 2);
        const pageTwo = await getGamesPage(db, 2, 2);
        const pageThree = await getGamesPage(db, 3, 2);

        expect(pageOne.map((g) => g.title)).toEqual(['Game 01', 'Game 02']);
        expect(pageTwo.map((g) => g.title)).toEqual(['Game 03', 'Game 04']);
        expect(pageThree.map((g) => g.title)).toEqual(['Game 05']);
    });

    it('returns an empty array for a page beyond the last page', async () => {
        await seedGames(db, 2);
        const page = await getGamesPage(db, 5, 2);
        expect(page).toEqual([]);
    });

    it('defaults to GAMES_PER_PAGE when no page size is provided', async () => {
        await seedGames(db, 3);
        const page = await getGamesPage(db, 1);
        const all = await getAllGames(db);
        expect(page).toEqual(all);
    });
});
