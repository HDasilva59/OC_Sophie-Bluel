const db = require('./../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = db.users;

exports.signup = async (req, res) => {
	if(!req.body.email || !req.body.password){
		return res.status(400).send({
			message: "Must have email and password"
		});
	}
	try{
		const hash = await bcrypt.hash(req.body.password, 10)
		const user = {
			email: req.body.email,
			password: hash
		}
		await Users.create(user)
		return res.status(201).json({message: 'User Created'})
	}catch (err){
		return res.status(500).send({
			message: err.message
		});
	}

}

exports.login = async (req, res) => {
	const user = await Users.findOne({where: {email: req.body.email}});
	if(user === null){
		return res.status(404).json({message: 'user not found'})
	}else {
		const valid = await bcrypt.compare(req.body.password, user.password)
		if(!valid){
			return res.status(401).json({ error: new Error('Not Authorized') })
		}
		return res.status(200).json({
			userId: user.id,
			token: jwt.sign(
				{userId : user.id},
				process.env.TOKEN_SECRET,
				{ expiresIn: '24h' }
			)
		})

	}
}

exports.forgotPassword = async (req, res) => {
	try{
		const email = req.body.email?.trim()
		const password = req.body.password
		if(!email || !password){
			return res.status(400).json({error: new Error('Bad Request')})
		}
		const user = await Users.findOne({ where: { email } })
		if(!user){
			return res.status(200).json({message: 'If the account exists, the password has been updated'})
		}
		const hash = await bcrypt.hash(password, 10)
		await Users.update({ password: hash }, { where: { id: user.id } })
		return res.status(200).json({message: 'If the account exists, the password has been updated'})
	}catch(err){
		return res.status(500).json({ error: new Error('Something went wrong')})
	}
}
