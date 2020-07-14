const mongoose=require('mongoose')
const Book=require('./book')
const authorSchema=new mongoose.Schema({
	name:{
		type:String,
		required:true
	}
})
authorSchema.pre('remove',async function(next){
	try{
		books=await Book.find({author:this.id}) 
		if (books.length>0){
			next(new Error('You cannot delete this author, as this author has books still'))
		}
		else{
			next()
		}
	}catch{
		next(new Error('error when connecting to the database'))
	}
})
module.exports=mongoose.model('Author',authorSchema)