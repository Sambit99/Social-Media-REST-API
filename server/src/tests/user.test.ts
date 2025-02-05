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

describe('User Routes', () => {
  let authToken: string;
  const testUserId: string = '6788bb000c535bbd95effed5'; // Replace with a valid user ID

  const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
  const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    const cookies = response.headers['set-cookie'];
    const accessTokenMatch = cookies?.join('; ').match(/accessToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : '';
    authToken = accessToken;

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('message', 'Logged in successfully');
    expect(response.data.data).toHaveProperty('email', TEST_USER_EMAIL);
  });

  it('GET /users/self - should fetch the profile of the authenticated user', async () => {
    const response = await api.get('/users/self', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('message', 'Retrieved authenticated user profile successfully');
    expect(response.data.data).toHaveProperty('email', TEST_USER_EMAIL);
  });

  it('GET /users/:userId - should fetch a specific user profile', async () => {
    const response = await api.get(`/users/${testUserId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Retrieved user profile successfully');
    expect(response.data.data).toHaveProperty('_id', testUserId);
  });

  it('POST /users/:userId/follow - should follow a specific user', async () => {
    const response = await api.post(
      `/users/${testUserId}/follow`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Successfully followed the user');
    expect(response.data.data).toHaveProperty('followed', testUserId);
  });

  it('DELETE /users/:userId/unfollow - should un-follow a specific user', async () => {
    const response = await api.delete(`/users/${testUserId}/unfollow`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Successfully un-followed the user');
  });

  it('GET /users/:userId/followers - should get the list of followers of a user', async () => {
    const response = await api.get(`/users/${testUserId}/followers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('GET /users/:userId/following - should get the list of users that a specific user is following', async () => {
    const response = await api.get(`/users/${testUserId}/following`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it(`DELETE /users/self - should delete the authenticated user's account`, async () => {
    const response = await api.delete('/users/self', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Account deleted successfully');
  });
});
