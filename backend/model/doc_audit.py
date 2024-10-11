from typing import List
from pydantic import BaseModel
from datetime import datetime

class DocAuditRequest(BaseModel):
    sent: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    userid: str = ''
    file_name: str = ''
    style_guide_file_names: str = ''
    template_name: str = ''

    class Config:
        json_schema_extra = {
            "example": {
                "sent": "2022-01-01T00:00:00",
                "userid": "292e5448-b001-70cb-1582-4599f2239de5",
                "file_name": "file1.txt", 
                "style_guide_file_names": "section1.txt,section2.txt",
                "template_name": "doc_audit"
            }
        }

class DocAuditResponse(BaseModel):
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
    create = DocAuditRequest(**{"sent": "2022-01-01T00:00:00","userid": "292e5448-b001-70cb-1582-4599f2239de5","file_name": "blah.txt,file2.txt", "style_guide_file_names": "file1.txt,file2.txt", "template_name": "doc_audit"}) 
    print(create.model_dump_json())
    response = DocAuditResponse(**{"received": "2022-01-01T00:00:00", "status": "200", "ai_response": "47 is the meaning of life"})
    print(response.model_dump_json())  
    query_response = DocAuditResponse(
            # received=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status='200',
            ai_response="blah blah blah"
        )
    dict = query_response.model_dump()
    print(dict) 