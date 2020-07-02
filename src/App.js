import React from 'react';
import AzureADApp, { AuthenticationState } from './AuthADApp';

function App(props) {
  if(props.error){
  return <div>error: {props.error} <button onClick={props.login}>login</button></div>
  }
  if(props.authenticationState === AuthenticationState.Authenticated){
    return <div>hello, <button onClick={props.logout}>logout</button></div>
  }
  if(props.authenticationState === AuthenticationState.UnAuthenticated && !props.forceLogin)
  return (<div>
      <button onClick={props.login}>Login</button>
  </div>);

  return <div>xxxxxxxxxxx</div>
}



export default AzureADApp(App);
