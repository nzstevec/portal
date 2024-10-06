import React, { createContext, useState, ReactNode } from 'react';
import { UploadFile } from '../components/ui/FileUpload';

interface FileContextType {
    files: UploadFile[];
    setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
}

export const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
    // const [filenames, setFilenames] = useState<string>('');
    const [files, setFiles] = useState<UploadFile[]>([]);

    return (
        <FileContext.Provider value={{ files, setFiles }}>
            {children}
        </FileContext.Provider>
    );
};
