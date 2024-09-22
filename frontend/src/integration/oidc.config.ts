export const oidcConfig = {
  authority: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_7SEHafDKv',
//   "https://cognito-idp.{REGION}.amazonaws.com/{USERPOOLID}/.well-known/jwks.json"
  client_id: '5bba5vn7tfk4frne2ne990i4e3',
//   client_secret: 'none'
  redirect_uri: 'https://next.scoti.au/callback',
  silent_redirect_uri: 'https://next.scoti.au/callback',
  post_logout_redirect_uri: 'https://next.scoti.au',
  responseType: 'code',
  scope: 'openid profile email',
  cognito_domain: "https://garib.auth.ap-southeast-2.amazoncognito.com"
};
