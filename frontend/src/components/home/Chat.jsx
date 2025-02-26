import styles from './Chat.module.css';
import { useEffect, useRef, useState } from 'react';
import { Message } from './Message';
import { SendHorizontal, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCurrConversation, updateLastMessage } from '../../redux/slices/conversationSlice';
import PropTypes from 'prop-types';

import { toast } from 'react-toastify';
export const Chat = ({ ws }) => {
    const dispatch = useDispatch();
    const scrollRef = useRef();
    const [showInfo, setShowInfo] = useState(false);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const currConversation = useSelector((state) => state.conversation.currConversation);
    const currUserId = useSelector((state) => state.user.user.id);
    const token = useSelector((state) => state.user.user.token);

    useEffect(() => {
        if (!ws) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message' && data.conversationId === currConversation?.id) {
                setMessages((prev) => [
                    ...prev,
                    {
                        content: data.content,
                        sender: { id: data.senderId },
                        createdAt: formatTime(data.timestamp),
                    },
                ]);
            } else {
                if (data.conversationId !== currConversation?.id) {
                    console.log(
                        "Message doesn't belong to the current conversation Push to unread",
                    );
                }
            }
        };

        ws.addEventListener('message', handleMessage);
        return () => ws.removeEventListener('message', handleMessage);
    }, [ws, currConversation]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };
    useEffect(() => {
        const fetchMessages = async () => {
            if (!currConversation?.id) return;

            try {
                const response = await axios.get(
                    `http://localhost:3000/v1/user/messages/${currConversation.id}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );

                setMessages(
                    response.data.data.map((msg) => ({
                        ...msg,
                        createdAt: formatTime(msg.createdAt),
                    })),
                );

                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [currConversation, token]);

    // WebSocket msg
    const handleSend = async () => {
        if (!content.trim() || !currConversation) return;

        try {
            if (ws) {
                ws.send(
                    JSON.stringify({
                        type: 'message',
                        content,
                        senderId: currUserId,
                        receiverId: currConversation.otherParticipantId,
                        conversationId: currConversation.id,
                    }),
                );
            }

            const response = await axios.post(
                'http://localhost:3000/v1/user/send',
                {
                    content,
                    receiverId: currConversation.otherParticipantId,
                    conversationId: currConversation.id,
                },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            if (!response.data.data.success) {
                toast.error(response.data.data.message);
            }

            setMessages((prev) => [
                ...prev,
                {
                    content,
                    sender: { id: currUserId },
                    createdAt: formatTime(new Date().toISOString()),
                },
            ]);
            dispatch(
                updateLastMessage({
                    conversationId: currConversation.id,
                    lastMessageContent: content,
                }),
            );
            setContent('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const toggleInfo = () => {
        setShowInfo(!showInfo);
    };

    // Close conversation
    const closeConversation = () => {
        dispatch(setCurrConversation(null));
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!currConversation) {
        return (
            <div className={styles.noConversation}>
                Please select a conversation to start chatting
            </div>
        );
    }

    return (
        <div className={styles.chat}>
            <div className={styles.chatContent}>
                <div className={styles.header}>
                    <X className={styles.closeCon} strokeWidth={2} onClick={closeConversation} />

                    <div className={styles.profile} onClick={toggleInfo}>
                        {currConversation.otherParticipantName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className={styles.name}>{currConversation.otherParticipantName}</div>
                </div>
                <div className={styles.messages}>
                    {messages.map((message) => (
                        <Message key={message.id} message={message} />
                    ))}
                    <div ref={scrollRef} />
                </div>
                <div className={styles.msgInput}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Message"
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                            }}
                            className={styles.input}
                        />
                        <button className={styles.send} onClick={handleSend}>
                            <SendHorizontal />
                        </button>
                    </div>
                </div>
            </div>

            {showInfo && (
                <div className={styles.info}>
                    <X className={styles.closeBtn} strokeWidth={1.25} onClick={toggleInfo} />
                    <div className={styles.infoHeader}>
                        <div className={styles.profile}>JS</div>
                        <div className={styles.name}>{currConversation.otherParticipantName}</div>
                        <div className={styles.number}>
                            {currConversation.otherParticipantEmail}
                        </div>
                        <div className={styles.email}>
                            {currConversation.otherParticipantNumber}
                        </div>
                    </div>
                    <div className={styles.separator}></div>
                </div>
            )}
        </div>
    );
};

Chat.propTypes = {
    ws: PropTypes.instanceOf(WebSocket),
};
