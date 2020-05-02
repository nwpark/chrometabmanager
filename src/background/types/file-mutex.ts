import Mutex from 'async-mutex/lib/Mutex';
import MutexInterface from 'async-mutex/lib/MutexInterface';

export class FileMutex {
  private fileReadMutex = new Mutex();
  private fileWriteMutex = new Mutex();

  runExclusiveRead<T>(callback: MutexInterface.Worker<T>): Promise<T> {
    return this.fileReadMutex.runExclusive(callback);
  }

  runExclusiveWrite<T>(callback: MutexInterface.Worker<T>): Promise<T> {
    return this.fileWriteMutex.runExclusive(callback);
  }

  isReadLocked(): boolean {
    return this.fileReadMutex.isLocked();
  }

  isWriteLocked(): boolean {
    return this.fileWriteMutex.isLocked();
  }
}
