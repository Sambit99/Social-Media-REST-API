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

  const getCookies = (cookies: any) => {
    const accessTokenMatch = cookies?.join('; ').match(/accessToken=([^;]+)/);
    const refreshTokenMatch = cookies?.join('; ').match(/refreshToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : '';
    refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : '';
    authToken = accessToken;
  };

  it('should register a new user', async () => {
    const response = await api.post('/auth/signup', {
      email: 'testuser@example.com',
      password: 'password123',
      username: 'TestUser-1',
      fullname: 'Test User'
    });

    const cookies = response.headers['set-cookie'];
    getCookies(cookies);

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'User registered successfully');
  });

  it(`should'nt register a user with same email`, async () => {
    try {
      await api.post('/auth/signup', {
        email: 'testuser@example.com',
        password: 'password123',
        username: 'TestUser-2'
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'User with username/email already exists. Please login');
    }
  });

  it(`should'nt register a user with same username`, async () => {
    try {
      await api.post('/auth/signup', {
        email: 'testuser2@example.com',
        password: 'password123',
        username: 'TestUser-1'
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'User with username/email already exists. Please login');
    }
  });

  it(`shouldn't log in a user having wrong password`, async () => {
    try {
      await api.post('/auth/login', {
        email: 'testuser@example.com',
        password: 'password1234'
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'Incorrect credentials or user not found');
    }
  });

  it(`shouldn't log in a user having wrong email`, async () => {
    try {
      await api.post('/auth/login', {
        email: 'testuser1@example.com',
        password: 'password123'
      });
    } catch (error) {
      const err = error as any;
      expect(err.response.status).toBe(400);
      expect(err.response.data).toMatchObject(HttpErrorObject);
      expect(err.response.data).toHaveProperty('message', 'Incorrect credentials or user not found');
    }
  });

  it('should log in a user', async () => {
    const response = await api.post('/auth/login', {
      email: 'testuser@example.com',
      password: 'password123'
    });

    const cookies = response.headers['set-cookie'];
    getCookies(cookies);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Logged in successfully');
  });

  it('should refresh authentication token', async () => {
    const response = await api.post('/auth/refresh', { refreshToken });

    const cookies = response.headers['set-cookie'];
    getCookies(cookies);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Token refreshed successfully');
  });

  it('should update the password', async () => {
    const response = await api.post(
      '/auth/update-password',
      {
        oldPassword: 'password123',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Password updated successfully');
  });

  it('should update the password to the old one', async () => {
    const response = await api.post(
      '/auth/update-password',
      {
        oldPassword: 'newPassword123',
        newPassword: 'password123',
        confirmPassword: 'password123'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Password updated successfully');
  });

  it('should logout current user', async () => {
    const response = await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${authToken}` } });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(HttpResponseObject);
    expect(response.data).toHaveProperty('message', 'Logged out successfully');
  });
});
