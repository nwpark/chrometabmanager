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
    shouldDisplayDialog: true
  },
  [ErrorCode.HttpRequestError]: {
    userFriendlyMessage: `An error occurred while communicating with the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.HttpRequestUnknownError]: {
    userFriendlyMessage: `An error occurred while communicating with the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.AttemptedPatchDuringSync]: {
    userFriendlyMessage: `Attempted to upload data to the server while synchronization was in progress.\n\nPlease wait a moment then try again.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.RequestUserAccountInfoError]: {
    userFriendlyMessage: `An error occurred while fetching your account information from the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.SearchAppDataFilesError]: {
    userFriendlyMessage: `An error occurred while fetching your saved tabs from the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.RequestJSONFileContentError]: {
    userFriendlyMessage: `An error occurred while fetching your saved tabs from the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.PatchJSONFileContentError]: {
    userFriendlyMessage: `An error occurred while uploading your saved tabs to the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.PostJSONFileContentError]: {
    userFriendlyMessage: `An error occurred while uploading your saved tabs to the server.\n\nPlease try again in 30 seconds.`,
    shouldDisplayDialog: true
  },
  [ErrorCode.MessageResponseError]: {
    shouldDisplayDialog: false
  }
};

type ErrorCodeDetailsMap = {
  [errorCode in ErrorCode]: ErrorDetails;
};

interface ErrorDetails {
  userFriendlyMessage?: string;
  shouldDisplayDialog: boolean;
}
