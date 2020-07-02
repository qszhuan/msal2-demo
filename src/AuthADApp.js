import React, { useState, useEffect, useCallback } from "react";
import {
    authProvider
} from "./AuthProvider";


const AuthenticationState = {
    Authenticated : "Authenticated",
    UnAuthenticated: "UnAuthenticated",
    InProgress: "InProgress"
};

const AzureADApp = (Component) => {
    const AzureAdAppComponent = ({forceLogin, ...otherProps}) => {

        const [authenticationState, setAuthenticationState] = useState(AuthenticationState.UnAuthenticated);
        const [account, setAccount] = useState(null);
        const [accessToken, setAccessToken] = useState(null);
        const [roles, setRoles] = useState(null);
        const [error, setError] = useState(null);

        const loginCallBack = useCallback(
            () => {
                if(authenticationState !== AuthenticationState.UnAuthenticated || error){
                    return;
                }
                setAuthenticationState(AuthenticationState.InProgress);
                authProvider.login();
            },
            [authenticationState, error],
        )

        async function logout(){
            localStorage.clear();
            authProvider.logout();
        }
        
        useEffect(() =>{
            function handleResponse(tokenResponse){
                if(tokenResponse){
                    setAccount(tokenResponse.account);
                    setAuthenticationState(AuthenticationState.Authenticated);
                    if(tokenResponse.idTokenClaims){
                        setRoles(tokenResponse.idTokenClaims.roles)
                    }
                    setAccessToken(tokenResponse.accessToken)
                }else if(forceLogin){
                    loginCallBack();
                }
            }

            authProvider.handleRedirectPromise()
            .then(handleResponse)
            .catch(error => {
                setAuthenticationState(AuthenticationState.UnAuthenticated);
                console.log("error happened", error);
                setError(error.errorMessage);
            });
        }, [forceLogin, loginCallBack]);

      return <Component 
      {...otherProps}
      forceLogin={forceLogin}
      account={account}
      roles={roles}
      accessToken={accessToken}
      authenticationState={authenticationState}
      error={error}
      login={loginCallBack}
      logout={logout}
      />;
    }
    return AzureAdAppComponent;
  }
export {AuthenticationState}
export default AzureADApp;
