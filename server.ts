import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import users from './routes/users'


const app = new Hono()

app.route('/api', users)
app.use('/*', serveStatic({ root: './src' }))

const Token1 = process.env.STACK_API_TOKEN;
const Token2 = process.env.GITHUB_REPORT_TOKEN;
const Token3 = process.env.GITHUB_BD_TOKEN;

app.get('/api/tokens', (ctx) => {
  return ctx.json({
    stack_token: Token1,
    reporte_token: Token2,
    bd_token: Token3
  })
})

const port = parseInt(process.env.PORT!) || 3000
console.log(`Running at http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
