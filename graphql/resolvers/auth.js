const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async args => {
        try {
            const user = await User.findOne({ email: args.userInput.email })
            if (user) {
                throw new Error('user already exists');
            }
            const hashedpassword = await bcrypt.hash(args.userInput.password, 12);
            const user1 = new User({
                email: args.userInput.email,
                password: hashedpassword
            })
            const result = await user1.save();
            return { ...result._doc, password: null, _id: result.id };
        }
        catch (err) {
            throw err;
        }
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User does not exists');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('password is incorrect');
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, 'somesupersecretkey', { expiresIn: '1h' });
        return {
            userId: user.id,
            token: token,
            tokenExpiration: 1
        };
    }
};

