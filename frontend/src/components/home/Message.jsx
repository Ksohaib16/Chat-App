import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './Message.module.css';

export const Message = ({ message }) => {
    const currUser = useSelector((state) => state.user.user);

    if (!currUser) {
        return <div>Loading...</div>;
    }

    const isOwner = message.sender?.id === currUser.id;

    return (
        <div className={`${styles.msgContainer} ${isOwner ? styles.owner : ''}`}>
            <div className={styles.msg}>
                <p>{message.content}</p>
                <div className={styles.msgInfo}>
                    <div className={styles.msgtime}>{message.createdAt}</div>
                </div>
            </div>
        </div>
    );
};

Message.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        sender: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            email: PropTypes.string,
            number: PropTypes.string,
            status: PropTypes.string,
        }).isRequired,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
};
