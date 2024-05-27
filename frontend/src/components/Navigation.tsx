
import { useNavigate } from "react-router-dom";
import { User } from "../routes/users";
import { signOut } from "../utils/users";
import styles from '../styles/ui/ui.module.css'

interface NavigationProps {
    user?: User
}

export const Navigation: React.FC<NavigationProps> = ({user}) => {
    const navigate = useNavigate()
    const logout = () => {
        signOut()
        navigate('/login')
    } 

    return (
        <header className={styles.navbar}>
            <nav>
                <ul>
                    <li><a href="/">Domů</a></li>
                    <li><a href="/users">Správa uživatelů</a></li>
                </ul>
            </nav>
            <div>
                {user && <span>{`${user.name} ${user.surname}`}</span>}
                {user && <button onClick={logout}>Odhlásit se</button>}
            </div>
        </header>
    )
}

export default Navigation;