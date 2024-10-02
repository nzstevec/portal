import React, { createContext, useState, ReactNode } from 'react';

interface FileContextType {
    filenames: string;
    setFilenames: React.Dispatch<React.SetStateAction<string>>;
}

export const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
    const [filenames, setFilenames] = useState<string>('');

    return (
        <FileContext.Provider value={{ filenames, setFilenames }}>
            {children}
        </FileContext.Provider>
    );
};
