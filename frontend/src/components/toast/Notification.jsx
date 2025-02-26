import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Notification.module.css';

export const Notification = () => {
    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                toastClassName={styles.customToastContainer}
                progressClassName={styles.customProgressBar}
            />
        </div>
    );
};
