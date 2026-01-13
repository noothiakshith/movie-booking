import cookieParser from "cookie-parser"
import express from "express"
const app = express()

app.use(express.json())
app.use(cookieParser())

app.listen(3000,()=>{
    console.log("Listening on port 3000")
})