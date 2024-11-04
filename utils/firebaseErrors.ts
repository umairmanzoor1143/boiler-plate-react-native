import React from 'react';
import { Alert } from 'react-native';

export enum FirebaseErrorCode {
  // Auth Errors
  INVALID_CREDENTIALS = 'auth/invalid-credential',
  EMAIL_EXISTS = 'auth/email-already-in-use',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  WEAK_PASSWORD = 'auth/weak-password',
  INVALID_EMAIL = 'auth/invalid-email',
  ACCOUNT_EXISTS = 'auth/account-exists-with-different-credential',
  OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
  USER_DISABLED = 'auth/user-disabled',
  EXPIRED_ACTION_CODE = 'auth/expired-action-code',
  QUOTA_EXCEEDED = 'auth/quota-exceeded',
  REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',

  // Firestore Errors
  PERMISSION_DENIED = 'permission-denied',
  UNAVAILABLE = 'unavailable',
  DATA_LOSS = 'data-loss',
  ALREADY_EXISTS = 'already-exists',
  NOT_FOUND = 'not-found',

  // Storage Errors
  UNAUTHORIZED = 'unauthorized',
  UNAUTHENTICATED = 'unauthenticated',
  RETRY_LIMIT_EXCEEDED = 'retry-limit-exceeded',
  INVALID_CHECKSUM = 'invalid-checksum',
  CANCELED = 'canceled',

  // Default
  UNKNOWN = 'unknown'
}

export function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    // Auth Error Messages
    case FirebaseErrorCode.INVALID_CREDENTIALS:
      return 'Invalid email or password';
    case FirebaseErrorCode.EMAIL_EXISTS:
      return 'Email already in use';
    case FirebaseErrorCode.USER_NOT_FOUND:
      return 'User not found';
    case FirebaseErrorCode.WRONG_PASSWORD:
      return 'Incorrect password';
    case FirebaseErrorCode.WEAK_PASSWORD:
      return 'Password should be at least 6 characters';
    case FirebaseErrorCode.INVALID_EMAIL:
      return 'Invalid email address';
    case FirebaseErrorCode.ACCOUNT_EXISTS:
      return 'Account already exists with different credentials';
    case FirebaseErrorCode.OPERATION_NOT_ALLOWED:
      return 'Operation not allowed';
    case FirebaseErrorCode.USER_DISABLED:
      return 'Account has been disabled';
    case FirebaseErrorCode.EXPIRED_ACTION_CODE:
      return 'Action code has expired';
    case FirebaseErrorCode.QUOTA_EXCEEDED:
      return 'Quota exceeded, please try again later';
    case FirebaseErrorCode.REQUIRES_RECENT_LOGIN:
      return 'Please log in again to complete this action';

    // Firestore Error Messages
    case FirebaseErrorCode.PERMISSION_DENIED:
      return 'Permission denied';
    case FirebaseErrorCode.UNAVAILABLE:
      return 'Service temporarily unavailable';
    case FirebaseErrorCode.DATA_LOSS:
      return 'Data loss occurred';
    case FirebaseErrorCode.ALREADY_EXISTS:
      return 'Document already exists';
    case FirebaseErrorCode.NOT_FOUND:
      return 'Document not found';

    // Storage Error Messages
    case FirebaseErrorCode.UNAUTHORIZED:
      return 'Unauthorized access';
    case FirebaseErrorCode.UNAUTHENTICATED:
      return 'User not authenticated';
    case FirebaseErrorCode.RETRY_LIMIT_EXCEEDED:
      return 'Too many attempts, please try again later';
    case FirebaseErrorCode.INVALID_CHECKSUM:
      return 'File verification failed';
    case FirebaseErrorCode.CANCELED:
      return 'Operation canceled';

    default:
      return 'An unexpected error occurred';
  }
}

export function handleFirebaseError({error, cError}): void {
    if(cError) {
        Alert.alert('Error', cError);
        return;
    }
  const errorCode = error.code || FirebaseErrorCode.UNKNOWN;
  const errorMessage = getFirebaseErrorMessage(errorCode);
  
  Alert.alert('Error', errorMessage);
} 