import axios, { AxiosError } from "axios"
import { User } from "../../routes/users"
import styles from '../../styles/ui/ui.module.css'
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

interface DeleteUserModalProps {
    opened: boolean
    handleClose: () => void
    userToDelete?: User
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({opened, handleClose, userToDelete}) =>{
    const navigate = useNavigate()

    const handleDelete = async () => {

        try {
            await axios.delete(`http://localhost:8000/user?id=${userToDelete?.id}`, {
                auth: {
                    username: 'admin',
                    password: 'admin'
                }
            })
            toast.success('Uživatel byl smazán!', { icon: '👍' })
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
                <h1>Opravdu chcete smazat uživatele {userToDelete ? `${userToDelete.username}` : "..."}?</h1>
                <button onClick={handleDelete}>Potvrdit</button>
                <button onClick={handleClose}>Zrušit</button>
            </div>
        </div>
    )
}

export default DeleteUserModal;