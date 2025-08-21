const db=require('./config/db');
const express=require('express');
const app=express();
const path=require('path');
const https = require('https');
const fs = require('fs');
const port=3001;

// HTTPS options
const httpsOptions = {
    key:fs.readFileSync(path.join(__dirname,'ssl','server.key')),
  cert:fs.readFileSync(path.join(__dirname,'ssl','server.crt'))
};

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
const authRoutes=require('./routes/auth');
const servicesRoutes=require('./routes/services');
const uploadRoutes=require('./routes/upload');
const adminRoutes=require('./routes/admin');

app.use('/api/auth',authRoutes);
app.use('/api/services',servicesRoutes);
app.use('/api/upload',uploadRoutes);
app.use('/api/admin',adminRoutes);

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});

https.createServer(httpsOptions, app).listen(port,()=>{
    console.log(`Server is running on port ${port}`);
    console.log(`Access the application at https://localhost:${port}`);
});