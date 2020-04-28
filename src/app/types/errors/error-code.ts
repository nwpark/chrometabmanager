export enum ErrorCode {
  UnknownError = 'f9ad156e',
  AttemptedPatchDuringSync = '28b90393',
  HttpRequestError = '8ad3b319',
  HttpRequestTimeout = '6f676904',
  HttpRequestUnknownError = '7d35dfc2',
  RequestUserAccountInfoError = '1c2019e7',
  SearchAppDataFilesError = 'c01e1321',
  RequestJSONFileContentError = '87a82ad4',
  PatchJSONFileContentError = '4e745e7e',
  PostJSONFileContentError = '46ce96a2',
}

export enum ErrorType {
  Http = '3426413a'
}

export function getErrorMessageFromCode(errorCode: ErrorCode): string {
  return errorCodeMessageMap[errorCode];
}

const errorCodeMessageMap: ErrorCodeMessageMap = {
  [ErrorCode.UnknownError]: 'An unknown error occurred.',
  [ErrorCode.HttpRequestTimeout]: 'The server took too long to respond.',
  [ErrorCode.HttpRequestError]: 'An error occurred while communicating with the server.',
  [ErrorCode.HttpRequestUnknownError]: 'An error occurred while communicating with the server.',
  [ErrorCode.AttemptedPatchDuringSync]: 'Attempted to upload data to the server while synchronization was in progress.',
  [ErrorCode.RequestUserAccountInfoError]: 'An error occurred while fetching your account information from the server.',
  [ErrorCode.SearchAppDataFilesError]: 'An error occurred while fetching your saved tabs from the server.',
  [ErrorCode.RequestJSONFileContentError]: 'An error occurred while fetching your saved tabs from the server.',
  [ErrorCode.PatchJSONFileContentError]: 'An error occurred while uploading your saved tabs to the server.',
  [ErrorCode.PostJSONFileContentError]: 'An error occurred while uploading your saved tabs to the server.',
};

type ErrorCodeMessageMap = {
  [errorCode in ErrorCode]: string;
};
