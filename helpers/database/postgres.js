const { Pool } = require('pg')

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'ozora08mei',
    database: 'firstapi',
    port: '5432'
})

module.exports = {pool}