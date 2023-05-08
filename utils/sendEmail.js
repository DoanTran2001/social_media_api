import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, text, userName) => {
  console.log(email, subject, text);
  console.log(process.env.EMAIL_APP);
  console.log(process.env.EMAIL_PASSWORD);
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_APP, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_APP,
      to: email,
      subject: subject,
      // text: text,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Đây là tiêu đề email</title>
          <style>
            /* Thiết kế style cho email */
            h1 {
              color: #ff0000;
              font-size: 24px;
              font-weight: bold;
            }
            p {
              color: #000000;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div>
            <h1>Xin chào ${userName},</h1>
            <div class={content} style="border: 1px solid #eee; border-radius: 10px; margin: auto; max-width: 550px; padding: 10px; box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1); text-aligin: center">
              <p>Chúng tôi gửi cho bạn email này vì bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào liên kết này để tạo mật khẩu mới</p>
              <button class="btn-76" style="padding: 5px 10px; border-radius: 10px">
                <a href=${text} style="text-decoration: none; ">Đặt lại mật khẩu</a>
              </button>
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này. Mật khẩu của bạn sẽ không bị thay đổi.</p>
            </div>
          </div>
        </body>
      </html>
      `,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log(err.message);
    console.log(error, "email not sent");
  }
};
