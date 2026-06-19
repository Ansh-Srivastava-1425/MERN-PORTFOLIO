const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email to admin — notification of new message
const sendAdminNotification = async (name, email, message) => {
  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `📬 New Message from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;
        background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;
        border:1px solid #1e1e2e;">
        <h2 style="color:#6366f1;margin-bottom:8px;">New Contact Message</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">
          Someone reached out through your portfolio.
        </p>
        <div style="background:#111118;padding:20px;border-radius:8px;
          border:1px solid #1e1e2e;margin-bottom:16px;">
          <p><strong style="color:#6366f1;">Name:</strong>
            <span style="color:#e2e8f0;margin-left:8px;">${name}</span></p>
          <p><strong style="color:#6366f1;">Email:</strong>
            <span style="color:#e2e8f0;margin-left:8px;">${email}</span></p>
          <p><strong style="color:#6366f1;">Message:</strong></p>
          <p style="color:#cbd5e1;margin-top:8px;line-height:1.6;">
            ${message}
          </p>
        </div>
        <a href="mailto:${email}"
          style="display:inline-block;padding:10px 24px;background:#6366f1;
          color:white;border-radius:8px;text-decoration:none;font-weight:500;">
          Reply to ${name}
        </a>
      </div>
    `,
  });
};

// Email to visitor — auto-responder
const sendVisitorAutoReply = async (name, email) => {
  await transporter.sendMail({
    from: `"Ansh Srivastava" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks for reaching out, ${name}! 👋`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;
        background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;
        border:1px solid #1e1e2e;">
        <h2 style="color:#6366f1;">Hey ${name}, thanks for your message!</h2>
        <p style="color:#94a3b8;line-height:1.7;margin:16px 0;">
          I've received your message and will get back to you within
          24 hours. In the meantime, feel free to check out my projects
          or connect with me on LinkedIn.
        </p>
        <div style="border-left:3px solid #6366f1;padding-left:16px;
          margin:24px 0;color:#cbd5e1;font-style:italic;">
          "Building intelligent systems, one commit at a time."
        </div>
        <p style="color:#64748b;font-size:13px;margin-top:32px;">
          — Ansh Srivastava<br/>
          Full Stack Developer & Embedded Systems Engineer
        </p>
      </div>
    `,
  });
};

module.exports = { sendAdminNotification, sendVisitorAutoReply };
