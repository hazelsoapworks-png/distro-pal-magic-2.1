import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

let isInitialized = false;

async function initGoogle() {
  if (!isInitialized) {
    try {
      await GoogleAuth.initialize({
        clientId: '1051010289925-pnh0hgjsgao4tcbla1s0f44iq0kje4qk.apps.googleusercontent.com',
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

// ==========================================
// GOOGLE DRIVE SYNC FUNCTIONS (Multi-Device Safe)
// ==========================================

export async function getValidAccessToken(): Promise<string | null> {
  try {
    await initGoogle();
    // यह बैकग्राउंड में बिना UI खोले नया टोकन ले आता है
    const auth = await GoogleAuth.refresh();
    return auth.accessToken || null;
  } catch (e) {
    console.error("Token refresh failed", e);
    return null;
  }
}

export async function uploadToGoogleDrive(jsonData: string, accessToken: string): Promise<boolean> {
  try {
    // 1. चेक करें कि ड्राइव में फाइल पहले से है या नहीं (चाहे किसी भी डिवाइस से बनाई गई हो)
    const searchRes = await fetch("https://www.googleapis.com/drive/v3/files?q=name='DPAS_Backup.json' and trashed=false&spaces=drive", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    const fileId = searchData.files && searchData.files.length > 0 ? searchData.files[0].id : null;

    if (fileId) {
      // 2A. अगर फाइल पहले से मौजूद है, तो सीधे Plain Text/JSON से उसका कंटेंट अपडेट (Patch) करें
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: jsonData
      });
      return uploadRes.ok;
    } else {
      // 2B. अगर फाइल अभी तक नहीं बनी है, तो पहले मेटाडाटा रजिस्टर करें
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'DPAS_Backup.json', mimeType: 'application/json' })
      });
      
      if (!createRes.ok) return false;
      const fileData = await createRes.json();
      const newFileId = fileData.id;

      // 3. फिर उस नई फाइल पर डेटा अपलोड करें
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${newFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: jsonData
      });
      return uploadRes.ok;
    }
  } catch (e) {
    console.error("Upload to Drive failed", e);
    return false;
  }
}

export async function downloadFromGoogleDrive(accessToken: string): Promise<string | null> {
  try {
    // ड्राइव से हमेशा वही साझा (Shared/Same) फाइल ढूंढेगा जो दोनों डिवाइस इस्तेमाल कर रहे हैं
    const searchRes = await fetch("https://www.googleapis.com/drive/v3/files?q=name='DPAS_Backup.json' and trashed=false&spaces=drive", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    const fileId = searchData.files && searchData.files.length > 0 ? searchData.files[0].id : null;

    if (!fileId) return null;

    const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!downloadRes.ok) return null;
    return await downloadRes.text();
  } catch (e) {
    console.error("Download from Drive failed", e);
    return null;
  }
}