/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  data: expect.any(Object)
};

describe('Admin Routes', () => {
  let adminToken: string;
  // let refreshToken: string;

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const TEST_USERID = process.env.TEST_USER2_USERID;

  const getCookies = (cookies: any) => {
    const accessTokenMatch = cookies?.join('; ').match(/accessToken=([^;]+)/);
    // const refreshTokenMatch = cookies?.join('; ').match(/refreshToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : '';
    // refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : '';
    adminToken = accessToken;
  };

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const cookies = response.headers['set-cookie'];
    getCookies(cookies);
  });

  it('GET /admin/users - should fetch all users', async () => {
    const response = await api.get('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Retrieved all users successfully');
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('GET /admin/users - should fetch all posts', async () => {
    const response = await api.get('/admin/posts', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Retrieved all posts successfully');
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('GET /admin/user/:userId - should fetch a specific user profile', async () => {
    const response = await api.get(`/admin/user/${TEST_USERID}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Retrieved user profile successfully');
  });
});
