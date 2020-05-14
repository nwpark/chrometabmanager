export enum ErrorCode {
  UnknownError = 'UnknownError_f9ad156e',
  AttemptedPatchDuringSync = 'AttemptedPatchDuringSync_28b90393',
  HttpRequestError = 'HttpRequestError_8ad3b319',
  HttpRequestTimeout = 'HttpRequestTimeout_6f676904',
  HttpRequestUnknownError = 'HttpRequestUnknownError_7d35dfc2',
  RequestUserAccountInfoError = 'RequestUserAccountInfoError_1c2019e7',
  SearchAppDataFilesError = 'SearchAppDataFilesError_c01e1321',
  RequestJSONFileContentError = 'RequestJSONFileContentError_87a82ad4',
  PatchJSONFileContentError = 'PatchJSONFileContentError_4e745e7e',
  PostJSONFileContentError = 'PostJSONFileContentError_46ce96a2',
  MessageResponseError = 'MessageResponseError_b3ca2a0d',
  RequestIsObsolete = 'RequestIsObsolete_d30dc5b9',
  AuthTokenNotGranted = 'AuthTokenNotGranted_5af3e91a',
  RequiredOAuth2ScopeNotGranted = 'RequiredOAuth2ScopeNotGranted_6faa0e30'
}

export enum ErrorType {
  Http = 'Http_3426413a'
}

export function getErrorDetailsFromCode(errorCode: ErrorCode): ErrorDetails {
  return errorCodeDetailsMap[errorCode];
}

const errorCodeDetailsMap: ErrorCodeDetailsMap = {
  [ErrorCode.UnknownError]: {
    userFriendlyMessage: 'An unknown error occurred.',
    shouldDisplayDialog: false
  },
  [ErrorCode.HttpRequestTimeout]: {
    userFriendlyMessage: `The server took too long to respond.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.HttpRequestError]: {
    userFriendlyMessage: `An error occurred while communicating with the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.HttpRequestUnknownError]: {
    userFriendlyMessage: `An error occurred while communicating with the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.AttemptedPatchDuringSync]: {
    title: 'Oops..',
    userFriendlyMessage: `You attempted to modify your saved tabs while synchronization was in progress.\n\nPlease wait a moment then try again :)`,
    shouldDisplayDialog: true
  },
  [ErrorCode.RequestUserAccountInfoError]: {
    userFriendlyMessage: `An error occurred while fetching your account information from the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.SearchAppDataFilesError]: {
    userFriendlyMessage: `An error occurred while fetching your saved tabs from the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.RequestJSONFileContentError]: {
    userFriendlyMessage: `An error occurred while fetching your saved tabs from the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.PatchJSONFileContentError]: {
    userFriendlyMessage: `An error occurred while uploading your saved tabs to the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.PostJSONFileContentError]: {
    userFriendlyMessage: `An error occurred while uploading your saved tabs to the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true,
    requiresReload: true
  },
  [ErrorCode.MessageResponseError]: { shouldDisplayDialog: false },
  [ErrorCode.RequestIsObsolete]: { shouldDisplayDialog: false },
  [ErrorCode.AuthTokenNotGranted]: {
    userFriendlyMessage: `Authentication token could not be obtained.`,
    shouldDisplayDialog: true,
    shouldSendErrorReport: true
  },
  [ErrorCode.RequiredOAuth2ScopeNotGranted]: {
    userFriendlyMessage: 'The requested permission was not granted.',
    shouldDisplayDialog: true
  }
};

type ErrorCodeDetailsMap = {
  [errorCode in ErrorCode]: ErrorDetails;
};

export interface ErrorDetails {
  title?: string;
  userFriendlyMessage?: string;
  requiresReload?: boolean;
  shouldSendErrorReport?: boolean;
  shouldDisplayDialog: boolean;
}
