const express = require('express');
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../config");
const { authMiddleware } = require("../middleware");
const {User} = require("backend/db.js");
const { Account } = require('../db');

// signup

const signupBody = zod.object({
    username: zod.string().email(),
    firstname: zod.string(),
    lastname: zod.string(),
    password: zod.string()
})

router.post("/signup", async(req, res) => {
    const {success} = signupBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser){
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastName
    })
    const userId = user._id;

    // account

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);
    
    res.json({
        message: "User created successfully",
        token: token
    })
})


// Signin

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async(req, res) => {
    const{success} = signinBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Incorrect Input"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in!"
    })
})

// update

const updateBody = zod.object({
    password: zod.string().optional(),
    firstname: zod.string().optional(),
    lastname: zod.string().optional()
})

router.put("/", authMiddleware, async(req,res) => {
    const { success } = updateBody.safeParse(req.body)
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    await User.updateOne({_id: req.userId}, req.body);

    res.json({
        message: "Updated Successfully"
    })
})

// get user 

router.get("/bulk", async(req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": filter
            }
        }, {
            Lastname: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastName,
            _id: user._id
        }))
    })
})

modult.exports = router;