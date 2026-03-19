from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from core.config import settings
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_booking_confirmation(email: EmailStr, name: str, business_name: str, date: str, time: str, service: str = None):
    subject = f"Appointment Confirmed: {business_name}"
    
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #FF2D55;">Booking Confirmed!</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>Your appointment with <strong>{business_name}</strong> has been confirmed.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> {date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {time}</p>
            {f'<p style="margin: 5px 0;"><strong>Service:</strong> {service}</p>' if service else ''}
        </div>
        <p>We look forward to seeing you!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This is an automated message from UniteOman.</p>
    </div>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def send_booking_rejection(email: EmailStr, name: str, business_name: str, date: str, time: str, service: str = None):
    subject = f"Update regarding your booking at {business_name}"
    
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #888;">Booking Update</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>Thank you for your interest in <strong>{business_name}</strong>.</p>
        <p>We are writing to inform you that unfortunately, the vendor is unable to accommodate your appointment at this time:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; color: #666;">
            <p style="margin: 5px 0;"><strong>Date:</strong> {date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {time}</p>
            {f'<p style="margin: 5px 0;"><strong>Service:</strong> {service}</p>' if service else ''}
        </div>
        <p>We apologize for any inconvenience this may cause. You are welcome to try booking for a different time or exploring other similar businesses on <strong>UniteOman</strong>.</p>
        <p>Best regards,<br/>The {business_name} Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This is an automated message from UniteOman.</p>
    </div>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
