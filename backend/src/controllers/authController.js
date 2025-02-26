const Prisma = require('../db/db');
const { signupBody } = require('../shcemaValidation');
const jwt = require('jsonwebtoken');
const otpStore = new Map();

module.exports.otpGenerator = (req, res) => {
    try {
        const { error, value } = signupBody.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Please enter valid otp',
            });
        }

        const { number } = value;
        if (otpStore.has(number)) {
            const existingOTP = otpStore.get(number);
            if (Date.now() - existingOTP.createdAt < 20 * 1000) {
                return res
                    .status(429)
                    .json({ success: false, message: 'Wait before requesting a new OTP' });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore.set(number, {
            otp,
            expiry: Date.now() + 5 * 60 * 1000,
            attempts: 0,
            createdAt: Date.now(),
        });

        console.log(`OTP for ${number}: ${otp}`);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully. Please check your console.',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports.signup = async (req, res) => {
    try {
        const { error, value } = signupBody.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Please enter valid details',
            });
        }

        console.log(value);
        const { number: number, name, email } = value;
        const otp = req.headers['otp'];
        console.log('otp', otp);

        if (!number) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        if (!otpStore.has(number)) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const storedData = otpStore.get(number);
        if (Date.now() > storedData.expiry) {
            otpStore.delete(number);
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        if (storedData.otp !== parseInt(otp)) {
            storedData.attempts++;
            if (storedData.attempts >= 3) {
                otpStore.delete(number);
                return res
                    .status(400)
                    .json({ success: false, message: 'Too many incorrect attempts, OTP deleted' });
            }
            return res.status(400).json({ success: false, message: 'Incorrect OTP' });
        }

        otpStore.delete(number);

        const existingUser = await Prisma.user.findUnique({
            where: { email },
        });

        let user;
        if (existingUser) {
            user = existingUser;
        } else {
            user = await Prisma.user.create({
                data: {
                    name,
                    email,
                    number,
                },
            });
        }

        const token = jwt.sign({ userId: user.id }, 'Secret');
        console.log('User:', user);
        return res.status(200).json({
            success: true,
            message: existingUser ? 'User already exists' : 'Signup successful',
            data: { user, token },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
