interface CreatePresignedUrlDto {
    userid: string, 
    filename: string, 
    filetype: string
  }
  
  class CreatePresignedUrlDtoImpl implements CreatePresignedUrlDto {
    userid: string;
    filename: string;
    filetype: string;
  
    constructor(userid: string, filename: string, filetype: string) {
        this.userid = userid; 
        this.filename = filename;
        this.filetype = filetype;
    }
  }

  export default CreatePresignedUrlDtoImpl;