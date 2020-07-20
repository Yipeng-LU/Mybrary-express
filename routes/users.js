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
		res.render('users/login',{errorMsg:req.flash('errorMsg'),successMsg:req.flash('successMsg'),error:req.flash('error'),name:req.flash('name')})
	}
})
router.get('/register',(req,res)=>{
	res.render('users/register')
})
router.get('/changePassword',(req,res)=>{
	if(req.isAuthenticated()){
		res.render('users/changePassword')
	}
	else{
		req.flash('errorMsg','Please log in')
		res.redirect('/users/login')
	}
	res.render('users/changePassword')
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
					res.render('users/login',{successMsg:'You have successfully registered',name:name})
				}).catch((err)=>{
					console.log(err)
				})
			})
		})
	}

})
router.post('/changePassword',(req,res)=>{
	let errors=[]
	if (req.body.password!=req.body.password2){
		errors.push({msg:'Passwords do not match'})
	}
	if (req.body.password.length<6){
		errors.push({msg:'Password should be at least 6 characters'})
	}
	if (errors.length>0){
		res.render('users/changePassword',{errors:errors})
	}
	else{
		let user=req.user
		const name=user.name
		user.password=req.body.password
		bcrypt.genSalt(10,(err,salt)=>{
			bcrypt.hash(user.password,salt,(err,hash)=>{
				if (err){
					throw err
				}
				user.password=hash
				user.save().then((user)=>{
					req.logout()
					req.flash('successMsg','You have successfully changed your password')
					req.flash('name',name)
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
	const name=req.user.name
	req.logout()
	req.flash('successMsg','You have successfully logged out')
	req.flash('name',name)
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
		res.render('users/dashBoard',{user:req.user,books:books,successMsg:`Welcome, ${req.user.name}`})
	}
	else{
		req.flash('errorMsg','Please log in')
		res.redirect('/users/login')
	}
})
module.exports=router;