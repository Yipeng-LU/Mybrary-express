const mongoose=require('mongoose')
const Book=require('./book')
const authorSchema=new mongoose.Schema({
	name:{
		type:String,
		required:true,
		unique:true
	},
	description:{
		type:String,
		required:true
	},
	userId:{
		type:String,
		required:true
	},
	userName:{
		type:String,
		required:true
	}
})

module.exports=mongoose.model('Author',authorSchema)