/* eslint-disable @typescript-eslint/no-explicit-any */
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
  message: expect.any(String)
};

describe('User Routes', () => {
  let authToken: string;
  const testUserId: string = '6788bb000c535bbd95effed5'; // Replace with a valid user ID

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'testuser@example.com',
      password: 'password123'
    });

    const cookies = response.headers['set-cookie'];
    const accessTokenMatch = cookies?.join('; ').match(/accessToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : '';
    authToken = accessToken;

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('message', 'Logged in successfully');
    expect(response.data.data).toHaveProperty('email', 'testuser@example.com');
  });

  it('should fetch the profile of the authenticated user', async () => {
    const response = await api.get('/users/self', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('message', 'Retrieved authenticated user profile successfully');
    expect(response.data.data).toHaveProperty('email', 'testuser@example.com');
  });

  it('should fetch a specific user profile', async () => {
    const response = await api.get(`/users/${testUserId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Retrieved user profile successfully');
    expect(response.data.data).toHaveProperty('_id', testUserId);
  });

  it('should follow a specific user', async () => {
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

  it('should un-follow a specific user', async () => {
    const response = await api.delete(`/users/${testUserId}/unfollow`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Successfully un-followed the user');
  });

  it('should get the list of followers of a user', async () => {
    const response = await api.get(`/users/${testUserId}/followers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should get the list of users that a specific user is following', async () => {
    const response = await api.get(`/users/${testUserId}/following`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it(`should delete the authenticated user's account`, async () => {
    const response = await api.delete('/users/self', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Account deleted successfully');
  });
});
