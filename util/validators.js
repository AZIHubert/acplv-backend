const {
    REGISTER_CONFIRMATION
} = require('../config');

const regExUsernameLength = /(?=.{3,})/;
const regExValidEmail = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
const regExPasswordLength = /(?=.{8,})/;
const regExPasswordLowerCase = /(?=.*[a-z])/;
const regExPasswordUpperCase = /(?=.*[A-Z])/;
const regExPasswordInt = /(?=.*[0-9])/;

module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword,
    registerConfirmation
) => {
    const errors = new Object();
    if(username.trim() === ''){
        errors.username = 'Must not be empty';
    } else if(!username.match(regExUsernameLength)){
        errors.username = 'Must have at least 3 characters';
    } else if(username.match(regExValidEmail)){
        errors.username = 'Must be valid';
    }
    if(email.trim() === ''){
        errors.email = 'Must not be empty'
    } else if(!email.match(regExValidEmail)){
        errors.email = 'Must be a valid email adress';
    }
    if(password.trim() === ''){
        errors.password = 'Must not be empty';
    } else if(!password.match(regExPasswordLength)){
        errors.password = 'Must have at least 8 characters';
    } else if(!password.match(regExPasswordLowerCase)){
        errors.password = 'Must contain at least one lowercase character';
    } else if(!password.match(regExPasswordUpperCase)){
        errors.password = 'Must contain at least one uppercase character';
    } else if(!password.match(regExPasswordInt)){
        errors.password = 'Must contain at least one numerical character';
    } else if(password !== confirmPassword){
        errors.confirmPassword = 'Passwords must match';
    }
    if(registerConfirmation.trim() === ''){
        errors.registerConfirmation = 'Must not be empty';
    } else if(registerConfirmation !== REGISTER_CONFIRMATION){
        errors.registerConfirmation = 'Must be valid'
    }
    return {
        errors,
        valid: !Object.keys(errors).length
    }
}

module.exports.validateLoginInput = (emailOrUsername, password) => {
    const errors = new Object();
    if(emailOrUsername.trim() === ''){
        errors.emailOrUsername = 'Must not be empty';
    }
    if(password.trim() === ''){
        errors.password = 'Must not be empty';
    }
    return {
        errors,
        valid: !Object.keys(errors).length
    }
}