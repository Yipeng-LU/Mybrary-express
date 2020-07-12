const express=require('express')
const router=express.Router()
const Book=require('../models/book')
const Author=require('../models/author')
const path=require('path')
const fs=require('fs')
const multer=require('multer')
const uploadPath=path.join('public',Book.coverImageBasePath)
const imageMimeTypes=['image/jpeg','image/png','images/gif']
const upload=multer({
	dest:uploadPath,
	fileFilter:(req,file,callback)=>{
		callback(null,imageMimeTypes.includes(file.mimetype))
	}
})
router.get('/',async (req,res)=>{
	let query=Book.find()
	if (req.query.title!=null &&req.query.title!=''){
		query=query.regex('title',new RegExp(req,query.title,'i'))
	}
	if (req.query.publishedBefore!=null &&req.query.publishedBefore!=''){
		query=query.lte('publishDate',req.query.publishedBefore)
	}
	if (req.query.publishedAfter!=null &&req.query.publishedAfter!=''){
		query=query.gte('publishDate',req.query.publishedAfter)
	}
	try{
		const books=await query.exec()
		res.render('books/index',{books:books,searchOption:req.query})
	}catch{
		res.redirect('/')
	}

})
router.get('/new',async (req,res)=>{
	try{
		const authors=await Author.find()
		const book=new Book()
		res.render('books/new',{authors:authors,book:book})
	} catch{
		res.redirect('/books')
	}
})
router.post('/',upload.single('cover'),async (req,res)=>{
	let fileName=null
	if (req.file!=null){
		fileName=req.file.filename
	}
	const book=new Book({
		title:req.body.title,
		author:req.body.author,
		publishDate:new Date(req.body.publishDate),
		pageCount:req.body.pageCount,
		description:req.body.description,
		coverImageName:fileName
	})
	try{
		const newBook=await book.save()
		//res.redirect(`books/${newBook.id}`)
		res.redirect('books')

	}catch{
		if (book.coverImageName!=null){
			removeBookCover(book.coverImageName)
		}
		try{
			const authors=await Author.find()
			res.render('books/new',{authors:authors,book:book,errorMsg:'Error creating a new book'})
		} catch{
			res.redirect('/books')
		}
	}
})
function removeBookCover(fileName){
	fs.unlink(path.join(uploadPath,fileName),err=>{
		if (err){
			console.log(err)
		}
	})

}
module.exports=router