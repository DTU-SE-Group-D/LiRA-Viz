import { FC, useCallback, useEffect, useRef, useState } from 'react';
import SingleFileInput from '../Inputs/SingleFileInput';

import '../../css/upload_panel.css';
import { getUploadStatus, uploadSurvey } from '../../queries/upload';
import { UploadStatus } from '../../models/models';

interface Props {
  /** Event when user wants to close the panel */
  close: () => void;
}

/** Interval in seconds to refresh the upload status */
const REFRESH_UPLOAD_STATUS_INTERVAL = 60;

/**
 * Create a panel where the user can upload a zip file
 *
 * @author Kerbourc'h
 */
const UploadPanel: FC<Props> = ({ close }) => {
  const [state, setState] = useState<
    'waiting' | 'sending' | 'sent' | 'sent-error' | 'invalid-password'
  >('waiting');

  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);

  const [waitingForUploadStatus, setWaitingForUploadStatus] =
    useState<boolean>(false);

  const actualizeUploadStatus = useCallback(() => {
    getUploadStatus((status) => {
      let nonActiveNumberToShow = 4;
      status.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

      setUploadStatus(
        status.filter((s) => {
          if (s.status === 'active') {
            return true;
          }

          if (nonActiveNumberToShow > 0) {
            nonActiveNumberToShow--;
            return true;
          }

          return false;
        }),
      );
    });
  }, []);

  // First time
  useEffect(() => {
    if (actualizeUploadStatus) actualizeUploadStatus();
  }, []);

  // Refresh periodically
  useEffect(() => {
    if (actualizeUploadStatus)
      setTimeout(() => {
        if (waitingForUploadStatus) return;
        setWaitingForUploadStatus(true);
        actualizeUploadStatus();
        setWaitingForUploadStatus(false);
      }, REFRESH_UPLOAD_STATUS_INTERVAL * 1000);
  }, [uploadStatus]);

  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <div className="upload-panel" onClick={close}>
      <div
        className="upload-panel-container"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="upload-panel-top">
          <h1>Upload a new Dynatest survey</h1>
          <button onClick={close}>x</button>
        </div>

        <div className="upload-password">
          <label>Upload password</label>
          <input ref={passwordRef} name="password" type="password" />
        </div>

        <div className="upload-input-container">
          {state === 'waiting' && (
            <SingleFileInput
              className="upload-input"
              displayName="Upload a .zip"
              onFileDrop={(file: File) => {
                setState('sending');

                uploadSurvey(
                  file,
                  passwordRef.current?.value || '',
                  () => {
                    setState('sent');
                    setTimeout(() => setState('waiting'), 3000);
                  },
                  (error) => {
                    if (error.response.status === 403) {
                      setState('invalid-password');
                    } else {
                      setState('sent-error');
                    }
                    console.warn('Error while uploading new survey: ', error);
                    setTimeout(() => setState('waiting'), 3000);
                  },
                );
              }}
            />
          )}
          {state === 'sending' && <p>Sending...</p>}
          {state === 'sent' && <p>Sent!</p>}
          {state === 'sent-error' && (
            <p>Something went wrong while sending the file!</p>
          )}
          {state === 'invalid-password' && <p>Invalid password!</p>}
        </div>
        <div className="upload-status">
          <div className="upload-status-title-and-btn">
            <h4>Upload tasks status:</h4>
            <span
              title="Manually refresh the list"
              onClick={() => {
                if (waitingForUploadStatus) return;
                setWaitingForUploadStatus(true);
                actualizeUploadStatus();
                setWaitingForUploadStatus(false);
              }}
            >
              &#x21bb;
            </span>
          </div>
          {uploadStatus.length == 0 && <p>No recent upload</p>}
          {uploadStatus.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>n°</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {uploadStatus.map((status) => (
                  <tr key={status.id}>
                    <td>{status.id}</td>
                    <td>
                      {status.name === 'process-file'
                        ? 'Data extraction'
                        : 'Unzip'}
                    </td>
                    <td>
                      {new Date(status.timestamp).toLocaleDateString()}{' '}
                      {new Date(status.timestamp).toLocaleTimeString()}
                    </td>
                    <td>{status.status}</td>
                    <td>{Math.round(status.progress)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;
