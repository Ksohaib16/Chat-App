import styles from './AuthWrapper.module.css';
import PropTypes from 'prop-types';

export const AuthWrapper = ({ children }) => {
    return <div className={styles.authWrapper}>{children}</div>;
};

AuthWrapper.propTypes = {
    children: PropTypes.node.isRequired,
};
