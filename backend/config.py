import os

class Config:
    # SMTP Configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.example.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME', 'user@example.com')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'password')
    SMTP_USE_TLS = os.getenv('SMTP_USE_TLS', 'True') == 'True'
    
    # Destination Email
    DESTINATION_EMAIL = os.getenv('DESTINATION_EMAIL', 'feedback@example.com')
    SOURCE_EMAIL = os.getenv('SOURCE_EMAIL', 'user@example.com')
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
