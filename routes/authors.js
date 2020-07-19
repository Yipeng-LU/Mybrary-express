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
		res.render('authors/index',{authors:authors,searchOption:req.query.name})
	}catch{
		res.redirect('/')
	}
})
router.get('/new',(req,res)=>{
	res.render('authors/new',{author:new Author()})
})
router.post('/',async (req,res)=>{
	const author=new Author({
		name:req.body.name
	})
	try{
		const newAuthor=await author.save()
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
		res.render('authors/show',{author:author,booksByAuthor:booksByAuthor})
	}catch{
		res.redirect('/')
	}
})
router.get('/:id/edit',async (req,res)=>{
	try{
		const author=await Author.findById(req.params.id)
		res.render('authors/edit',{author:author})
	}catch{
		res.redirect('authors')
	}
})

router.put('/:id',async (req,res)=>{
	let author
	let name
	try{
		author=await Author.findById(req.params.id)
		name=author.name
		author.name=req.body.name
		await author.save()
		res.redirect(`/authors/${author.id}`)
	}
	catch{
		if (author==null){
			res.redirect('/')
		}
		author.name=name
		res.render('authors/edit',{errorMsg:'error when editing author',author:author})
	}
})
router.delete('/:id',async (req,res)=>{
	let author
	try{
		author=await Author.findById(req.params.id)
		await author.remove()
		res.redirect('/authors')
	}
	catch{
		if (author==null){
			res.redirect('/')
		}
		res.redirect(`/authors/${author.id}`)
	}
})
module.exports=router