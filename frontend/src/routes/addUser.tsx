/* eslint-disable react-refresh/only-export-components */
import { Form, redirect, useLoaderData } from "react-router-dom"
import { User } from "./users"
import { decryptUser } from "../utils/users"
import Navigation from "../components/Navigation"
import styles from '../styles/addUser/addUser.module.css'
import toast from "react-hot-toast"
import axios, { AxiosError } from "axios"

const checkStrongPassword = (password: string) => {
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    return strongRegex.test(password)
}

export async function loader(): Promise<{loggedUser: User} | Response>{
    const loggedUserString = localStorage.getItem('loggedUser')

    if (!loggedUserString) return redirect('/login')
    
    const loggedUser = decryptUser(loggedUserString)

    if (!loggedUser) return redirect('/login')

    if (loggedUser.role !== 'admin') {
        toast.error('Nemáš oprávnění!!!', { icon: '🚫' })
        return redirect('/')
    }

    return {
        loggedUser: loggedUser,
    }
}

export const action = async ({ request }: { request: Request }) => {
    const API_URL = import.meta.env.VITE_API_URL

    const formData = await request.formData();
    const name = formData.get('name');
    const surname = formData.get('surname');
    const username = formData.get('username');
    const email = formData.get('email');
    const password1 = formData.get('password1');
    const password2 = formData.get('password2');
    const role = formData.get('role');

    if (!name || !surname || !username || !password1 || !password2 || !role) {
        toast.error('Musíte vyplnit všechny povinné údaje!', { icon: '🚫' })
        return null
    }

    if (password1.toString() !== password2.toString()) {
        toast.error('Hesla se neshodují!', { icon: '🚫' })
        return null
    }

    if(!checkStrongPassword(password1.toString())) {
        toast.error('Heslo není dostatečně silné! \n\n Musí obsahovat alespoň jedno velké písmeno, jedno malé písmeno, jedno číslo a mít alespoň 8 znaků.', { icon: '🚫', duration: 5000})
        return null
    }

    const requstbody ={
        name: name.toString(),
        surname: surname.toString(),
        username: username.toString(),
        email: email ? email.toString() : null,
        password: password1.toString(),
        role_id: parseInt(role.toString())
    }
    try {
        const response = await axios.post(`${API_URL}/user`, requstbody, {
            auth: {
                username: 'admin',
                password: 'admin'
            }
        })

        if (response.status === 200) {
            toast.success('Uživatel byl úspěšně přidán!', { icon: '👍' })
            return redirect('/users')
        }

        toast.error('Něco se pokazilo!', { icon: '🚫' })

        return null
    } catch (error) {
		const axiosError = error as AxiosError
		if (axiosError.response) {
            toast.error('Něco se pokazilo!', { icon: '🚫' })
			console.error(
				`The request was made and the server responded with a status code: ${axiosError.response.status}`
			)
            return null

		} else if (axiosError.request) {
            toast.error('Něco se pokazilo!', { icon: '🚫' })
			console.error(`The request was made but no response was received!`)
            return null
			// throw new Error(`The request was made but no response was received!`)
		} else {
            toast.error('Něco se pokazilo!', { icon: '🚫' })
			console.error(
				`Something happened in setting up the request that triggered an Error: ${axiosError.message}`
			)
            return null
		}
	}
   
}

export default function AddUser() {
    const {loggedUser} = useLoaderData() as {loggedUser: User};
    return(
        <>
            <Navigation user={loggedUser}/>
            <section className={styles.main}>
                <div className={styles.formWrapper}>
                    <h1>Přidat uživatele</h1>
                    <Form 
                        method="POST"
                    >  
                        <label htmlFor="name">Jméno*</label>
                        <input type="text" name="name" required/> 
                        <label htmlFor="surname">Příjmení*</label>
                        <input type="text" name="surname" required/> 
                        <label htmlFor="username">Uživatelské jméno*</label>
                        <input type="text" name="username" required/> 
                        <label htmlFor="email">E-mail</label>
                        <input type="email" name="email"/> 
                        <label htmlFor="password1">Heslo*</label>
                        <input type="password" name="password1"/> 
                        <label htmlFor="password2">Heslo znovu*</label>
                        <input type="password" name="password2"/> 
                        <label htmlFor="role">Role*</label>
                        <select name="role" required defaultValue={2}>
                            <option value={1}>Administrátor</option>
                            <option value={2}>Bězný uživatel</option>
                        </select>
                        <button type="submit">Přidat uživatele</button>
                    </Form>
                </div>
            </section>
        </>
    )
}