import pool from '../../db/postgres';
import { assignOrdersToCourier } from '../assignment';

jest.mock('../../db/postgres');

const mockPool = pool as unknown as { connect: jest.Mock; query: jest.Mock };

describe('assignment service', () => {
  let clientMock: any;

  beforeEach(() => {
    clientMock = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValue(clientMock);
    // pool.query used after commit to fetch rows
    mockPool.query = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('assignOrdersToCourier: no ready orders', async () => {
    clientMock.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 0, rows: [] }) // primary select
      .mockResolvedValueOnce({}); // COMMIT
    const res = await assignOrdersToCourier('courier1');
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(0);
  });

  test('assignOrdersToCourier: assigns primary and returns rows', async () => {
    const primary = { id: 'p1', delivery_lat: 55.75, delivery_lng: 37.61, created_at: new Date().toISOString() };
    const candidate = { id: 'c1', delivery_lat: 55.7501, delivery_lng: 37.6101, created_at: new Date().toISOString() };

    clientMock.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 1, rows: [primary] }) // primary select
      .mockResolvedValueOnce({ rows: [candidate] }) // candidates select
      .mockResolvedValueOnce({}) // update assigned
      .mockResolvedValueOnce({}); // COMMIT

    // pool.query used to fetch final rows
    mockPool.query.mockResolvedValueOnce({ rows: [primary, candidate] });

    const assigned = await assignOrdersToCourier('courier1');
    expect(assigned).toHaveLength(2);
    expect(assigned.map((r: any) => r.id)).toEqual(expect.arrayContaining(['p1', 'c1']));
  });
});