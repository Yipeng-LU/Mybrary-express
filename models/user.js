const mongoose=require('mongoose')

const UserSchema=new mongoose.Schema({
	name:{
		type:String,
		required:true,
		unique:true
	},
	password:{
		type:String,
		required:true
	},
	date:{
		type:Date,
		default:Date.now
	},
	books:[String]
})
const User=mongoose.model('User',UserSchema)
module.exports=User