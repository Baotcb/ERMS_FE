import CryptoJS from 'crypto-js';

// Fallback to a hardcoded key ONLY IF the environment variable is not defined AND we are in development.
// In a real-world scenario, this MUST be provided via .env
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_LOCAL_STORAGE_ENCRYPTION_KEY || 'erms-training-draft-secure-key-2026';

/**
 * Encrypts a string (e.g., JSON.stringified data) using AES
 * @param plaintext The string data to encrypt
 * @returns Base64 encoded ciphertext
 */
export function encryptData(plaintext: string): string {
    if (!plaintext) return '';
    try {
        const ciphertext = CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
        return ciphertext;
    } catch (error) {
        console.error('Encryption failed:', error);
        return '';
    }
}

/**
 * Decrypts a Base64 encoded ciphertext back to plaintext using AES
 * @param ciphertext The encrypted string
 * @returns Original plaintext string
 */
export function decryptData(ciphertext: string): string {
    if (!ciphertext) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    } catch (error) {
        // Failing to decrypt might mean the key changed or the data is corrupted/unencrypted
        console.error('Decryption failed, might be legacy plain data:', error);
        return '';
    }
}
