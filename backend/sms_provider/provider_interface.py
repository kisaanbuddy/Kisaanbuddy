from abc import ABC, abstractmethod

class SMSProvider(ABC):
    @abstractmethod
    def send_otp(self, phone_number: str, otp: str) -> bool:
        """Sends a 6-digit OTP code to the target phone number.
        
        Args:
            phone_number: 10-digit clean phone number string.
            otp: 6-digit OTP code string.
            
        Returns:
            True if sent successfully, False otherwise.
        """
        pass
