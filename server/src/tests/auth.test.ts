/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  message: expect.any(String),
  data: expect.any(Object)
};

const HttpErrorObject = {
  success: expect.any(Boolean),
  status: expect.any(Number),
  request: {
    ip: expect.any(String),
    method: expect.any(String),
    url: expect.any(String)
  },
  message: expect.any(String),
  data: expect.any(Object),
  trace: expect.any(Object)
};

describe('Authentication Routes', () => {
  let authToken: string;
  let refreshToken: string;

  const TEST_USER_USERNAME = process.env.TEST_USER_USERNAME;
  const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
  const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
  const TEST_USER_FULLNAME = process.env.TEST_USER_FULLNAME;

  const getCookies = (cookies: any) => {
    const accessTokenMatch = cookies?.join('; ').match(/accessToken=([^;]+)/);
    const refreshTokenMatch = cookies?.join('; ').match(/refreshToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : '';
    refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : '';
    authToken = accessToken;
  };

  it('POST /auth/signup - should register a new user', async () => {
    const response = await api.post('/auth/signup', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      username: TEST_USER_USERNAME,
      fullname: TEST_USER_FULLNAME
    });

    const cookies = response.headers['set-cookie'];
    getCookies(cookies);

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'User registered successfully');
  });

  it(`POST /auth/signup - should'nt register a user with same email`, async () => {
    try {
      await api.post('/auth/signup', {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        username: 'some other username'
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'User with username/email already exists. Please login');
    }
  });

  it(`POST /auth/signup - should'nt register a user with same username`, async () => {
    try {
      await api.post('/auth/signup', {
        email: 'someotherEmail@example.com',
        password: TEST_USER_PASSWORD,
        username: TEST_USER_USERNAME
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'User with username/email already exists. Please login');
    }
  });

  it(`POST /auth/login - shouldn't log in a user having wrong password`, async () => {
    try {
      await api.post('/auth/login', {
        email: TEST_USER_EMAIL,
        password: 'wrong password'
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'Incorrect credentials or user not found');
    }
  });

  it(`POST /auth/login - shouldn't log in a user having wrong email`, async () => {
    try {
      await api.post('/auth/login', {
        email: 'wrongmail@example.com',
        password: TEST_USER_PASSWORD
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'Incorrect credentials or user not found');
    }
  });

  it('POST /auth/login - should log in a user', async () => {
    const response = await api.post('/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    const cookies = response.headers['set-cookie'];
    getCookies(cookies);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Logged in successfully');
  });

  it('POST /auth/refresh - should refresh authentication token', async () => {
    const response = await api.post('/auth/refresh', { refreshToken });

    const cookies = response.headers['set-cookie'];
    getCookies(cookies);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Token refreshed successfully');
  });

  it('POST /auth/update-password - should update the password', async () => {
    const response = await api.post(
      '/auth/update-password',
      {
        oldPassword: TEST_USER_PASSWORD,
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Password updated successfully');
  });

  it('POST /auth/update-password - should update the password to the old one', async () => {
    const response = await api.post(
      '/auth/update-password',
      {
        oldPassword: 'newPassword123',
        newPassword: TEST_USER_PASSWORD,
        confirmPassword: TEST_USER_PASSWORD
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Password updated successfully');
  });

  it('POST /auth/logout - should logout current user', async () => {
    const response = await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${authToken}` } });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Logged out successfully');
  });
});
