import { Database } from 'bun:sqlite'
import bcrypt from 'bcryptjs'

const db = new Database('data.db')

db.run(`DROP TABLE IF EXISTS users`);
db.run(`CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'usuario_no_verificado' CHECK (
    role IN ('admin', 'gestor_contenido', 'usuario_verificado', 'usuario_no_verificado')
  )
)`);

db.run(`DROP TABLE IF EXISTS solicitudes`);
db.run(`CREATE TABLE solicitudes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('verificacion', 'contenido')
  )   
)`);

  
const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
)

const hashedAdminPassword = bcrypt.hashSync('admin', 10)
const hashedContentPassword = bcrypt.hashSync('contenido', 10)
const hashedVerifiedPassword = bcrypt.hashSync('usuariov', 10)
const hashedUserPassword = bcrypt.hashSync('usuario', 10)
insertUser.run('admin', 'admin@ejemplo.com', hashedAdminPassword, 'admin')
insertUser.run('contenido', 'contenido@ejemplo.com', hashedContentPassword, 'gestor_contenido')
insertUser.run('usuariov', 'verificado@ejemplo.com', hashedVerifiedPassword, 'usuario_verificado')
insertUser.run('usuario', 'noverificado@ejemplo.com', hashedUserPassword, 'usuario_no_verificado')

export default db
