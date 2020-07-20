const express=require('express')
const router=express.Router()
const Book=require('../models/book')
const Author=require('../models/author')
const User=require('../models/user')
const Comment=require('../models/comment')
const imageMimeTypes=['image/jpeg','image/png','images/gif']
router.get('/',async (req,res)=>{
	let query=Book.find()
	if (req.query.title!=null &&req.query.title!=''){
		query=query.regex('title',new RegExp(req.query.title,'i'))
	}
	if (req.query.publishedBefore!=null &&req.query.publishedBefore!=''){
		query=query.lte('publishDate',req.query.publishedBefore)
	}
	if (req.query.publishedAfter!=null &&req.query.publishedAfter!=''){
		query=query.gte('publishDate',req.query.publishedAfter)
	}
	let searchMsg
	try{
		const books=await query.exec()
		if ((req.query.title!=null &&req.query.title!='')||(req.query.publishedBefore!=null &&req.query.publishedBefore!='')||(req.query.publishedAfter!=null &&req.query.publishedAfter!='')){
			if (books.length<2){
				searchMsg=`Found ${books.length} book related to the search`
			}
			else{
				searchMsg=`Found ${books.length} books related to the search`
			}
		}
		res.render('books/index',{books:books,searchOption:req.query,successMsg:req.flash('successMsg'),errorMsg:req.flash('errorMsg'),searchMsg:searchMsg})
	}catch{
		res.redirect('/')
	}

})
router.get('/new',async (req,res)=>{
	if (req.isAuthenticated()){
		try{
			const authors=await Author.find()
			const book=new Book()
			res.render('books/new',{authors:authors,book:book})
		} catch{
			res.redirect('/books')
		}
	}
	else{
		req.flash('errorMsg','Please log in')
		res.redirect('/users/login')
	}
})
router.get('/:id',async (req,res)=>{
	try{
		const book=await Book.findById(req.params.id)
		const author=await Author.findById(book.author)
		const comments=await Comment.find({book:req.params.id})
		let status
		if (req.isAuthenticated()&&req.user.books.includes(req.params.id)){
			status=1
		}
		else{
			status=0
		}
		res.render('books/show',{book:book,author:author,successMsg:req.flash('successMsg'),errorMsg:req.flash('errorMsg'),status:status,comments:comments})
	}catch{
		res.redirect('/')
	}
})
router.get('/:id/edit',async (req,res)=>{
	if (req.isAuthenticated()){
		const book=await Book.findById(req.params.id)
		if (req.user.id==book.userId){
			const book=await Book.findById(req.params.id)
			const authors=await Author.find()
			res.render('books/edit',{book:book,authors:authors})
		}
		else{
			req.flash('errorMsg','You do not have right to edit the book')
			res.redirect(`/books/${req.params.id}`)
		}
	}
	else{
		req.flash('errorMsg','Please log in')
		res.redirect('/users/login')
	}
})
router.get('/:id/favourite',async (req,res)=>{
	if(req.isAuthenticated()){
		let user=req.user
		user.books.push(req.params.id)
		try{
			await user.save()
			req.flash('successMsg','You have successfully added this book')
			res.redirect(`/books/${req.params.id}`)
		}
		catch{
			res.redirect('/books')
		}
	}
	else{
		res.render('users/login',{errorMsg:'Please log in'})
	}
})
router.post('/:id/comments',async (req,res)=>{
	if (req.isAuthenticated()){
		const comment=new Comment({
			content:req.body.comment,
			userId:req.user.id,
			book:req.params.id,
			userName:req.user.name
		})
		await comment.save()
		req.flash('successMsg','You have successfully created a comment')
		res.redirect(`/books/${req.params.id}`)
	}
	else{
		req.flash('errorMsg','Please login')
		res.redirect('/users/login')
	}
	
})
router.get('/:id/remove',async (req,res)=>{
	let user=req.user
	var i
	for (i=0;i<user.books.length;i++){
		if (user.books[i]==req.params.id){
			user.books.splice(i,1)
			break
		}
	}
	try{
		await user.save()
		req.flash('successMsg','You have successfully deleted the book')
		res.redirect(`/books/${req.params.id}`)
	}
	catch{
		res.redirect('/books')
	}
})
router.post('/',async (req,res)=>{

	const book=new Book({
		title:req.body.title,
		author:req.body.author,
		publishDate:new Date(req.body.publishDate),
		pageCount:req.body.pageCount,
		description:req.body.description,
		userId:req.user.id,
		userName:req.user.name
	})
	const cover=JSON.parse(req.body.cover)
	if (cover!=null && imageMimeTypes.includes(cover.type)){
		book.coverImage=new Buffer.from(cover.data,'base64')
		book.coverImageType=cover.type
	}
	try{
		const newBook=await book.save()
		req.flash('successMsg','You have successfully created the book')
		res.redirect(`books/${newBook.id}`)
	}catch{
		try{
			const authors=await Author.find()
			res.render('books/new',{authors:authors,book:book,errorMsg:'Error creating a new book'})
		} catch{
			res.redirect('/books')
		}
	}
})
router.put('/:id',async (req,res)=>{
	let book
	try{
		book=await Book.findById(req.params.id)
		book.title=req.body.title
		book.author=req.body.author
		book.publishDate=new Date(req.body.publishDate)
		book.pageCount=req.body.pageCount
		book.description=req.body.description
		if (req.body.cover){
			const cover=JSON.parse(req.body.cover)
			if (cover!=null && imageMimeTypes.includes(cover.type)){
				book.coverImage=new Buffer.from(cover.data,'base64')
				book.coverImageType=cover.type
			}
		}
		await book.save()
		req.flash('successMsg','You have successfully edited the book')
		res.redirect(`/books/${book.id}`)
	}catch{
		try{
			if (book!=null){
				const authors=await Author.find()
				res.render('books/edit',{authors:authors,book:book,errorMsg:'Error editing a new book'})
			}
			else{
				res.redirect('/')
			}
		} catch{
			res.redirect('/books')
		}
	}
})
router.delete('/:id',async (req,res)=>{
	if (req.isAuthenticated()){
		let book=await Book.findById(req.params.id)
		if (req.user.id==book.userId|| book.userId==null){
			comments=Comment.find({book:req.params.id})
			var i
			var comment
			for (i=0;i<comments.length;i++){
				comment=comments[i]
				await comment.remove()
			}
			await book.remove()
			req.flash('successMsg','You have successfully deleted the book')
			res.redirect('/books')
		}
		else{
			req.flash('errorMsg','You do not have the right to delete this book')
			res.redirect(`/books/${req.params.id}`)
		}
	}
	else{
		req.flash('errorMsg','Please login')
		res.redirect('/users/login')
	}
})
router.delete('/:bookId/comments/:commentId',async (req,res)=>{
	if (req.isAuthenticated()){
		let comment=await Comment.findById(req.params.commentId)
		if (req.user.id==comment.userId){
			await comment.remove()
			req.flash('successMsg','You have successfully deleted the comment')
			res.redirect(`/books/${req.params.bookId}`)
		}
		else{
			req.flash('errorMsg','You do not have the right to delete this comment')
			res.redirect(`/books/${req.params.bookId}`)
		}
	}
	else{
		req.flash('errorMsg','Please login')
		res.redirect('/users/login')
	}
})


module.exports=router