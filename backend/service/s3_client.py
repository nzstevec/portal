import uuid
import boto3
import requests
from io import BytesIO
from config import Config

s3_client = boto3.client('s3', region_name=Config.AWS_REGION)

def get_presigned_url(userid, filename, filetype):
    # Generate a unique filename to prevent collisions
    unique_filename = f"{uuid.uuid4()}-{filename}"
    file_key = f"{userid}/{unique_filename}"

    # Generate presigned URL for PUT operation
    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': Config.FILE_UPLOAD_BUCKET,
            'Key': file_key,
            'ContentType': filetype
        },
        ExpiresIn=3600  # URL expiration time in seconds
    )

    # Construct the file URL
    file_url = f"https://{Config.FILE_UPLOAD_BUCKET}.s3.{Config.AWS_REGION}.amazonaws.com/{file_key}"

    return presigned_url, file_url

def get_presigned_download_url(file_key):

    # Generate presigned URL for GET operation
    presigned_url = s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': Config.FILE_UPLOAD_BUCKET,
            'Key': file_key
        },
        ExpiresIn=36000  # URL expiration time in seconds
    )

    return presigned_url

def get_download_urls(userid, filenames):

    # List objects within the specific bucket and prefix
    response = s3_client.list_objects_v2(Bucket=Config.FILE_UPLOAD_BUCKET, Prefix=userid)

    matching_file_keys = []
    filename_list = filenames.split(",")

    # Iterate through the returned contents to find files with the specified suffix
    for content in response.get('Contents', []):
        key = content['Key']
        for filename in filename_list:
            if key.endswith(filename):
                matching_file_keys.append(key)

    download_urls = []
    for file_key in matching_file_keys:
        file_url = get_presigned_download_url(file_key)
        download_urls.append(file_url)
    
    return download_urls, matching_file_keys

def get_file_like_object_from_s3(download_url):
    
    response = requests.get(download_url)
    response.raise_for_status()
    file_like_object = BytesIO(response.content)

    return file_like_object

if __name__ == "__main__":
    print(f"fileuploadbucket = {Config.FILE_UPLOAD_BUCKET}")

    download_urls, file_keys = get_download_urls("292e5448-b001-70cb-1582-4599f2239de5/", "2. Mr Ashish George.pdf")
    for download_url, file_key in zip(download_urls, file_keys):
        print(f"download_url = {download_url}")
        file_like_object = get_file_like_object_from_s3(download_url)
        file_like_object.name = "2. Mr Ashish George.pdf"
        print(f"file contents: {file_like_object.getvalue()[:50]}")
        print(f"file name: {file_like_object.name}")



    
    