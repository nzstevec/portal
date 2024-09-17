interface FeedbackDto {
    created: string;
    category: string;
    feedback: string;
    email: string;
  }
  
  class FeedbackDtoImpl implements FeedbackDto {
    created: string;
    category: string;
    feedback: string;
    email: string;
  
    constructor(category: string, feedback: string, email: string) {
      this.created = new Date().toISOString();
      this.category = category;
      this.feedback = feedback;
      this.email = email;
    }
  }

  export default FeedbackDtoImpl;