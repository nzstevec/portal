from pydantic import BaseModel
from datetime import datetime

class CreateFeedbackRequest(BaseModel):
    created: datetime
    category: str
    feedback: str
    email: str

    class Config:
        json_schema_extra = {
            "example": {
                "created": "2022-01-01T00:00:00",
                "category": "Feature Request", 
                "feedback": "Looks good to me",
                "email": "john.doe@example.com"
            }
        }

class CreateFeedbackResponse(BaseModel):
    received: datetime
    status: str
    message: str

    class Config:
        json_schema_extra = {
            "success_example": {
                "received": "2022-01-01T00:00:00",
                "status": "200", 
                "message": "Feedback sent successfully"
            },
            "failure_example": {
                "received": "2022-01-01T00:00:00",
                "status": "500", 
                "message": "SMTP error"
            }
        }    

if __name__ == '__main__':
    create = CreateFeedbackRequest(**{"created": "2022-01-01T00:00:00","category": "Feature Request", "feedback": "Looks good to me", "email": "john.doe@example.com"}) 
    print(create.model_dump_json())
    response = CreateFeedbackResponse(**{"received": "2022-01-01T00:00:00", "status": "200", "message": "Feedback sent successfully"})
    print(response.model_dump_json())     