/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import api from '../util/AxiosInstance';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

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

describe('Post Routes', () => {
  let authToken: string;
  let postId: string;

  // const TEST_USER_USERID = process.env.TEST_USER2_USERID;
  // const TEST_USER_USERNAME = process.env.TEST_USER2_USERNAME;
  const TEST_USER_EMAIL = process.env.TEST_USER2_EMAIL;
  const TEST_USER_PASSWORD = process.env.TEST_USER2_PASSWORD;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    const cookies = response.headers['set-cookie'];
    const accessTokenMatch = cookies?.join('; ').match(/accessToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : '';
    authToken = accessToken;
  });

  it('POST /posts - should create a new post', async () => {
    const formData = new FormData();

    formData.append('imageFile', fs.createReadStream(path.join(__dirname, '../../public/Dummy Pic 1.jpg')));
    formData.append('content', 'Some dummy content');
    const response = await api.post('/posts', formData, {
      headers: { Authorization: `Bearer ${authToken}`, ...formData.getHeaders() }
    });

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Post created successfully');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    postId = response.data.data._id;
  });

  it('GET /posts - should fetch all posts', async () => {
    const response = await api.get('/posts', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Retrieved all posts successfully');
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('POST /posts/:postId/like - should like a post', async () => {
    const response = await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${authToken}` } });

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Post liked successfully');
  });

  it('DELETE /posts/:postId - should delete a post', async () => {
    const response = await api.delete(`/posts/${postId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Post deleted successfully');
  });
});
