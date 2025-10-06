import { EventEmitter } from 'events';

class ImportQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    this.concurrency = 3; // Process 3 chunks concurrently
    this.activeProcesses = 0;
    this.chunkSize = 100; // Records per chunk
  }

  addToQueue(data, options = {}) {
    const job = {
      id: Date.now() + Math.random(),
      data,
      options,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.queue.push(job);
    this.processQueue();
    
    return job.id;
  }

  async processQueue() {
    if (this.processing || this.activeProcesses >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeProcesses < this.concurrency) {
      const job = this.queue.shift();
      this.activeProcesses++;
      
      this.processJob(job).finally(() => {
        this.activeProcesses--;
        this.processQueue();
      });
    }

    this.processing = false;
  }

  async processJob(job) {
    try {
      job.status = 'processing';
      this.emit('jobStart', job);
      
      const result = await this.processChunk(job.data, job.options);
      
      job.status = 'completed';
      job.result = result;
      this.emit('jobComplete', job);
      
    } catch (error) {
      job.status = 'failed';
      job.error = error;
      this.emit('jobError', job, error);
    }
  }

  async processChunk(chunkData, options) {
    // This will be implemented in the controller
    return { processed: chunkData.length, success: true };
  }

  getQueueStatus() {
    return {
      pending: this.queue.length,
      processing: this.activeProcesses,
      concurrency: this.concurrency,
      chunkSize: this.chunkSize
    };
  }

  clearQueue() {
    this.queue = [];
  }
}

export const importQueue = new ImportQueue();