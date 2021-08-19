const express = require('express')
const path = require('path')

const app = express()

//set template
app.set('views', path.resolve(path.resolve(), 'views'))
app.set('view engine', 'ejs')

// Serve static resources
app.use(express.static(path.resolve(path.resolve(), 'public')))

app.use("/", function (req, res, next) {
    res.render('index.ejs')
})

app.listen(8000, () => console.log('Server is now running in http://127.0.0.1:8000'))