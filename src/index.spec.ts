import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { server } from './index';

describe('aPI System Information (sans mocks)', () => {
  it('gET /api/v1/sysinfo - doit renvoyer les vraies données de la machine', async () => {
    expect.assertions(2);

    const response = await request(server)
      .get('/api/v1/sysinfo')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cpu');
  }, 10000);

  it('gET /route-inconnue - doit renvoyer 404', async () => {
    expect.assertions(1);

    const response = await request(server).get('/route-inconnue').expect(404);

    expect(response.body).toStrictEqual({
      error: "Qu'est ce que tu cherches ici toi",
    });
  });
});
