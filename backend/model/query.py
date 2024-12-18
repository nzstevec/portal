from typing import List
from pydantic import BaseModel
from datetime import datetime

class QueryRequest(BaseModel):
    sent: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    userid: str = ''
    file_names: str = ''
    user_input: str = ''
    template_name: str = ''
    ai_provider: str = ''

    class Config:
        json_schema_extra = {
            "example": {
                "sent": "2022-01-01T00:00:00",
                "userid": "292e5448-b001-70cb-1582-4599f2239de5",
                "file_names": "file1.txt,file2.txt", 
                "user_input": "what is the meaning of life", 
                "template_name": "doc_analyst",
                "ai_provider": "scoti"
            }
        }

class QueryResponse(BaseModel):
    received: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status: str = ''
    ai_response: str = ''

    class Config:
        json_schema_extra = {
            "success_example": {
                "received": "2022-01-01T00:00:00",
                "status": "200", 
                "ai_response": "47 is the meaning of life"
            },
            "failure_example": {
                "received": "2022-01-01T00:00:00",
                "status": "500", 
                "ai_response": "ai timeout"
            }
        }    

if __name__ == '__main__':
    create = QueryRequest(**{"sent": "2022-01-01T00:00:00","userid": "292e5448-b001-70cb-1582-4599f2239de5","file_names": "file1.txt,file2.txt", "user_input": "what is the meaning of life", "template_name": "doc_analyst", "ai_provider": "scoti"}) 
    print(create.model_dump_json())
    response = QueryResponse(**{"received": "2022-01-01T00:00:00", "status": "200", "ai_response": "47 is the meaning of life"})
    print(response.model_dump_json())  
    query_response = QueryResponse(
            # received=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status='200',
            ai_response="blah blah blah"
        )
    dict = query_response.model_dump()
    print(dict) 