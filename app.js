const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

let db
const dbPath = path.join(__dirname, 'todoApplication.db')
const inititalizeDBserver = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('server running')
    })
  } catch (error) {
    console.log(`DB Error:${error}`)
    process.exit(1)
  }
}

app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', todo = ''} = request.query
  const query = `SELECT * from
        todo WHERE
        todo LIKE='%${todo}%'
        AND status='${status}'
        AND priority='${priority}'
    `
  const todoList = await db.all(query)
  response.send(todoList)
})

app.post('/todos/', async (request, response) => {
  const {id, status, priority, todo} = request.body
  const postQuery = `INSERT INTO
                todo(id, status, priority, todo)
                VALUES(${id}, '${status}', '${priority}', '${todo}');`
  await db.run(postQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const getSpTodoQuery= `SELECT * from todo WHERE id=${todoId};`
  const previousTodo= await db.get(getSpTodoQuery)

  let columnName = ""
  const detail = request.body
  switch (true){
    case detail.todo !== undefined:
      columnName="Todo"
      break
    case detail.priority !== undefined:
      columnName="Priority"
      break
    case detail.status !== undefined:
      columnName="Status"
      break
  }
  const {status = previousTodo.status, priority= previousTodo.priority, todo= previousTodo.todo} = request.body
  const updateQuery= `UPDATE todo
  SET status='${status}', 
  todo='${todo}', 
  priority='${priority}';`
  await db.run(updateQuery)
  response.send(`${columnName} updated`)
})

inititalizeDBserver()
module.exports = app
