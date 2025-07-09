package utils

import (
	"net/smtp"
	"os"
)

func SendEmail(to, subject, resetLink string) error {
	from := "cribconnect358@gmail.com"
	password := os.Getenv("CRIBCONNECT_GMAIL_APP_PASSWORD") // 🔐 moved sensitive data to env

	msg := "MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n" +
		"From: CribConnect <" + from + ">\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n\r\n" +

		`<html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
                <div style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #007bff;">🔑 Forgot Your Password?</h2>
                    <p style="font-size: 16px;">We’ve got you covered! Use the button below to reset your password and get back to finding your perfect roommate.</p>
                    
                    <a href="` + resetLink + `" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #777;">
                        If you didn’t request a password reset, just ignore this email. Your account is still secure.
                    </p>
                    
                    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
                    
                    <p style="font-size: 12px; color: #aaa;">
                        💌 Sent with care from CribConnect<br>
                        Need help? <a href="mailto:cribconnect358@gmail.com">Contact Support</a>
                    </p>
                </div>
            </body>
        </html>`

	err := smtp.SendMail(
		"smtp.gmail.com:587",
		smtp.PlainAuth("", from, password, "smtp.gmail.com"),
		from,
		[]string{to},
		[]byte(msg),
	)
	return err
}
