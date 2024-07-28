// lib/googleAuth.js
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Import as jwtDecode

const clientId = '52487174713-1ufio4jkjpl2bgfka48teeb554an5thr.apps.googleusercontent.com';

export { GoogleOAuthProvider, GoogleLogin, jwtDecode, clientId };
