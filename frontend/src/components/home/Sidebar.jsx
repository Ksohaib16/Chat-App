import axios from 'axios';
import { useEffect, useState } from 'react';
import { Conversation } from './Conversation';
import styles from './Sidebar.module.css';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    addConversation,
    setConversations,
    setCurrConversation,
} from '../../redux/slices/conversationSlice';

export const Sidebar = ({ onlineUsers }) => {
    const dispatch = useDispatch();
    const [filter, setFilter] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const token = useSelector((state) => state.user.user.token);
    const currUserId = useSelector((state) => state.user.user.id);
    const conversations = useSelector((state) => state.conversation.conversations);

    const debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get('http://localhost:3000/v1/user/conversations', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const formattedConversations = response.data.data.map((conversation) => {
                    const otherParticipant = conversation.participants.find(
                        (participant) => participant.id !== currUserId,
                    );
                    return {
                        ...conversation,
                        time: formatTime(conversation.updatedAt),
                        otherParticipantName: otherParticipant ? otherParticipant.name : '',
                        otherParticipantEmail: otherParticipant ? otherParticipant.email : '',
                        otherParticipantNumber: otherParticipant ? otherParticipant.number : '',
                        otherParticipantId: otherParticipant ? otherParticipant.id : '',
                    };
                });
                dispatch(setConversations(formattedConversations));
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();
    }, [token, currUserId]);

    const fetchSearchResult = async (filter) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/v1/user/search?filter=${filter}`,
            );
            console.log(response.data.data[0].name);
            if (response.data.data.length > 0) {
                setSearchResult({
                    name: response.data.data[0].name,
                    email: response.data.data[0].email,
                    number: response.data.data[0].number,
                    id: response.data.data[0].id,
                });
                console.log('search result', searchResult);
            } else {
                setSearchResult(null);
            }
        } catch (error) {
            console.error('Error fetching search result:', error);
            setSearchResult(null);
        }
    };

    const debouncedFetchSearchResult = debounce(fetchSearchResult, 300);

    const handleFilterChange = (e) => {
        const value = e.target.value;
        console.log(value);
        setFilter(value);
        if (value) {
            debouncedFetchSearchResult(value);
        } else {
            setSearchResult(null);
        }
    };

    const handleAdd = async () => {
        console.log(searchResult);
        const res = await axios.post(
            'http://localhost:3000/v1/user/create',
            {
                id: searchResult.id,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        const newConversation = {
            ...res.data.data,
            time: formatTime(new Date().toISOString()),
            otherParticipantName: searchResult.name,
            otherParticipantEmail: searchResult.email,
            otherParticipantNumber: searchResult.number,
            otherParticipantId: searchResult.id,
            lastMessageContent: '',
        };
        dispatch(addConversation(newConversation));
        setFilter('');
        setSearchResult(null);
    };

    const handleConversation = (conversationId) => {
        console.log(conversationId);
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation) {
            dispatch(
                setCurrConversation({
                    id: conversation.id,
                    otherParticipantId: conversation.otherParticipantId,
                    otherParticipantName: conversation.otherParticipantName,
                    otherParticipantEmail: conversation.otherParticipantEmail,
                    otherParticipantNumber: conversation.otherParticipantNumber,
                }),
            );
        }
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <img src="/logo.png" alt="" />
            </div>
            <div className={styles.container}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search"
                        value={filter}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className={styles.conversations}>
                    {filter ? (
                        searchResult ? (
                            <div className={styles.conversation} onClick={handleAdd}>
                                <div className={styles.profileResult}>
                                    {searchResult.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.detailsResult}>
                                    <div className={styles.primaryResult}>
                                        <span className={styles.nameResult}>
                                            {searchResult.name}
                                        </span>
                                        <span className={styles.emailResult}>
                                            {searchResult.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noResults}>No results found</div>
                        )
                    ) : (
                        conversations.map((conversation) => (
                            <Conversation
                                key={conversation.id}
                                conversationId={conversation.id}
                                onlineUsers={onlineUsers}
                                onClick={() => handleConversation(conversation.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

Sidebar.propTypes = {
    onlineUsers: PropTypes.array.isRequired,
};
