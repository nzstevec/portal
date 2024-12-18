export const oidcConf = {
  authority: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_7SEHafDKv',
  client_id: '5bba5vn7tfk4frne2ne990i4e3',
  redirect_uri: 'https://next.scoti.au/callback',
  silent_redirect_uri: 'https://next.scoti.au/callback',
  post_logout_redirect_uri: 'https://next.scoti.au/logout',
  responseType: 'code',
  scope: 'openid profile email',
  cognito_domain: "https://garib.auth.ap-southeast-2.amazoncognito.com"
};

export const oidcConfigLocal = {
    authority: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_7SEHafDKv',
    client_id: '5bba5vn7tfk4frne2ne990i4e3',
    redirect_uri: 'http://localhost:8080/callback',
    silent_redirect_uri: 'http://localhost:8080/callback',
    post_logout_redirect_uri: 'http://localhost:8080/logout',
    responseType: 'code',
    scope: 'openid profile email',
    cognito_domain: "https://garib.auth.ap-southeast-2.amazoncognito.com"
  };

export const config = {
  allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf','text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  getPresignedUrlEndpoint: '/api/presigned-url',
  getUploadedFilenamesEndpoint: '/api/uploaded-filenames',
  deleteUploadedFilesEndpoint: '/api/uploaded-files',
  postFeedbackEndpoint: '/api/feedback',
  postAiQueryEndpoint: '/api/ai-query',
  postAiDocAuditEndpoint: '/api/ai-doc-audit',
  sseAiDocAuditEndpoint: '/api/ai-doc-audit',
}