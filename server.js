if (process.env.NODE_ENV!='production'){
	require('dotenv').config()
}
const express=require('express')
const app=express()
const expressLayouts=require('express-ejs-layouts')
const port=process.env.PORT||3000
const indexRouter=require('./routes/index')
const authorRouter=require('./routes/authors')
const bookRouter=require('./routes/books')
const userRouter=require('./routes/users')
const mongoose=require('mongoose')
const methodOverride=require('method-override')
const flash=require('connect-flash')
const session=require('express-session')
const passport=require('passport')
require('./config/passport')(passport)
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex:true })
.then(console.log('database is connected'))
.catch(err=>{
	console.log(err)
})
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:false,limit:'10mb'}))
app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
app.use('/',indexRouter)
app.use('/authors',authorRouter)
app.use('/books',bookRouter)
app.use('/users',userRouter)
app.listen(port,console.log(`app listening on port ${port}`))