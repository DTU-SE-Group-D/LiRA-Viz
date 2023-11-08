import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';

const decompress = require('decompress');

@Processor('file-processing')
export class FileProcessor {
  constructor(@InjectQueue('file-processing') private fileQueue: Queue) {}
  @Process('unzip-file')
  async unzip(job: Job<{ filePath: string }>) {
    try {
      const { filePath } = job.data;
      console.log(`unzipping file: ${filePath}`);

      decompress(filePath, './uploads')
        .then(
          async (files: { path: string; type: ['file', 'directory'] }[]) => {
            console.log(files);
            await this.fileQueue.add('process-file', {
              filePath: `./uploads/${files[0].path.split('/')[0]}/`,
            });
          },
        )
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(`Error processing file: ${job.data.filePath}`, error);
    }
  }

  @Process('process-file')
  async handleFileProcessing(job: Job<{ filePath: string }>) {
    try {
      const { filePath } = job.data;
      console.log(`Processing file: ${filePath}`);
    } catch (error) {
      console.error(`Error processing file: ${job.data.filePath}`, error);
    }
  }
}
