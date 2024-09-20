from email.mime.text import MIMEText
import smtplib
from config import load_environment_variable

class SmtpClient:
    def __init__(self):
        self.smtp_server = load_environment_variable('SMTP_SERVER', 'smtp.example.com')
        self.smtp_port = int(load_environment_variable('SMTP_PORT', 587))
        self.smtp_use_tls = load_environment_variable('SMTP_USE_TLS', 'True') == 'True'
        self.source_email = load_environment_variable('SOURCE_EMAIL', 'user@example.com')
        self.destination_email = load_environment_variable('DESTINATION_EMAIL', 'feedback@example.com')
        self.smtp_username = load_environment_variable('SMTP_USERNAME', 'user@example.com')
        self.smtp_password = load_environment_variable('SMTP_PASSWORD', 'password')


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

