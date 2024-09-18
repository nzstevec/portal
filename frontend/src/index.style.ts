import { createGlobalStyle } from 'styled-components/macro';

export const GlobalStyle = createGlobalStyle`

  @font-face {
      font-family: 'Nasalization';
      font-style: normal;
      font-display: swap;
      src: url('https://portal-scoti-cdn-bucket.s3.ap-southeast-2.amazonaws.com/fonts/Nasalization-Regular.woff') format('woff'),
          url('https://portal-scoti-cdn-bucket.s3.ap-southeast-2.amazonaws.com/fonts/Nasalization-Regular.woff2') format('woff2');
    }

  * {
      font-family: 'Nasalization';
  }

  body {
    margin: 0;
    /* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif; */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;
