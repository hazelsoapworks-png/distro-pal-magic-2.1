import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

let isInitialized = false;

async function initGoogle() {
  if (!isInitialized) {
    try {
      await GoogleAuth.initialize({
        clientId: '10510289925-pnh0hgjsgao4tcbla1s0f44iq0kje4qk.apps.googleusercontent.com',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
        grantOfflineAccess: true,
      });
      isInitialized = true;
    } catch (e) {
      console.error("Google Auth Init Error:", e);
    }
  }
}

export async function signInWithGoogle() {
  try {
    await initGoogle();
    const googleUser = await GoogleAuth.signIn();
    
    if (googleUser && googleUser.email) {
      return {
        success: true,
        email: googleUser.email,
        name: googleUser.name || "",
        accessToken: googleUser.authentication?.accessToken || "",
      };
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }

  return {
    success: false,
    email: "",
  };
}

export async function signOutGoogle() {
  try {
    await initGoogle();
    await GoogleAuth.signOut();
    return true;
  } catch (error) {
    console.error("Google Sign-Out Error:", error);
    return false;
  }
}