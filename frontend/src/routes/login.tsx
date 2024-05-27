/* eslint-disable react-refresh/only-export-components */
import { Form, redirect } from "react-router-dom";
import { decryptUser, signIn, signOut } from "../utils/users";
import toast from "react-hot-toast";
import styles from '../styles/login/login.module.css'

export const loader = async () => {
    const loggedUserString = localStorage.getItem('loggedUser')

    if (loggedUserString) {
        const loggedUser = decryptUser(loggedUserString)
        if (loggedUser) {
            toast('Už jste přihlášen!', { icon: '😅' })
            return redirect('/')
        }else{
            signOut()
            return null
        }
    }

    return null
}

export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username  || !password) {
        toast.error('Musíte zadat uživatelské jméno i heslo!', { icon: '🚫' })
        return null
    }

    const result =await signIn(username.toString(), password.toString());

    if (!result) {
        toast.error('Nesprávné jméno a heslo!', { icon: '🚫' })
        return null
    }

    toast.success('Přihlášení proběhlo úspěšně!', { icon: '👍' })
    return redirect('/')
}

const Login = () => {
    return (
        <section className={styles.main}>
            <div className={styles.formWrapper}>
                <h1>Přihlášení</h1>
                <Form 
                    method="POST"
                >  
                    <input type="text" name="username" placeholder="Přihlašovací jméno" required/>
                    <input type="password" name="password" placeholder="Heslo" required/>
                    <button type="submit">Přihlásit se</button>
                </Form>
            </div>
        </section>
    )
}

export default Login;