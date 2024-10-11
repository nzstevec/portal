interface DocAuditResponseDto {
    received: string;
    status: string;
    ai_response: string;
  }
  
  class DocAuditResponseDtoImpl implements DocAuditResponseDto {
    received: string;
    status: string;
    ai_response: string;

    constructor(received: string, status: string, ai_response: string) {
      this.received = received;
      this.status = status;
      this.ai_response = ai_response;
    }
  }

  export default DocAuditResponseDtoImpl;