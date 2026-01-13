import express from 'express'
const router = express.Router()
import * as z from "zod"
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { log } from 'node:console';

const loginschema = z.object({
    email:z.string().email(),
    password:z.string().min(6)
})

const signupschmea = z.object({
    email:z.string().email(),
    password:z.string().min(6),
    name:z.string().min(6)
})


router.post('/register',async(req,res)=>{
    const {email,password,name} = signupschmea.parse(req.body);
    console.log(email,password,name);
    const check = await prisma.user.findUnique({
        where:{
            email:email,
            name:name
        }
    })
    if(check){
        return res.status(400).json({"Message":"user already existes"});
    }
    else{
        const hashpassword = await bcrypt.hash(password,10)
        try{
            const user = await prisma.user.create({
                data:{
                    email:email,
                    password:hashpassword,
                    name:name,
                    role:'CUSTOMER'
                }
            })
            console.log(user);
            const token = jwt.sign({
                id:user.id,
                role:user.role
            },process.env.JWT_SECRET || 'secretkey',{
                expiresIn:'1h'
            })
            return  res.status(201).json({"Message":"User created successfully",token});

        }
        catch(err){
            console.log(err);
        }
    }
})


router.post('/login',async(req,res,next)=>{
    const {email,password} = loginschema.parse(req.body);
    const user = await prisma.user.findUnique({
        where:{
            email:email
        }
    })
    if(!user){
        return res.status(400).json({"Message":"Invalid email or password"});
    }
    else{
        const checkpassword = await bcrypt.compare(password,user.password);
        if(!checkpassword){
            return res.status(400).json({"Message":"Invalid email or password"});
        }
        else{
            const token = jwt.sign({
                id:user.id,
                role:user.role
            },process.env.JWT_SECRET || 'secretkey',{
                expiresIn:'1h'
            })
            return res.status(200).json({"Message":"Login successful",token});
        }
    }
})
export default router