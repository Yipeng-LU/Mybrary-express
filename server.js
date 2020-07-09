if (process.env.NODE_ENV!='production'){
	require('dotenv').config()
}
const express=require('express')
const app=express()
const expressLayouts=require('express-ejs-layouts')
const port=process.env.PORT||3000
const indexRouter=require('./routes/index')
const mongoose=require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex:true })
.then(console.log('database is connected'))
.catch(err=>{
	console.log(err)
})
app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use('/',indexRouter)
app.listen(port,console.log(`app listening on port ${port}`))