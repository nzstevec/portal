interface QueryRequestDto {
    sent: string;
    userid: string;
    file_names: string;
    user_input: string;
    template_name: string;
  }
  
  class QueryRequestDtoImpl implements QueryRequestDto {
    sent: string;
    userid: string;
    file_names: string;
    user_input: string;
    template_name: string;
  
    constructor(userid: string, file_names: string, user_input: string, template_name: string) {
      this.sent = new Date().toISOString();
      this.userid = userid;
      this.file_names = file_names;
      this.user_input = user_input;
      this.template_name = template_name;
    }
  }

  export default QueryRequestDtoImpl;