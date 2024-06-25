import { TokenCache, TokenStore } from '@commercetools/sdk-client-v2';
import { cacheName } from '../src/modules/constantLocalStorage';

export class MyTokenCache implements TokenCache {
  cacheName: string;

  private myCache: TokenStore = {
    token: '',
    expirationTime: 0,
    refreshToken: undefined,
  };

  constructor(cacheName: string) {
    this.cacheName = cacheName;
    this.loadToken();
  }

  private loadToken() {
    const storedToken = localStorage.getItem(this.cacheName);
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken) as TokenStore;
        if (parsedToken && parsedToken.token) {
          this.myCache = parsedToken;
        } else {
          this.clearToken();
        }
      } catch (error) {
        console.error('Error parsing token from localStorage:', error);
        this.clearToken();
      }
    } else {
      this.clearToken();
    }
  }

  private saveToken() {
    console.log(this.cacheName);
    if (this.cacheName === cacheName.AnonymUser) {
      localStorage.removeItem(cacheName.Login);
    }
    if (this.cacheName === cacheName.Login) {
      localStorage.removeItem(cacheName.AnonymUser);
    }
    localStorage.setItem(this.cacheName, JSON.stringify(this.myCache));
  }

  private clearToken() {
    this.myCache = {
      token: '',
      expirationTime: 0,
      refreshToken: undefined,
    };
    localStorage.removeItem(this.cacheName);
  }

  public get(): TokenStore {
    return this.myCache;
  }

  public set(newCache: TokenStore): void {
    this.myCache = newCache;
    this.saveToken();
  }

  public clearIfExpired(): void {
    const currentTime = Date.now();
    if (this.myCache.expirationTime < currentTime) {
      console.log('Token expired, clearing LocalStorage...');
      this.clearToken();
    }
  }
}

const anonymCache = new MyTokenCache(cacheName.AnonymUser);
const loginCache = new MyTokenCache(cacheName.Login);

export function getToken(): string | null {
  const myToken =
    localStorage.getItem(cacheName.Login) ||
    localStorage.getItem(cacheName.AnonymUser);
  if (myToken) {
    try {
      const token: TokenStore = JSON.parse(myToken) as TokenStore;
      return token?.token;
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  return null;
}

export function getRefreshToken(): string | null {
  anonymCache.clearIfExpired();
  loginCache.clearIfExpired();

  const myToken =
    localStorage.getItem(cacheName.Login) ||
    localStorage.getItem(cacheName.AnonymUser);
  if (myToken) {
    try {
      const token: TokenStore = JSON.parse(myToken) as TokenStore;
      if (token.refreshToken && token.expirationTime > Date.now()) {
        return token.refreshToken;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  return null;
}

export function isExist() {
  const myCash = localStorage.getItem(cacheName.Login);
  return !!myCash;
}

export function isExistAnonymToken() {
  const myCash = localStorage.getItem(cacheName.AnonymUser);
  return !!myCash;
}
