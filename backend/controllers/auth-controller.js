
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Verification from '../models/verification.js';
import sendEmail from '../libs/send-email.js';
import aj from '../libs/arcjet.js';
import util from 'util';

const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const decision = await aj.protect(req, { email: email, }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", util.inspect(decision, { depth: null, colors: true }));

    if (decision.isDenied()) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid email address" }));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email address already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
    });

    const verificationToken = jwt.sign(
      { userId: newUser._id, property: 'emailVerification' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    await Verification.create({
      userId: newUser._id,
      otp: verificationToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    });

    // Send Email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`;
    const emailSubject = 'Verify your email';

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(201).json({ message: 'Verification email sent to your email. Please check and verify your account.' });
  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};
const loginUser = async (req, res) => {
  try {
    res.status(200).json({ message: 'User logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { registerUser, loginUser };
