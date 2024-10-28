interface QueryRequestDto {
    sent: string;
    userid: string;
    file_names: string;
    user_input: string;
    template_name: string;
    ai_provider: string;
  }
  
  class QueryRequestDtoImpl implements QueryRequestDto {
    sent: string;
    userid: string;
    file_names: string;
    user_input: string;
    template_name: string;
    ai_provider: string;
  
    constructor(
      userid: string, 
      file_names: string, 
      user_input: string, 
      template_name: string,
      ai_provider: string = 'scoti'
    ) {
      this.sent = new Date().toISOString();
      this.userid = userid;
      this.file_names = file_names;
      this.user_input = user_input;
      this.template_name = template_name;
      this.ai_provider = ai_provider;
    }
  }

  export default QueryRequestDtoImpl;