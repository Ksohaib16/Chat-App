import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles/Home.module.css';
import { Sidebar } from '../components/home/Sidebar';
import { Chat } from '../components/home/Chat';
import { updateOnlineStatus } from '../redux/slices/conversationSlice';

// Custom hook for media query
function useMediaQuery(query) {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handleChange = (event) => setMatches(event.matches);

        // Add listener using the MediaQueryList API
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}

export const Home = () => {
    const { token, id: userId } = useSelector((state) => state.user.user);
    const [ws, setWs] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const currConversation = useSelector((state) => state.conversation.currConversation);

    useEffect(() => {
        if (!token || !userId) return;

        const wsInstance = new WebSocket(`ws://localhost:3000?userId=${userId}`);

        wsInstance.onopen = () => {
            console.log('WebSocket connected');
        };

        wsInstance.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'users') {
                const filteredUsers = data.users.filter((u) => u !== userId);
                setOnlineUsers(filteredUsers);
                dispatch(updateOnlineStatus({ onlineUsers: filteredUsers }));
            }
        };

        wsInstance.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsInstance.onclose = () => {
            console.log('WebSocket disconnected');
        };

        setWs(wsInstance);

        return () => {
            if (wsInstance.readyState === WebSocket.OPEN) {
                wsInstance.close();
            }
        };
    }, [token, userId, dispatch]);

    return (
        <div className={styles.homeContainer}>
            <div className={styles.homeWrapper}>
                <div className={styles.home}>
                    {isMobile ? (
                        currConversation ? (
                            <div className={styles.mobileChat}>
                                <Chat ws={ws} />
                            </div>
                        ) : (
                            <div className={styles.mobileSidebar}>
                                <Sidebar onlineUsers={onlineUsers} />
                            </div>
                        )
                    ) : (
                        <>
                            <div className={styles.desktopSidebar}>
                                <Sidebar onlineUsers={onlineUsers} />
                            </div>
                            <div className={styles.desktopChat}>
                                <Chat ws={ws} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
