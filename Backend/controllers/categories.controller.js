const db = require('./../models');
const Categories = db.categories
const Works = db.works

exports.findAll = async (req, res) =>  {
	try{
		const works = await Categories.findAll();
		return res.status(200).json(works);
	}catch(err){
		return res.status(500).json({ error: new Error('Something went wrong')})
	}

}

exports.create = async (req, res) => {
	try{
		const name = req.body.name?.trim()
		if(!name){
			return res.status(400).json({error: new Error('Bad Request')})
		}
		const category = await Categories.create({
			name
		})
		return res.status(201).json(category)
	}catch(err){
		return res.status(500).json({ error: new Error('Something went wrong')})
	}
}

exports.update = async (req, res) => {
	try{
		const id = parseInt(req.params.id)
		const name = req.body.name?.trim()
		if(!id || id <= 0 || !name){
			return res.status(400).json({error: new Error('Bad Request')})
		}
		const [updatedCount] = await Categories.update(
			{ name },
			{ where: { id } }
		)
		if(updatedCount === 0){
			return res.status(404).json({message: 'Category not found'})
		}
		const updated = await Categories.findByPk(id)
		return res.status(200).json(updated)
	}catch(err){
		return res.status(500).json({ error: new Error('Something went wrong')})
	}
}

exports.delete = async (req, res) => {
	try{
		const id = parseInt(req.params.id)
		if(!id || id <= 0){
			return res.status(400).json({error: new Error('Bad Request')})
		}
		const worksCount = await Works.count({ where: { categoryId: id } })
		if(worksCount > 0){
			return res.status(409).json({message: 'Category is used by existing works'})
		}
		const deletedCount = await Categories.destroy({ where: { id } })
		if(deletedCount === 0){
			return res.status(404).json({message: 'Category not found'})
		}
		return res.status(204).json({message: 'Category Deleted Successfully'})
	}catch(err){
		return res.status(500).json({ error: new Error('Something went wrong')})
	}
}
