import { useState } from "react";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";
import type { UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import type { PrintJobFormT } from "~/schema/PrintJob.schema";

export function useFileManager(
  append: UseFieldArrayAppend<PrintJobFormT, "printFiles">,
  remove: UseFieldArrayRemove
) {
  const [uploadedprintFiles, setUploadedprintFiles] = useState<File[]>([]);

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newprintFiles = Array.from(e.target.files);
      setUploadedprintFiles(prev => [...prev, ...newprintFiles]);

      newprintFiles.forEach((file) => {
        append({
          name: file.name,
          path: URL.createObjectURL(file),
          printFilesize: +(file.size / (1024 * 1024)).toFixed(2),
          copies: 1,
          isColored: false,
          paperSize: "A4", 
          notes: "",
          createdAt: getFormattedDateTime({ date: new Date() }),
          isDownloaded: false,
        });
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedprintFiles(prev => prev.filter((_, i) => i !== index));
    remove(index);
  };

  return {
    uploadedprintFiles,
    addFile,
    removeFile,
    setUploadedprintFiles,
  };
}
