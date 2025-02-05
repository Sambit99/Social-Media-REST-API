/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import api from '../util/AxiosInstance';

const HttpResponseObject = {
  success: expect.any(Boolean),
  status: expect.any(Number),
  request: {
    ip: expect.any(String),
    method: expect.any(String),
    url: expect.any(String)
  },
  message: expect.any(String),
  data: {}
};

describe('Api Routes', () => {
  it('GET /self - should get the self route', async () => {
    const response = await api.get('/self');

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toMatchObject(HttpResponseObject);
  });

  it('GET /health - should get the health route', async () => {
    const response = await api.get('/health');

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('message', 'Success: The request was processed successfully.');
  });
});
