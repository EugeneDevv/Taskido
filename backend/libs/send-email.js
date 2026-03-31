import pkg from "@getbrevo/brevo";
const { TransactionalEmailsApi, SendSmtpEmail } = pkg;

const sendEmail = async (to, subject, htmlContent) => {
  try {
    let emailAPI = new TransactionalEmailsApi();
    emailAPI.setApiKey(0, process.env.BREVO_API_KEY);
    
    let message = new SendSmtpEmail();
    message.to = [{ email: to }];
    message.subject = subject;
    message.htmlContent = htmlContent;
    message.sender = { name: "Taskido", email: process.env.FROM_EMAIL };

    const response = await emailAPI.sendTransacEmail(message);
    console.log("Email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export default sendEmail;