import axios, { AxiosError } from "axios";
import { User } from "../routes/users";
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'secretKey'

export const encryptUser = (user: User): string => {
    const userJson = JSON.stringify(user)
    const encryptedUser = CryptoJS.AES.encrypt(userJson, SECRET_KEY).toString();
    return encryptedUser;
}

export const decryptUser = (encryptedUser: string): User | false => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedUser, SECRET_KEY);
      const decryptedUserJson = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedUserJson) {
        return false;
      }
      const user: User = JSON.parse(decryptedUserJson);
      return user;
    } catch (error) {
      return false;
    }
}

export const signIn = async (username: string, password: string): Promise<boolean> => {
    try {
        console.log('username', username)
        console.log('password', password)

        // const authHeader = `Basic ${btoa(`${username}:${password}`)}`
        
        let response = await axios.post('http://localhost:8000/login',{}, {
            withCredentials: true,
            auth: {
                username: username,
                password: password
            }
        })

        if (response.status !== 200) {
            return false
        }

        response = await axios.get('http://localhost:8000/user',
            {
                params: {
                    username: username
                },
            }
        )

        const encryptedUser = encryptUser(response.data as User)
        localStorage.setItem('loggedUser', encryptedUser)
        
        return true
    } catch (error) {
        const axiosError = error as AxiosError
        if (axiosError.response) {
            if (axiosError.response.status === 401) {
                return false
            }
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
}

export const signOut = () => {
    localStorage.removeItem('loggedUser')
    return
}

