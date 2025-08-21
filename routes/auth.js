const express = require("express");

const router=express.Router();
const db=require('../config/db');
const { register, login } = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Legacy route for backward compatibility
router.post('/',async (req,res)=>{
try{
const{f_name,l_name,email,password,profile_pic}=req.body;
const sql=`INSERT INTO users (f_name,l_name,email,password,profile_pic) VALUES (?,?,?,?,?)`;
const[result]=await db.query(sql,[f_name,l_name,email,password,profile_pic]);
res.status(201).json({id:result.insertId,message:'successfully inserted'});
}catch(err){
console.error(err);
res.status(500).json({error:'Internal server error'});
}
});
router.get('/',async (req, res) => {
try{
const sql=`SELECT * FROM users`;
const [rows]=await db.query(sql);
res.status(200).json(rows);
}catch(err){
console.error(err);
res.status(500).json({error:'Internal server error'});
}
});
module.exports=router;
