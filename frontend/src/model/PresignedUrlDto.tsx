interface PresignedUrlDto {
    presignedUrl: string, 
    fileUrl: string, 
  }
  
  class PresignedUrlDtoImpl implements PresignedUrlDto {
    presignedUrl: string;
    fileUrl: string;
  
    constructor(presignedUrl: string, fileUrl: string) {
        this.presignedUrl = presignedUrl; 
        this.fileUrl = fileUrl;
    }
  }

  export default PresignedUrlDtoImpl;