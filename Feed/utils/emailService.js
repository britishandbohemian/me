const nodemailer = require('nodemailer');
require('dotenv').config(); // To use environment variables

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'kamogelomosiah@gmail.com',
                    pass: 'ckkyguwaqmxubhpa' // App Password, not Gmail password
                }
        });
    }

    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"Your App Name" <${process.env.EMAIL_USER}>`,
                ...options
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendVerificationEmail(user, verificationUrl) {
        const mailOptions = {
            to: user.email,
            subject: 'Verify Your Email',
            text: `Click on the link to verify your email: ${verificationUrl}`,
            html: `
                <p>Welcome to Our App!</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
            `
        };

        return this.sendEmail(mailOptions);
    }

    async sendPasswordResetEmail(user, resetUrl) {
        const mailOptions = {
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click on the link to reset your password: ${resetUrl}`,
            html: `
                <p>You have requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you did not request a password reset, please ignore this email.</p>
            `
        };

        return this.sendEmail(mailOptions);
    }
}

module.exports = new EmailService();