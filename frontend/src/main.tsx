import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Login, { loader as loginLoader, action as loginAction} from './routes/login.tsx'
import Users, { loader as userLoader} from './routes/users.tsx'
import { Toaster } from 'react-hot-toast'
import Home, { loader as homeLoader } from './routes/home.tsx'
import AddUser, {loader as addUserLoader, action as addUserAction} from './routes/addUser.tsx'


const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
      loader: homeLoader
    },
    {
      path: '/login',
      element: <Login/>,
      loader: loginLoader,
      action: loginAction
    },
    {
      path: '/users',
      element: <Users />,
      loader: userLoader, 
    },
    {
      path: '/addUser',
      element: <AddUser />,
      loader: addUserLoader,
      action: addUserAction
    }
  ]
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster 
      position='bottom-right'
    />
  </React.StrictMode>,
)
