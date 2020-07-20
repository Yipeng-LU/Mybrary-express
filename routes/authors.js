const express=require('express')
const router=express.Router()
const Author=require('../models/author')
const Book=require('../models/book')
router.get('/',async (req,res)=>{
	let searchOption={}
	if (req.query.name!=null&&req.query.name!=''){
		searchOption.name=new RegExp(req.query.name,'i')
	}
	try{
		const authors=await Author.find(searchOption)
		let searchMsg
		if (req.query.name!=null&&req.query.name!=''){
			if (authors.length<2){
				searchMsg=`Found ${authors.length} author related to the search`
			}
			else{
				searchMsg=`Found ${authors.length} authors related to the search`
			}
		}
		res.render('authors/index',{authors:authors,searchOption:req.query.name,successMsg:req.flash('successMsg'),searchMsg:searchMsg})
	}catch{
		res.redirect('/')
	}
})
router.get('/new',(req,res)=>{
	if (req.isAuthenticated()){
		res.render('authors/new',{author:new Author()})
	}
	else{
		req.flash('errorMsg','Please log in')
		res.redirect('/users/login')
	}
})
router.post('/',async (req,res)=>{
	const author=new Author({
		name:req.body.name,
		description:req.body.description,
		userId:req.user.id,
		userName:req.user.name
	})
	try{
		const newAuthor=await author.save()
		req.flash('successMsg','You have successfully created the author')
		res.redirect(`/authors/${newAuthor.id}`)
	}
	catch(e){
		res.render('authors/new',{errorMsg:'error when creating author',author:author})
	}
})
router.get('/:id',async (req,res)=>{
	try{
		const author=await Author.findById(req.params.id)
		const booksByAuthor=await Book.find({author:author.id}).limit(6).exec()
		res.render('authors/show',{author:author,booksByAuthor:booksByAuthor,successMsg:req.flash('successMsg'),errorMsg:req.flash('errorMsg')})
	}catch{
		res.redirect('/')
	}
})
router.get('/:id/edit',async (req,res)=>{
	if (req.isAuthenticated()){
		let author=await Author.findById(req.params.id)
		if (req.user.id==author.userId || author.userId==null){
			try{
				const author=await Author.findById(req.params.id)
				res.render('authors/edit',{author:author})
			}catch{
				res.redirect('authors')
			}
		}
		else{
			req.flash('errorMsg','You do not have right to edit this author')
			res.redirect(`/authors/${req.params.id}`)
		}
	}
	else{
		req.flash('errorMsg','Please log in')
		res.redirect('/users/login')	
	}
})

router.put('/:id',async (req,res)=>{
	let author
	let name
	try{
		author=await Author.findById(req.params.id)
		name=author.name
		description=author.description
		author.name=req.body.name
		author.description=req.body.description
		await author.save()
		req.flash('successMsg','You have successfully edited the author')
		res.redirect(`/authors/${author.id}`)
	}
	catch{
		if (author==null){
			res.redirect('/')
		}
		author.name=name
		author.description=description
		res.render('authors/edit',{errorMsg:'error when editing author',author:author})
	}
})
router.delete('/:id',async (req,res)=>{
	if (req.isAuthenticated()){
		let author=await Author.findById(req.params.id)
		if (author.userId==req.user.id || author.userId==null){
			try{
				books=await Book.find({author:req.params.id})
				if (books.length==0){
					await author.remove()
					req.flash('successMsg','You have successfully deleted the author')
					res.redirect('/authors')
				}
				else{
					req.flash('errorMsg','You cannot delete this author,as there are books belong to this author still')
					res.redirect(`/authors/${req.params.id}`)
				}
			}
			catch{
				if (author==null){
					res.redirect('/')
				}
				res.redirect(`/authors/${author.id}`)
			}
		}
		else{
			req.flash('errorMsg','You do not have right to delete this author')
			res.redirect(`/authors/${req.params.id}`)
		}
	}
	else{
		req.flash('errorMsg','Please log in')
		res.redirect('/users/login')
	}
})
module.exports=router