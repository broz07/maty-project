from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

import psycopg2
from psycopg2 import sql
import psycopg2.extras

import hashlib

APP_USERNAME = "admin"
APP_PASSWORD = "admin"

PASSWORD_SALT = "somesalt"

# host="localhost" # for localhost
host="postgres" # for docker
database="postgres"
user="postgres"
password="root"
port="5432"

app = FastAPI()

# Configure CORS
origins = [
    "http://127.0.0.1:3000",  # Your frontend origin
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,  # Allow specific origins
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

def hash_password(password: str):
    return hashlib.sha256((password + PASSWORD_SALT).encode("utf-8")).hexdigest()

def connect():
    conn = psycopg2.connect(
        host=host,
        database=database,
        user=user,
        password=password,
        port=port
    )

    return conn

@app.get("/users")
def get_users():
    query = f"select users.id, users.name, surname, username, email, role_id, roles.name as role, roles.description as role_description from public.users inner join public.roles on users.role_id = roles.id;"  

    conn = connect()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(query)

    users = cur.fetchall()

    cur.close()
    conn.close() 

    return users

@app.get("/user")
def get_user(id: int):
    query = f"select users.id, users.name, surname, username, email, role_id, roles.name as role, roles.description as role_description from public.users inner join public.roles on users.role_id = roles.id where users.id={id};"  
    conn = connect()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(query)
    user = cur.fetchone()

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found!")

    cur.close()
    conn.close()

    return user

class AddUserRequestBody(BaseModel):
    name: str
    surname: str
    email: str | None
    username: str
    password: str
    role_id: int | None = 2

@app.post("/user")
def create_user(body: AddUserRequestBody, credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    # Ověření uživatelských údajů pro routu pomocí HTTPBasic autentizace
    if credentials.username != APP_USERNAME or credentials.password != APP_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Pokud není role uživatele specifikována, nastaví se na 2 (uživatel)
    if body.role_id is None:
        body.role_id = 2

    # Pokud email není specifikován, nastaví se na NULL
    if body.email is None:
        body.email = "NULL"
    else:
        body.email = f"'{body.email}'"

    # Zahashování hesla
    body.password = hash_password(body.password)

    query = f"insert into public.users (name, surname, email, username, password, role_id) values ('{body.name}', '{body.surname}', {body.email}, '{body.username}', '{body.password}', {body.role_id});"

    conn = connect()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(query)
        conn.commit()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User creation failed")

    cur.close()
    conn.close()
    return {"detail": "User created successfully!"}


class UpdateUserRequestBody(BaseModel):
    id: int
    name: str
    surname: str
    email: str | None
    username: str
    role_id: int | None = 2

@app.put("/user")
def update_user(body: UpdateUserRequestBody, credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    # Ověření uživatelských údajů pro routu pomocí HTTPBasic autentizace
    if credentials.username != APP_USERNAME or credentials.password != APP_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Pokud není role uživatele specifikována, nastaví se na 2 (uživatel)
    if body.role_id is None:
        body.role_id = 2

    # Pokud email není specifikován, nastaví se na NULL
    if body.email is None:
        body.email = "NULL"
    else:
        body.email = f"'{body.email}'"

    query = f"update public.users set name='{body.name}', surname='{body.surname}', email={body.email}, username='{body.username}', role_id={body.role_id} where id={body.id};"

    conn = connect()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        cur.execute(query)
        conn.commit()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User update failed!")   

    cur.close()
    conn.close()

    return {"detail": "User updated successfully!"}

@app.delete("/user")
def delete_user(id: int, credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    # Ověření uživatelských údajů pro routu pomocí HTTPBasic autentizace
    if credentials.username != APP_USERNAME or credentials.password != APP_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    query = f"delete from public.users where id={id};"

    conn = connect()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        cur.execute(query)
        conn.commit()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User deletion failed!")

    cur.close()
    conn.close()
    
    return {"detail": "User deleted successfully!"}

@app.post("/login")
def login(credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    query = f"select count(*) from public.users where username='{credentials.username}' and password='{hash_password(credentials.password)}';"

    conn = connect()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(query)
    result = cur.fetchone()

    if result["count"] == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    cur.close()
    conn.close()

    return {"detail": "Login successful!"}

class ChangePasswordRequestBody(BaseModel):
    user_id: int
    old_password: str
    new_password: str

@app.patch("/change-password")
def change_password(body: ChangePasswordRequestBody, credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    # Ověření uživatelských údajů pro routu pomocí HTTPBasic autentizace
    if credentials.username != APP_USERNAME or credentials.password != APP_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    query = f"select count(*) from public.users where id={body.user_id} and password='{hash_password(body.old_password)}';"

    conn = connect()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(query)
    result = cur.fetchone()

    if result["count"] == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Zahashování nového hesla
    new_password = hash_password(body.new_password)

    query = f"update public.users set password='{new_password}' where id={body.user_id};"

    try:
        cur.execute(query)
        conn.commit()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password change failed!")

    cur.close()
    conn.close()

    return {"detail": "Password changed successfully!"}