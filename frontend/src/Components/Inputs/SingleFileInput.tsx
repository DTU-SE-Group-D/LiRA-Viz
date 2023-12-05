import { FC, useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';

import '../../css/single_file_input.css';

interface Props {
  /** The text to display in the input */
  displayName: string;
  /** The className string to add to the component */
  className?: string;
  /** The event handlers, when a file is selected */
  onFileDrop: (file: File) => void;
}

/**
 * Create a file input (either using the default file selector or using drag 'n' drop)
 */
const SingleFileInput: FC<Props> = ({
  displayName,
  className = '',
  onFileDrop,
}) => {
  const [rejectedReason, setRejectedReason] = useState('');

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        setRejectedReason('');
        onFileDrop(acceptedFiles[0]);
      } else {
        if (rejectedFiles.length > 0) {
          switch (rejectedFiles[0].errors[0].code) {
            case 'file-invalid-type':
              setRejectedReason("This file isn't a zip file.");
              break;
            case 'too-many-files':
              setRejectedReason('You can only upload one file at a time.');
              break;
            case 'file-too-large':
              setRejectedReason('This file is too large!');
              break;
            default:
              setRejectedReason('Invalid file.');
              break;
          }
        } else {
          setRejectedReason('Invalid file.');
        }

        setTimeout(() => setRejectedReason(''), 3000);
      }
    },
    [onFileDrop],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 30 * 1024 * 1024 * 1024,
    accept: {
      'application/x-zip': ['.zip'],
    },
  });

  return (
    <div
      {...getRootProps({
        className:
          'file ' + className + (rejectedReason === '' ? '' : ' rejected'),
      })}
    >
      <input {...getInputProps()} />
      <img src="upload.svg" alt="Upload logo" className="upload-icon" />
      <p>{rejectedReason === '' ? displayName : rejectedReason}</p>
    </div>
  );
};

export default SingleFileInput;
