const {pool} = require('../helpers/database/postgres')

module.exports = server => {
    server.get('/user2', async(req, res) => {
        const response = await pool.query('SELECT * FROM users');
        res.send(200, {
            data: response.rows,
            message: "success"
        })
    })
}