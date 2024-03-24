const express = require('express')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const bcrypt = require('bcrypt')

const path = require('path')

const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'userData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    })

    app.listen(3001, () => {
      console.log('server running at http://localhost:3001/')
    })
  } catch (error) {
    console.log(`DB error : ${error.message}`)

    process.exit(1)
  }
}

initializeDbAndServer()

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body

  const hashedPassword = await bcrypt.hash(request.body.password, 10)

  const userQuery = `SELECT * FROM user WHERE username = ${username};`

  const dbUser = await db.all(userQuery)

  if (dbUser === undefined) {
    if (dbUser.password.length > 5) {
      const createUserQuery = `INSERT INTO

     user (username,name,password,gender,location)

     VALUES 

     {

      '${username}',

      '${name}',

      '${hashedPassword}',

      '${gender}',

      '${location}'

     };`

      const dbResponse = await db.run(createUserQuery)

      const userId = dbResponse.lastID

      response.status(200)

      reposne.send(`User Created Successfully`)
    } else {
      response.status(400)

      response.send('Password is too short')
    }
  } else {
    response.status(400)

    response.send('User already exists')
  }
})

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectQuery);
  if ( dbUser === undefined){
    response.status(400)
    response.send("Invalid user")
  }else{
    const isPasswordMatched = await bcrypt.compare(password,dbUser.password);
    if (isPasswordMatched){
      response.send("Login Success");
    }else{
      response.status(400)
      response.send("Invalid Password")
    }
  }
})

module.exports = app
