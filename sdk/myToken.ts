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
      this.myCache = JSON.parse(storedToken) as TokenStore;
    }
  }

  saveToken() {
    if (this.cacheName === cacheName.AnonymUser) {
      localStorage.removeItem(cacheName.Login);
    }
    if (this.cacheName === cacheName.Login) {
      localStorage.removeItem(cacheName.AnonymUser);
    }
    localStorage.setItem(this.cacheName, JSON.stringify(this.myCache));
  }

  public get(): TokenStore {
    return this.myCache;
  }

  public set(newCache: TokenStore): void {
    Object.assign(this.myCache, newCache);
    this.myCache.expirationTime = Date.now() + newCache.expirationTime * 1000; // Assuming expires_in is in seconds
    this.saveToken();
  }
}

export function getToken() {
  const myToken =
    localStorage.getItem(cacheName.Login) ||
    localStorage.getItem(cacheName.AnonymUser);

  if (myToken) {
    const token: TokenStore = JSON.parse(myToken) as TokenStore;
    const currentTime = Date.now();

    if (token.expirationTime < currentTime) {
      console.log('Token expired, clearing LocalStorage...');
      clearLocalStorage();
      return null;
    }

    return token.token;
  }

  return null;
}

function clearLocalStorage() {
  localStorage.removeItem(cacheName.Login);
  localStorage.removeItem(cacheName.AnonymUser);
}

export function getRefreshToken() {
  const myToken =
    localStorage.getItem(cacheName.Login) ||
    localStorage.getItem(cacheName.AnonymUser);
  if (myToken) {
    const token: TokenStore = JSON.parse(myToken) as TokenStore;
    return token?.refreshToken || null; // Ensure handling for empty strings
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

// import { TokenCache, TokenStore } from '@commercetools/sdk-client-v2';
// import { cacheName } from '../src/modules/constantLocalStorage';
// import { authUrl, clientId, clientSecret } from './createClient';

// export class MyTokenCache implements TokenCache {
//   cacheName: string;

//   private myCache: TokenStore = {
//     token: '',
//     expirationTime: 0,
//     refreshToken: undefined,
//   };

//   constructor(cacheName: string) {
//     this.cacheName = cacheName;
//     this.loadToken();
//   }

//   private loadToken() {
//     const storedToken = localStorage.getItem(this.cacheName);
//     if (storedToken) {
//       this.myCache = JSON.parse(storedToken) as TokenStore;
//     }
//   }

//   private saveToken() {
//     if (this.cacheName === cacheName.AnonymUser) {
//       localStorage.removeItem(cacheName.Login);
//     }
//     if (this.cacheName === cacheName.Login) {
//       localStorage.removeItem(cacheName.AnonymUser);
//     }
//     localStorage.setItem(this.cacheName, JSON.stringify(this.myCache));
//   }

//   public refreshTokenStore() {
//     this.myCache = {
//       token: '',
//       expirationTime: 0,
//       refreshToken: undefined,
//     };
//     this.saveToken();
//   }

//   public clearLocalStorage() {
//     localStorage.removeItem(this.cacheName);
//   }

//   public get(): TokenStore {
//     return this.myCache;
//   }

//   public set(newCache: TokenStore): void {
//     Object.assign(this.myCache, newCache);
//     this.saveToken();
//   }

//   private async fetchNewToken(
//     grantType: string,
//     bodyInit?: URLSearchParams
//   ): Promise<void> {
//     const myHeaders = new Headers();
//     myHeaders.append(
//       'Authorization',
//       `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
//     );
//     myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

//     const response = await fetch(
//       `${authUrl}/oauth/token?grant_type=${grantType}`,
//       {
//         method: 'POST',
//         headers: myHeaders,
//         body: bodyInit,
//         redirect: 'follow',
//       }
//     );

//     if (!response.ok) {
//       throw new Error('Failed to fetch token');
//     }

//     const result = await response.json();
//     this.set({
//       token: result.access_token,
//       expirationTime: Date.now() + result.expires_in * 1000,
//       refreshToken: result.refresh_token,
//     });
//   }

//   public async refreshToken(): Promise<string> {
//     if (!this.myCache.refreshToken) {
//       this.clearLocalStorage();
//       throw new Error('No refresh token available');
//     }

//     try {
//       await this.fetchNewToken(
//         'refresh_token',
//         new URLSearchParams({ refresh_token: this.myCache.refreshToken! })
//       );
//       return this.myCache.token;
//     } catch (error) {
//       this.clearLocalStorage();
//       throw error;
//     }
//   }

//   public async getTokenWithRefresh(): Promise<string> {
//     if (Date.now() >= this.myCache.expirationTime) {
//       return await this.refreshToken();
//     }
//     return this.myCache.token;
//   }
// }

// export async function getToken(): Promise<string | null> {
//   const myToken =
//     localStorage.getItem(cacheName.Login) ||
//     localStorage.getItem(cacheName.AnonymUser);
//   if (myToken) {
//     const token: TokenStore = JSON.parse(myToken) as TokenStore;
//     const currentTime = Date.now();

//     if (token.expirationTime < currentTime) {
//       console.log('Token expired, attempting to refresh...');
//       const myTokenCache = new MyTokenCache(
//         localStorage.getItem(cacheName.Login)
//           ? cacheName.Login
//           : cacheName.AnonymUser
//       );
//       try {
//         return await myTokenCache.refreshToken();
//       } catch (error) {
//         console.log('Failed to refresh token, clearing LocalStorage...');
//         clearLocalStorage();
//         return null;
//       }
//     }

//     return token.token;
//   }

//   return null;
// }

// export function getRefreshToken(): string | null {
//   const myToken =
//     localStorage.getItem(cacheName.Login) ||
//     localStorage.getItem(cacheName.AnonymUser);
//   if (myToken) {
//     const token: TokenStore = JSON.parse(myToken) as TokenStore;
//     return token?.refreshToken;
//   }
//   return null;
// }

// export function isExist(): boolean {
//   return !!localStorage.getItem(cacheName.Login);
// }

// export function isExistAnonymToken(): boolean {
//   return !!localStorage.getItem(cacheName.AnonymUser);
// }

// function clearLocalStorage() {
//   localStorage.removeItem(cacheName.Login);
//   localStorage.removeItem(cacheName.AnonymUser);
// }

// import { authUrl, clientId, clientSecret } from './createClient';
// import { projectKey } from './createClient';

// export type CacheType = {
//   access_token: string;
//   expires_in: number;
//   refresh_token: string;
//   scope: string;
//   token_type: string;
//   expirationTime: number;
// };

// export const getMyToken = async (bodyInit?: {
//   username: string;
//   password?: string;
// }): Promise<void> => {
//   const changeToken = async () => {
//     const myCache: CacheType = {
//       access_token: '',
//       expires_in: 0,
//       refresh_token: '',
//       scope: 'manage_project:furniture',
//       token_type: 'Bearer',
//       expirationTime: 0,
//     };

//     const myHeaders = new Headers();
//     let raw: string | BodyInit = '';
//     let grant_type = 'client_credentials';
//     let projectkey = '';
//     myHeaders.append(
//       'Authorization',
//       `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
//     );
//     if (bodyInit) {
//       raw = JSON.stringify(bodyInit);
//       grant_type = `password&username=${bodyInit.username}&password=${bodyInit.password}`;
//       projectkey = `/${projectKey}/customers`;
//     }

//     try {
//       const response = await fetch(
//         `${authUrl}/oauth${projectkey}/token?grant_type=${grant_type}`,
//         {
//           method: 'POST',
//           headers: myHeaders,
//           body: raw,
//           redirect: 'follow',
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to fetch token');
//       }

//       const result = (await response.json()) as CacheType;
//       Object.assign(myCache, result);
//       myCache.expirationTime = Date.now() + result.expires_in * 1000;

//       if (!bodyInit) {
//         localStorage.setItem('anonymCache', JSON.stringify(myCache));
//         localStorage.removeItem('myCache');
//       } else {
//         localStorage.setItem('myCache', JSON.stringify(myCache));
//         localStorage.removeItem('anonymCache');
//       }
//     } catch (error) {
//       console.error('Error fetching token:', error);
//       throw error;
//     }
//   };

//   await changeToken();
// };

// export function getToken(): string | null {
//   const myToken =
//     localStorage.getItem('myCache') || localStorage.getItem('anonymCache');
//   if (myToken) {
//     const token: CacheType = JSON.parse(myToken) as CacheType;
//     const currentTime = Date.now();

//     if (token.expirationTime < currentTime) {
//       console.log('Token expired, clearing LocalStorage...');
//       clearLocalStorage();
//       return null;
//     }

//     return token.access_token;
//   }

//   return null;
// }

// export function isExist(): boolean {
//   return !!localStorage.getItem('myCache');
// }

// export function isExistAnonymToken(): boolean {
//   return !!localStorage.getItem('anonymCache');
// }

// export const refreshToken = async (): Promise<string> => {
//   const myCache = JSON.parse(
//     localStorage.getItem('myCache') || '{}'
//   ) as CacheType;

//   if (!myCache.refresh_token) {
//     throw new Error('No refresh token available');
//   }

//   const myHeaders = new Headers();
//   myHeaders.append(
//     'Authorization',
//     `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
//   );

//   try {
//     const response = await fetch(
//       `${authUrl}/oauth/token?grant_type=refresh_token&refresh_token=${myCache.refresh_token}`,
//       {
//         method: 'POST',
//         headers: myHeaders,
//         redirect: 'follow',
//       }
//     );

//     if (!response.ok) {
//       throw new Error('Failed to refresh token');
//     }

//     const result = (await response.json()) as CacheType;
//     Object.assign(myCache, result);
//     myCache.expirationTime = Date.now() + result.expires_in * 1000;
//     localStorage.setItem('myCache', JSON.stringify(myCache));

//     return myCache.access_token;
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     throw error;
//   }
// };

// const clearLocalStorage = () => {
//   localStorage.removeItem('myCache');
//   localStorage.removeItem('anonymCache');
// };
