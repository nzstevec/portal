from email.mime.text import MIMEText
import smtplib
from config import Config

class SmtpClient:
    def __init__(self, config: Config):
        self.config = config
        self.smtp_server = config['SMTP_SERVER']
        self.smtp_port = config['SMTP_PORT']
        self.smtp_use_tls =config['SMTP_USE_TLS']
        self.source_email = config['SOURCE_EMAIL']
        self.destination_email =config['DESTINATION_EMAIL']
        self.smtp_username = config['SMTP_USERNAME']
        self.smtp_password = config['SMTP_PASSWORD']


    def send_email(self, subject: str, body: str, from_email: str = None, to_email: str = None):
        from_email = from_email or self.source_email
        to_email = to_email or self.destination_email

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email

        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            if self.smtp_use_tls:
                server.starttls()
            login_result = server.login(self.smtp_username, self.smtp_password)
            server.sendmail(
                from_addr=from_email, 
                to_addrs=to_email, 
                msg=msg.as_string())
            server.quit()
        except Exception as e:
            print(f"Error sending email: {e}")
            raise

