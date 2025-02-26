import axios from 'axios';
import { useState } from 'react';
import { Button } from '../components/shared/Button';
import { AuthWrapper } from '../components/wrappers/AuthWrapper';
import styles from '../pages/styles/Signup.module.css';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';

export const Signup = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        number: '',
    });
    const [otp, setOtp] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.number) {
            return;
        }
        const res = await axios.post('http://localhost:3000/v1/auth/otp', {
            ...formData,
        });

        if (res.data.success) {
            toast.success(res.data.message);
        } else {
            toast.error(res.data.message);
        }
        setShowModal(true);
    };

    const handleOtpVerification = async () => {
        const res = await axios.post('http://localhost:3000/v1/auth/signup', formData, {
            headers: {
                otp,
            },
        });

        if (res.data.success) {
            toast.success(res.data.message);
            setShowModal(false);
            console.log(res.data.data);
            if (res.data.data.user) {
                dispatch(
                    setUser({
                        id: res.data.data.user.id,
                        token: res.data.data.token,
                        name: res.data.data.user.name,
                        email: res.data.data.user.email,
                        number: res.data.data.user.number,
                        status: 'ONLINE',
                    }),
                );
            } else {
                console.error('User data is missing in the API response:', res.data);
                toast.error('User data is missing. Please try again.');
            }
        } else {
            toast.error(res.data.message);
            return;
        }
    };

    return (
        <>
            <AuthWrapper>
                <div className={styles.authContainer}>
                    <div className={styles.logo}>
                        <img src="/logo.png" alt="Logo" />
                    </div>
                    <form onSubmit={handleSignup}>
                        <div className={styles.auth}>
                            <input
                                className={styles.authInput}
                                type="text"
                                id="name"
                                placeholder="Name"
                                value={formData.name}
                                name="name"
                                onChange={handleInputChange}
                            />
                            <input
                                className={styles.authInput}
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={formData.email}
                                name="email"
                                onChange={handleInputChange}
                            />
                            <input
                                className={styles.authInput}
                                type="tel"
                                id="number"
                                placeholder="Phone Number"
                                value={formData.number}
                                name="number"
                                onChange={handleInputChange}
                            />
                            <Button type="submit" text={'Sign Up'} />
                        </div>
                    </form>
                </div>
            </AuthWrapper>
            {showModal && (
                <div className={styles.otpVerificationModal}>
                    <div className={styles.otpModalBackground}></div>
                    <div className={styles.otplModalCard}>
                        <h1>Verify OTP</h1>
                        <p className={styles.subtitle}>
                            A 6-digit code has been sent to your console.
                        </p>
                        <input
                            className={styles.otpInput}
                            name="otp"
                            id="otp"
                            type="number"
                            placeholder="Enter OTP"
                            maxLength={6}
                            onChange={(e) => {
                                setOtp(e.target.value.slice(0, 6));
                            }}
                        />
                        <button className={styles.verifyButton} onClick={handleOtpVerification}>
                            Verify OTP
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
