import pool from '../../db/postgres';
import { deliverOrdersBatch, haversineMeters, DELIVERY_RADIUS_M } from '../delivery';

jest.mock('../../db/postgres');

const mockPool = pool as unknown as {
  connect: jest.Mock;
  query?: jest.Mock;
};

describe('delivery service', () => {
  let clientMock: any;

  beforeEach(() => {
    clientMock = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValue(clientMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('haversineMeters basic', () => {
    const d = haversineMeters(55.75, 37.61, 55.75, 37.62);
    expect(typeof d).toBe('number');
    expect(d).toBeGreaterThan(0);
  });

  test('deliverOrdersBatch: delivers order within radius', async () => {
    const order = { id: 'o1', delivery_lat: 55.75, delivery_lng: 37.61, assigned_to: 'c1', status: 'assigned' };
    // SELECT returns one row
    clientMock.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [order] }) // SELECT
      .mockResolvedValueOnce({}) // UPDATE
      .mockResolvedValueOnce({}); // COMMIT

    const results = await deliverOrdersBatch('c1', ['o1'], { lat: 55.75, lng: 37.6101 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('o1');
    expect(results[0].success).toBe(true);
  });

  test('deliverOrdersBatch: too far returns failure', async () => {
    const order = { id: 'o2', delivery_lat: 55.75, delivery_lng: 37.61, assigned_to: 'c1', status: 'assigned' };
    clientMock.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [order] }) // SELECT
      .mockResolvedValueOnce({}) // COMMIT
      ;
    const results = await deliverOrdersBatch('c1', ['o2'], { lat: 56.0, lng: 38.0 });
    expect(results[0].success).toBe(false);
    expect(results[0].reason).toMatch(/too_far/);
  });
});