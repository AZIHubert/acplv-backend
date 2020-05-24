const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server-express');

const {
    validateRegisterInput,
    validateLoginInput
} = require('../../util/validators');
const { SECRET_KEY } = require('../../config');

const User = require('../../models/User');

const generateToken = user => jwt.sign({
    _id: user.id,
    email: user.email,
    username: user.username,
    isActive: user.isActive,
}, SECRET_KEY, {
    expiresIn: '1h'
});

module.exports = {
    Mutation: {
        async register(_, {
            registerInput: {
                username,
                email,
                password,
                confirmPassword,
                registerConfirmation
            }
        }) {
            const {
                valid,
                errors
            } = validateRegisterInput(
                username,
                email,
                password,
                confirmPassword,
                registerConfirmation
            );
            if(!valid) throw new UserInputError('Errors', { errors });
            const userUsername = await User.findOne({
                username
            });
            if(userUsername) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is already taken'
                    }
                });
            }
            const userEmail = await User.findOne({
                email
            });
            if(userEmail) {
                throw new UserInputError('Email is taken', {
                    errors: {
                        username: 'This email is already taken'
                    }
                });
            }
            password = await bcrypt.hash(password, 12);
            const newUser = new User({
                email,
                username,
                password,
                isActive: false,
                createdAt: new Date().toISOString()
            });
            const res = await newUser.save();
            const token = generateToken(res);
            return {
                ...res._doc,
                _id: res._id,
                token
            }
        },
        async login(_, {
            emailOrUsername,
            password
        }){
            const {
                valid,
                errors
            } = validateLoginInput(emailOrUsername, password);
            if(!valid) throw new UserInputError('Errors', { errors });
            const userUsername = await User.findOne({
                username: emailOrUsername
            });
            const userEmail = await User.findOne({
                email: emailOrUsername
            });
            const user = userUsername || userEmail;
            if(!user){
                errors.username = 'User not found';
                throw new UserInputError('User not found', { errors });
            }
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.password = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', {errors})
            }
            const token = generateToken(user);
            return {
                ...user._doc,
                _id: user._id,
                token
            }
        },
        // async logout(){

        // },
        // async deleteAccount(){

        // }
    }
}