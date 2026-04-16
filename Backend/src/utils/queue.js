import PQueue from 'p-queue';

export const audioRefreshQueue = new PQueue({ concurrency: 3 });
export const warmupQueue = new PQueue({ concurrency: 3 });