// import axios, { AxiosError } from "axios"
import { useRef } from "react"
import { User } from "../../routes/users"
import styles from '../../styles/ui/ui.module.css'
import toast from "react-hot-toast"
import axios, { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"


interface EditUserModalProps {
    opened: boolean
    handleClose: () => void
    userToEdit?: User
}



export const EditUserModal: React.FC<EditUserModalProps> = ({opened, handleClose, userToEdit}) =>{
    const navigate = useNavigate()

    const name = useRef<HTMLInputElement>(null)
    const surname = useRef<HTMLInputElement>(null)
    const username = useRef<HTMLInputElement>(null)
    const email = useRef<HTMLInputElement>(null)
    const role = useRef<HTMLSelectElement>(null)

    const handleEdit = async(e: React.FormEvent) => {
        e.preventDefault()
        if (!name.current || !surname.current || !username.current || !role.current) return

        if (!name.current.value || !surname.current.value || !username.current.value || !role.current.value) {
            toast.error('Musíte vyplnit všechny povinné údaje!', { icon: '🚫' })
            return
        }

        const requestBody = {
            id: userToEdit?.id,
            name: name.current.value,
            surname: surname.current.value,
            email: email.current?.value || null,
            username: username.current.value,
            role_id: parseInt(role.current.value)
        }

        try {
            await axios.put(`http://localhost:8000/user`, requestBody, {
                auth: {
                    username: 'admin',
                    password: 'admin'
                }
            })
            toast.success('Uživatel byl upraven!', { icon: '👍' })
            navigate('/users', {replace: true})

        } catch (error) {
            const axiosError = error as AxiosError
            if (axiosError.response) {
                toast.error('Něco se pokazilo!', { icon: '🚫' })
                console.error(
                    `The request was made and the server responded with a status code: ${axiosError.response.status}`
                )
            } else if (axiosError.request) {
                console.error(`The request was made but no response was received!`)
                toast.error('Něco se pokazilo!', { icon: '🚫' })
            } else {
                console.error(
                    `Something happened in setting up the request that triggered an Error: ${axiosError.message}`
                )
                toast.error('Něco se pokazilo!', { icon: '🚫' })
            }
        } finally {
            handleClose()
        }
    }

    return (
        <div className={`${styles.modal} ${opened ? `${styles.opened}`:""}`}>
            <div className={styles.modalBody}>
                <h1>Upravit uživatele</h1>
                <form>
                    <label htmlFor="name">Jméno*</label>
                    <input type="text" name="name" defaultValue={userToEdit?.name} required ref={name}/> 
                    <label htmlFor="surname">Příjmení*</label>
                    <input type="text" name="surname" defaultValue={userToEdit?.surname} required ref={surname}/> 
                    <label htmlFor="username" >Uživatelské jméno*</label>
                    <input type="text" name="username" defaultValue={userToEdit?.username} required ref={username}/> 
                    <label htmlFor="email" >E-mail</label>
                    <input type="email" name="email" defaultValue={userToEdit?.email || undefined} ref={email}/> 
                    <label htmlFor="role">Role*</label>
                    <select name="role" required defaultValue={2} ref={role}>
                        <option value={1}>Administrátor</option>
                        <option value={2}>Bězný uživatel</option>
                    </select>
                    <div>
                        <button onClick={handleEdit}>Potvrdit</button>
                        <button onClick={(e) => {
                            e.preventDefault()
                            handleClose()
                        }}>Zrušit</button>
                    </div>
                </form>               
            </div>
        </div>
    )
}

export default EditUserModal;