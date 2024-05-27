import axios, { AxiosError } from "axios";
import { Link, redirect, useLoaderData } from "react-router-dom";
import { decryptUser } from "../utils/users";
import Navigation from "../components/Navigation";

import styles from '../styles/users/users.module.css'
import { useState } from "react";
import DeleteUserModal from "../components/users/DeleteUserModal";
import EditUserModal from "../components/users/EditUserModal";


export interface User {
    id: number
    name: string
    surname: string
    username: string
    email: string | null
    role_id: number
    role: string
    role_description: string | null
}
// eslint-disable-next-line react-refresh/only-export-components
export async function loader(): Promise<{loggedUser: User, users: User[]} | Response>{
    const API_URL = import.meta.env.VITE_API_URL

    const loggedUserString = localStorage.getItem('loggedUser')

    if (!loggedUserString) return redirect('/login')
    
    const loggedUser = decryptUser(loggedUserString)

    if (!loggedUser) return redirect('/login')

    let users: User[] = []
    try {
        const response = await axios.get(`${API_URL}/users`)
        users = response.data as User[]
    } catch (error) {
		const axiosError = error as AxiosError
		if (axiosError.response) {
			console.error(
				`The request was made and the server responded with a status code: ${axiosError.response.status}`
			)
			throw new Error(
				`The request was made and the server responded with a status code: ${axiosError.response.status}`
			)
		} else if (axiosError.request) {
			console.error(`The request was made but no response was received!`)
			throw new Error(`The request was made but no response was received!`)
		} else {
			console.error(
				`Something happened in setting up the request that triggered an Error: ${axiosError.message}`
			)
			throw new Error(
				`Something happened in setting up the request that triggered an Error: ${axiosError.message}`
			)
		}
	}
    return {
        loggedUser: loggedUser,
        users: users
    }
}

export default function Users() {
    const {loggedUser, users} = useLoaderData() as {loggedUser: User, users: User[]};

    const [openDeleteModal, setOpenDeleteModal ]= useState<boolean>(false)
    const [openEditModal, setOpenEditModal] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)

    const resetModals = () => {
        setOpenDeleteModal(false)
        setOpenEditModal(false)
        setSelectedUser(undefined)
    }

    return(
        <>
            <Navigation user={loggedUser}/>
            <section className={styles.main}>
                <h1>Uživatelé</h1>
                {loggedUser.role === 'admin' ? <Link to="/addUser" className={styles.userAddButton} >Přidat uživatele</Link> : null}
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Jméno</th>
                            <th>Příjmení</th>
                            <th>Uživatelské jméno</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Popis role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: User) => (
                            <tr key={`user-${user.id}`}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.surname}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.role_description}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setOpenEditModal(true)
                                            setSelectedUser(user)
                                        }}
                                    >Upravit</button>
                                    <button onClick={
                                        () => {
                                            setOpenDeleteModal(true)
                                            setSelectedUser(user)
                                    }
                                    }>Smazat</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <DeleteUserModal opened={openDeleteModal} handleClose={resetModals} userToDelete={selectedUser}/>
            <EditUserModal opened={openEditModal} handleClose={resetModals} userToEdit={selectedUser}/>
        </>
    )
}