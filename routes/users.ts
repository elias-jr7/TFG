import { Hono } from 'hono'
import db from '../db'
import bcrypt from 'bcryptjs'
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"

type User = {
  id: number
  username: string
  email: string
  password: string
  role: string
}

const users = new Hono()

users.post('/register', async (c) => {
  const { username, email, password } = await c.req.json()
  const hashed = bcrypt.hashSync(password, 10)
  try {
      const query_check =db.prepare('SELECT * FROM users WHERE email = ?')
      const existingUser = query_check.get(email)
      if (existingUser) {
        return c.json({
          success: false,
          error: 'Ya existe una cuenta con ese correo electrónico',
        }, 409) 
      }
      const query_register = db.prepare(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
    )
    query_register.run(username, email, hashed, 'usuario_no_verificado')
    return c.json({
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        username:username,
        email:email,
        role: 'usuario_no_verificado'
      }
    })
  } catch (e) {
    return c.json({
      success: false,
      error: 'Error en el servidor',
    }, 500)
  }
})

users.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  try {
    const query_login = db.prepare('SELECT * FROM users WHERE email = ?')
    const user = query_login.get(email) as User | undefined
    if (!user) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404)
    }
    const same_password = bcrypt.compareSync(password, user.password)
    if (!same_password) {
      return c.json({ success: false, error: 'Contraseña incorrecta' }, 401)
    }
    return c.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    return c.json({
      success: false,
      error: 'Error en el servidor',
    }, 500)
  }
})

users.post('/solicitud', async (c) => {
  const { username, email, message, type } = await c.req.json()

  try {
    const query_solicitud = db.prepare('SELECT * FROM solicitudes WHERE email = ?')
    const existing = query_solicitud.get(email)

    if (existing) {
      return c.json({
        success: false,
        error:`Ya has enviado una solicitud con este correo`
      }, 409)
    }
    const query_insert = db.prepare('INSERT INTO solicitudes (username, email, mensaje, type) VALUES (?, ?, ?, ?)')
    query_insert.run(username, email, message, type)

    return c.json({
      success: true,
      message: 'Solicitud enviada correctamente',
    })
  } catch (e) {
    return c.json({
      success: false,
      error: 'Error al guardar la solicitud',
    }, 500)
  }
})

users.get('/solicitudes', (c) => {
  try {
    const query_solicitudes = db.prepare('SELECT * FROM solicitudes')
    const solicitudes = query_solicitudes.all() 

    return c.json({
      success: true,
      data: solicitudes,
    })
  } catch (e) {
    return c.json({
      success: false,
      error: 'Error al obtener las solicitudes',
    }, 500)
  }
})

users.post('/aceptar-solicitud', async (c) => {
  const { username, type } = await c.req.json();

  try {
      const query_accept_update = db.prepare('UPDATE users SET role = ? WHERE username = ?');

      if(type=="contenido"){
        query_accept_update.run('gestor_contenido', username);
      }else{
        query_accept_update.run('usuario_verificado', username);
      }
      
      const query_delete = db.prepare('DELETE FROM solicitudes WHERE username = ?');
      query_delete.run(username);

      return c.json({
          success: true,
          message: 'Rol actualizado y solicitud eliminada correctamente',
      });

  } catch (e) {
      return c.json({
          success: false,
          error: 'Error al procesar la solicitud',
      }, 500);
  }
});


users.post('/rechazar-solicitud', async (c) => {
  const { username } = await c.req.json(); 

  try {    
    const query_delete = db.prepare('DELETE FROM solicitudes WHERE username = ?');
    query_delete.run(username);

    return c.json({
      success: true,
      message: 'Solicitud rechazada y eliminada correctamente',
    });
  } catch (e) {
    return c.json({
      success: false,
      error: 'Error al rechazar la solicitud',
    }, 500);
  }
});



const execPromise = promisify(exec)


users.post("/scrape", async (c) => {
  try {
    const { prompt } = await c.req.json()

    if (!prompt || typeof prompt !== "string" || prompt.length < 10) {
      return c.json(
        {
          success: false,
          error: "El prompt es requerido y debe tener al menos 10 caracteres.",
        },
        400,
      )
    }

    const tempScriptPath = path.join(process.cwd(), "temp_script.py")

    const originalScript = fs.readFileSync(path.join(process.cwd(), "web-scrapper.py"), "utf-8")

    const modifiedScript = originalScript.replace(/'prompt': '.*?'/, `'prompt': '${prompt.replace(/'/g, "\\'")}'`)

    fs.writeFileSync(tempScriptPath, modifiedScript)

    await execPromise(`python ${tempScriptPath}`)

    const outputDir = path.join(process.cwd(), "cybersecurity_info")
    const files = fs.readdirSync(outputDir)

    const results = files.map((file) => {
      const filePath = path.join(outputDir, file)
      const content = fs.readFileSync(filePath, "utf-8")
      return {
        name: file,
        content: content,
      }
    })

    fs.unlinkSync(tempScriptPath)

  fs.rmSync(outputDir, { recursive: true, force: true }) 

      return c.json({
        success: true,
        files: results,
      })
    } catch (e) {
      console.error("Error en el endpoint /scrape:", e)
      return c.json(
        {
          success: false,
          error: "Error interno del servidor",
          details: e instanceof Error ? e.message : String(e),
        },
        500,
      )
    }
})




export default users
