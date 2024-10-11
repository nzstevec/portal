interface DocAuditRequestDto {
    sent: string;
    userid: string;
    file_name: string;
    style_guide_file_names: string;
    template_name: string;
  }
  
  class DocAuditRequestDtoImpl implements DocAuditRequestDto {
    sent: string;
    userid: string;
    file_name: string;
    style_guide_file_names: string;
    template_name: string;
  
    constructor(userid: string, file_name: string, style_guide_file_names: string, template_name: string) {
      this.sent = new Date().toISOString();
      this.userid = userid;
      this.file_name = file_name;
      this.style_guide_file_names = style_guide_file_names;
      this.template_name = template_name;
    }
  }

  export default DocAuditRequestDtoImpl;