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

describe('Comment Routes', () => {
  let authToken: string;
  let commentId: string;
  const postId = process.env.TEST_POST_ID; // Replace with a valid post ID

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

  it('POST /posts/:postId/comment - should add a comment to a post', async () => {
    const response = await api.post(
      `/posts/${postId}/comment`,
      { content: 'This is a test comment' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('message', 'Comment added successfully');
    commentId = response.data.data._id;
  });

  it('POST /comments/:commentId/like - should like a comment', async () => {
    const response = await api.post(
      `/comments/${commentId}/like`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('message', 'Comment liked successfully');
  });

  it('POST /comments/:commentId/like - should un-like a comment', async () => {
    const response = await api.post(
      `/comments/${commentId}/like`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Comment un-liked successfully');
  });

  it('DELETE /comments/:commentId - should delete a comment', async () => {
    const response = await api.delete(`/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Comment deleted successfully');
  });
});
