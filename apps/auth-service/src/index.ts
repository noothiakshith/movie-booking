import 'dotenv/config.js'
import cookieParser from "cookie-parser"
import express from "express"
import auth from './routes/auth.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/auth',auth);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`)
})
