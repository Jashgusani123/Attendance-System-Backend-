import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      port: 465,
      auth: {
        user: 'quickattend01@gmail.com',
        pass: 'itbw optr ogrl hcxw',
      },
    });

    const mailOptions = {
      from: 'quickattend01@gmail.com',
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
