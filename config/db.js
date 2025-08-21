const mysql=require('mysql2/promise');


const pool=mysql.createPool({
    host:process.env.DB_HOST||'localhost',
    user:process.env.DB_USER||'root',
    password:process.env.DB_PASSWORD||'A002#tz1',
    database:process.env.DB_NAME||'wapangaji',
    port:process.env.DB_PORT||3306
});

pool.getConnection()
.then(connection=>{
    console.log('database connected');
    connection.release();
})
.catch(err=>{
    console.log('database connection error');
    console.log(err);
});

module.exports = pool;
