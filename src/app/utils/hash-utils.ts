import * as objectHash from 'object-hash';

export function md5Checksum(object: any): string {
  return objectHash(object, {
    algorithm: 'md5',
    respectType: false
  });
}
