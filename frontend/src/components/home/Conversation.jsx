import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './Conversation.module.css';
export const Conversation = ({ conversationId, onClick, onlineUsers }) => {
    const conversation = useSelector((state) =>
        state.conversation.conversations.find((c) => c.id === conversationId),
    );

    const isOnline = onlineUsers.includes(conversation.otherParticipantId);

    return (
        <div className={styles.conversation} onClick={onClick}>
            <div className={`${styles.profile} ${isOnline ? styles.online : ''}`}>
                {conversation.otherParticipantName.slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.details}>
                <div className={styles.primary}>
                    <span className={styles.name}>{conversation.otherParticipantName}</span>
                    <span className={styles.time}>{conversation.time}</span>
                </div>
                <div className={styles.secondary}>
                    <span className={styles.message}>{conversation.lastMessageContent}</span>
                    <span className={styles}></span>
                </div>
            </div>
        </div>
    );
};
Conversation.propTypes = {
    conversationId: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    onlineUsers: PropTypes.arrayOf(PropTypes.string),
};
