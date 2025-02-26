import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Notification } from './components/toast/Notification';
import { useSelector } from 'react-redux';
export default function App() {
    const token = useSelector((state) => state.user.user.token);
    console.log(token);
    return (
        <>
            <Notification />
            {token ? <Home /> : <Signup />}
        </>
    );
}
