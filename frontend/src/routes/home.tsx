import { redirect, useLoaderData } from "react-router-dom";
import { decryptUser } from "../utils/users";
import { User } from "./users";
import Navigation from "../components/Navigation";
import styles from '../styles/home/home.module.css'

// eslint-disable-next-line react-refresh/only-export-components
export async function loader(): Promise<{loggedUser: User} | Response>{
    const loggedUserString = localStorage.getItem('loggedUser')

    if (!loggedUserString) return redirect('/login')
    
    const loggedUser = decryptUser(loggedUserString)

    if (!loggedUser) return redirect('/login')

    return {
        loggedUser: loggedUser,
    }
}

export default function Home() {
    const {loggedUser} = useLoaderData() as {loggedUser: User};
    return(
        <>
            <Navigation user={loggedUser}/>
            <section className={styles.main}>
                <h1>Vítej na mé stránce!</h1>
                <h4>Tvé údaje</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Jméno</th>
                            <th>Příjmení</th>
                            <th>Uživatelské jméno</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Popis role</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{loggedUser.name}</td>
                            <td>{loggedUser.surname}</td>
                            <td>{loggedUser.username}</td>
                            <td>{loggedUser.email}</td>
                            <td>{loggedUser.role}</td>
                            <td>{loggedUser.role_description}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </>
    )
}