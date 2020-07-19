const express=require('express');
const router=express.Router();
const User=require('../models/user')
const Book=require('../models/book')
const bcrypt=require('bcryptjs')
const passport=require('passport')
router.get('/login',(req,res)=>{
	if(req.isAuthenticated()){
		res.render('users/dashboard',{user:req.user})
	}
	else{
		res.render('users/login',{successMsg:req.flash('successMsg'),errorMsg:req.flash('errorMsg'),error:req.flash('error')})
	}
})
router.get('/register',(req,res)=>{
	res.render('users/register')
})
router.post('/register',async (req,res)=>{
	const {name,password,password2}=req.body
	let errors=[]
	if (password!=password2){
		errors.push({msg:'Passwords do not match'})
	}
	if (password.length<6){
		errors.push({msg:'Password should be at least 6 characters'})
	}
	user=await User.findOne({name:name})
	if (user){
		errors.push({msg:'User name already exists'})
	}
	if (errors.length>0){
		res.render('users/register',{errors:errors,name:name})
	}
	else{
		const newUser=new User({
			name:name,
			password:password
		})
		bcrypt.genSalt(10,(err,salt)=>{
			bcrypt.hash(newUser.password,salt,(err,hash)=>{
				if (err){
					throw err
				}
				newUser.password=hash
				newUser.save().then((user)=>{
					req.flash('successMsg','You have successfully registered')
					res.redirect('/users/login')
				}).catch((err)=>{
					console.log(err)
				})
			})
		})
	}

})
router.post('/login',(req,res,next)=>{
	passport.authenticate('local',{
		successRedirect:'/users/dashboard',
		failureRedirect:'/users/login',
		failureFlash:true
	})(req,res,next)
})
router.get('/logout',(req,res)=>{
	req.logout()
	req.flash('successMsg','You have successfully logged out')
	res.redirect('/users/login')
})
router.get('/dashboard',async (req,res)=>{
	if (req.isAuthenticated()){
		let user=req.user
		let books=[]
		let book
		bookIds=user.books.slice()
		var i
		let bookId
		for (i=0;i<bookIds.length;i++){
			bookId=bookIds[i]
			book=await Book.findById(bookId)
			if (book){
				books.push(book)
			}
			else{
				user.books.splice(i,1)
			}
		}
		await user.save()
		res.render('users/dashboard',{user:req.user,books:books})
	}
	else{
		req.flash('errorMsg','Please login')
		res.redirect('/users/login')
	}
})
module.exports=router;