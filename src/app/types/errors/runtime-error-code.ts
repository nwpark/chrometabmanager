export enum RuntimeErrorCode {
  QuotaBytes,
  QuotaBytesPerItem,
  MaxItems,
  MaxWriteOperationsPerHour,
  MaxWriteOperationsPerMinute,
  MaxSustainedWriteOperationsPerMinute,
  Unknown
}

export function getRuntimeErrorCodeFromMessage(message: string): RuntimeErrorCode {
  if (message.includes('QUOTA_BYTES_PER_ITEM')) {
    return RuntimeErrorCode.QuotaBytesPerItem;
  } else if (message.includes('QUOTA_BYTES')) {
    return RuntimeErrorCode.QuotaBytes;
  } else if (message.includes('MAX_ITEMS')) {
    return RuntimeErrorCode.MaxItems;
  } else if (message.includes('MAX_WRITE_OPERATIONS_PER_HOUR')) {
    return RuntimeErrorCode.MaxWriteOperationsPerHour;
  } else if (message.includes('MAX_WRITE_OPERATIONS_PER_MINUTE')) {
    return RuntimeErrorCode.MaxWriteOperationsPerMinute;
  } else if (message.includes('MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE')) {
    return RuntimeErrorCode.MaxSustainedWriteOperationsPerMinute;
  } else {
    return RuntimeErrorCode.Unknown;
  }
}
