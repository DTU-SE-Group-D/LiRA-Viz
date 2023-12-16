import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import * as process from 'process';
import { extract_measurements_data, find_surveys } from './upload';
import { UploadService } from './upload.service';
import { extract_dashcam_image_data, extract_road_image_data } from './image';
import * as path from 'path';
import * as fs from 'fs';
import * as unzip from 'unzip-stream';

/**
 * This class handles the file processing queue, managing the extraction
 * processing of uploaded files and importing their data into a database.
 * @author Liu, Kerbourc'h
 */
@Processor('file-processing')
export class FileProcessor {
  constructor(
    @InjectQueue('file-processing') private fileQueue: Queue,
    private readonly service: UploadService,
  ) {}

  @Process('unzip-file')
  async unzip(job: Job<{ filePath: string }>) {
    try {
      const { filePath } = job.data;
      console.log(`Unzipping file: ${filePath}`);

      // Create a temporary directory for unzipping
      const tempUnzipPath = path.join(
        './uploads',
        `temp_${new Date().getTime()}`,
      );
      if (!fs.existsSync(tempUnzipPath)) {
        fs.mkdirSync(tempUnzipPath, { recursive: true });
      }

      // Start the unzip process with a progress of 0%
      await job.progress(0);

      // Stream the zip file and extract to the temporary directory

      fs.createReadStream(filePath)
        .pipe(unzip.Extract({ path: tempUnzipPath }))
        .on('error', (error) => {
          console.error(`Error unzipping file: ${filePath}`, error);
        })
        .on('close', async () => {
          await this.handleUnzippedContent(tempUnzipPath, filePath);
          await job.progress(60);
        });
    } catch (error) {
      console.error(`Error processing file: ${job.data.filePath}`, error);
    }
  }

  /**
   * @param tempUnzipPath the temp folder where the unzip folder is
   * @param originalFilePath The original path to the unzip folder
   * @author Liu
   */
  async handleUnzippedContent(tempUnzipPath, originalFilePath) {
    const files = fs.readdirSync(tempUnzipPath);
    if (files.length === 0) {
      console.error('No files were found in the unzipped directory.');
      return;
    }

    // Proceed with processing each file in the temp directory
    for (const file of files) {
      const filePath = path.join(tempUnzipPath, file);
      await this.fileQueue.add('process-file', { filePath });
    }

    // Delete the original zip file
    fs.unlink(originalFilePath, (err) => {
      if (err) {
        console.error(`Failed to delete ZIP file: ${originalFilePath}`, err);
      } else {
        console.log(`Deleted ZIP file: ${originalFilePath}`);
      }
    });
  }

  /**
   * Processes the extracted file by finding surveys, extracting data, and uploading to the database.
   * @author Liu, Kerbourc'h
   */
  @Process('process-file')
  async handleFileProcessing(job: Job<{ filePath: string }>) {
    const printJobInfo = (...args: any[]) => {
      console.log(`[${job.id} ${job.toJSON()['progress']}%]`, ...args);
    };

    const printJobError = (...args: any[]) => {
      console.error(`[${job.id} ${job.toJSON()['progress']}%]`, ...args);
    };

    try {
      const { filePath } = job.data;
      const debug = process.env.IMPORT_DEBUG === 'true';
      printJobInfo(`Processing file: ${filePath}`);

      //here we make sure that there is at least one RSP file and a HDC directory
      let surveys = find_surveys(filePath, debug);
      if (debug) {
        printJobInfo(surveys);
      }

      if (surveys.length == 0) {
        printJobInfo('No valid data found in directory: ' + filePath);
      }

      // TODO: split process here instead of for the all zip file (one process per survey)
      for (let i = 0; i < surveys.length; i++) {
        // upload the survey data and get the id back
        surveys[i].fk_survey_id = await this.service.db_insert_survey_data(
          surveys[i],
          debug,
        );

        const data = extract_measurements_data(surveys[i], debug);
        if (!(await this.service.mapMatch(surveys[i], data))) {
          printJobError('Failed to map match data.');
        }

        const roadImages = extract_road_image_data(surveys[i], debug);
        if (!(await this.service.mapMatch(surveys[i], roadImages))) {
          printJobError('Failed to map match road images.');
        }

        const dashcameraImages = extract_dashcam_image_data(surveys[i], debug);
        if (!(await this.service.mapMatch(surveys[i], dashcameraImages))) {
          printJobError('Failed to map match dashcam images.');
        }

        await job.progress(65);

        // Upload all data and images to the database
        await Promise.all([
          ...data.map(async (data) => {
            await this.service.db_insert_measurement_data(
              surveys[i].fk_survey_id,
              data,
              debug,
            );
          }),
          ...roadImages.map(async (image) => {
            await this.service.db_insert_image_data_and_move_to_image_store(
              surveys[i].fk_survey_id,
              image,
              debug,
            );
          }),
          ...dashcameraImages.map(async (image) => {
            await this.service.db_insert_image_data_and_move_to_image_store(
              surveys[i].fk_survey_id,
              image,
              debug,
            );
          }),
        ]);
        await job.progress(99);
      }

      // Delete the unzipped file
      try {
        const tempFolderPath = path.dirname(job.data.filePath);
        fs.rmSync(tempFolderPath, { recursive: true });
        printJobInfo(`Deleted extracted folder: ${job.data.filePath}`);
      } catch (error) {
        printJobError(
          `Error deleting extracted folder: ${job.data.filePath}`,
          error,
        );
      }
      printJobInfo(
        `File processed successfully and imported into Database: ${filePath}`,
      );
      await job.progress(100);
      console.log(`Job ${job.id} completed`);
    } catch (error) {
      printJobError(`Error processing file: ${job.data.filePath}`, error);
    }
  }
}
