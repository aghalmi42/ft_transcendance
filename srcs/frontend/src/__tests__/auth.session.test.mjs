import test from 'node:test';
import assert from 'node:assert';

class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

class TestAuthService {
  constructor(storage) {
    this.storage = storage;
    this.token = storage.getItem('token');
    this.backendAvailable = true;
    this.lastBackendFailure = 0;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      this.storage.setItem('token', token);
    } else {
      this.storage.removeItem('token');
    }
  }

  getToken() {
    return this.token || this.storage.getItem('token');
  }

  saveLocalUser(user) {
    this.storage.setItem('active_user', JSON.stringify(user));
  }

  getLocalUser() {
    const raw = this.storage.getItem('active_user');
    return raw ? JSON.parse(raw) : null;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  markBackendOffline() {
    this.backendAvailable = false;
    this.lastBackendFailure = Date.now();
  }

  isBackendOnline() {
    if (!this.backendAvailable && Date.now() - this.lastBackendFailure < 60000) {
      return false;
    }
    return true;
  }
}

test('Auth Lifecycle - Token persistence and Bearer header generation', () => {
  const storage = new MockStorage();
  const auth = new TestAuthService(storage);

  assert.strictEqual(auth.getToken(), null);
  assert.strictEqual(auth.getHeaders().Authorization, undefined);

  auth.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo');
  assert.strictEqual(auth.getToken(), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo');
  assert.strictEqual(auth.getHeaders().Authorization, 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo');

  auth.setToken(null);
  assert.strictEqual(auth.getToken(), null);
  assert.strictEqual(auth.getHeaders().Authorization, undefined);
});

test('Auth Lifecycle - User session caching across reloads', () => {
  const storage = new MockStorage();
  const auth1 = new TestAuthService(storage);

  const mockUser = {
    id: 'usr_42',
    username: 'Marvin',
    email: 'marvin@42.fr',
    status: 'ONLINE',
  };

  auth1.saveLocalUser(mockUser);
  assert.deepStrictEqual(auth1.getLocalUser(), mockUser);

  const auth2 = new TestAuthService(storage);
  assert.deepStrictEqual(auth2.getLocalUser(), mockUser);
});

test('Auth Lifecycle - Offline detection and 60-second bypass caching', () => {
  const storage = new MockStorage();
  const auth = new TestAuthService(storage);

  assert.strictEqual(auth.isBackendOnline(), true);

  auth.markBackendOffline();
  assert.strictEqual(auth.isBackendOnline(), false);
});
