const express=require('express')
const router=express.Router()
const Author=require('../models/author')
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
		//res.redirect(`/authors/${newAuthor.id}`)
		res.redirect('/authors')

	}
	catch{
		res.render('authors/new',{errorMsg:'error when creating author',author:author})
	}
})
module.exports=router