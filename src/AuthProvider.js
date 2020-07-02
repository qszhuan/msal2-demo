import * as msal from '@azure/msal-browser';

const config = {
  auth: {
    authority: process.env.REACT_APP_APP_AUTHORITY,
    clientId: process.env.REACT_APP_APP_ID,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const loginRequest = {
  scopes: ['User.Read'],
};

const tokenRequest = {
  scopes: ['User.Read'],
};

const LoginType = {
  LoginRedirect: 0,
  LoginPopup: 1,
};

class AuthProvider extends msal.PublicClientApplication {
  constructor(logintype, config) {
    super(config);
    this.loginType = logintype;
  }

  async getToken(request, account) {
    let requestAccount = account;
    if (account == null) {
      const accounts = await super.getAllAccounts();
      if (accounts && accounts.length === 1) {
        requestAccount = accounts[0];
      }
    }
    request = {...request, account: requestAccount};

    return super.acquireTokenSilent(request).catch((error) => {
      if (error instanceof msal.InteractionRequiredAuthError) {
        if (this.loginType === LoginType.LoginRedirect) {
          return super.acquireTokenRedirect(request);
        } 
        else {
          return super.acquireTokenPopup(request);
        }
      }
      throw error;
    });
  }

  _handleResponse(tokenResponse) {
    if (tokenResponse && tokenResponse.account) {
      return tokenResponse;
    }

    const accounts = super.getAllAccounts();
    if (accounts && accounts.length === 1) {
      return this.getToken(loginRequest, accounts[0]).then((response) =>
        this._handleResponse(response)
      )
      .catch(error =>{
        if(error instanceof msal.AuthError){
          console.error('Error occured during getToken', error);
        }
        throw error;
      });
    
    }else if(accounts === null){
      // this.login();
    }

    return tokenResponse;
    
  }
  // use this promise to handle the response and error.
  async handleRedirectPromise() {
    return super.handleRedirectPromise()
    .then((response) => this._handleResponse(response))
    ;
  }

  async login() {
    if (this.loginType === LoginType.LoginPopup) {
      return super.loginPopup(loginRequest);
    } else if (this.loginType === LoginType.LoginRedirect) {
      return super.loginRedirect(loginRequest);
    }
  }

  async logout() {
    sessionStorage.clear();
    super.logout();
  }
}

const authProvider = new AuthProvider(LoginType.LoginRedirect, config);

export {authProvider, tokenRequest, loginRequest};
