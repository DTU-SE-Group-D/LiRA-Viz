import { FC, useRef, useState } from 'react';
import SingleFileInput from '../Inputs/SingleFileInput';

import '../../css/upload_panel.css';
import { uploadSurvey } from '../../queries/upload';

interface Props {
  /** Event when user wants to close the panel */
  close: () => void;
}

/**
 * Create a panel where the user can upload a zip file
 */
const UploadPanel: FC<Props> = ({ close }) => {
  const [state, setState] = useState<
    'waiting' | 'sending' | 'sent' | 'sent-error' | 'invalid-password'
  >('waiting');

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
                  console.warn(error);
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
    </div>
  );
};

export default UploadPanel;
