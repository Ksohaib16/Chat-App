import styles from './Button.module.css';
import PropTypes from 'prop-types';

export const Button = ({ text }) => {
    return <button className={styles.signup}>{text}</button>;
};

Button.propTypes = {
    text: PropTypes.string.isRequired,
};
