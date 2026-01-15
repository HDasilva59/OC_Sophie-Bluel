
module.exports = (sequelize, DataTypes) => {
	const PasswordResets = sequelize.define(
		"password_resets",
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false
			},
			tokenHash: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			},
			expiresAt: {
				type: DataTypes.DATE,
				allowNull: false
			},
			usedAt: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},
		{ timestamps: false }
	)
	return PasswordResets
}
