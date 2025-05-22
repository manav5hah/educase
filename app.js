require('dotenv').config();
const express = require('express')
const mysql = require('mysql2')
const bodyparser = require('body-parser')

const app = express()

app.listen(process.env.PORT, () => console.log('Server running on 3000'))

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conn.connect(err => {
    if (err) {
        console.error('Error connecting to DB:', err.stack)
        process.exit(1)
    }
    console.log('Connected to DB');
})

let dbKeys = ['name', 'address', 'latitude', 'longitude'];

app.post('/addSchool', (req, res) => {
    try {
        if (!dbKeys.every(x => x in req.body)) 
            throw new Error('missing property')
        if (req.body.latitude > 90 || req.body.latitude < -90) 
            throw new Error("Wrong latitude")    
        if (req.body.longitude > 180 || req.body.longitude < -180) 
            throw new Error("Wrong longitude")
        conn.query('INSERT INTO school(name, address, latitude, longitude) VALUES (?,?,?,?)', [req.body.name, req.body.address, req.body.latitude, req.body.longitude], (err, result) => {
            if (err) 
                return res.json({ status: 500, error: err })
            console.log('Data added successfully')
            res.json({ status: 200, message: 'OK' })
        })
    }
    catch (err) {
        console.log(err)
        res.send({ status: 500, error: err })
    }
})

app.get('/listSchools', (req, res) => {
    conn.query('SELECT * FROM school', null,(err, result)=>{
        if(err)
            res.json({status: 500, message:'Internal Error'})
        res.json(result)
    })
})