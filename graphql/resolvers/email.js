const nodemailer = require('nodemailer');
const Email = require('../../models/Email');
const General = require('../../models/General');
const {validateEmail} = require('../../util/validators');
const { UserInputError } = require('apollo-server-express');
const {OUTLOOK_EMAIL, OUTLOOK_PASSWORD} = require('../../config');

module.exports = {
    Mutation: {
        async sendEmail(_, {
            emailInput: {
                email,
                firstName,
                lastName,
                company,
                phone,
                subject,
                body
            }
        }){
            const {
                valid,
                errors
            } = validateEmail(
                email,
                firstName,
                lastName,
                subject,
                body
            );
            if(!valid) throw new UserInputError('Errors', { errors });
            try{
                const regExValidEmail = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
                const newEmail = new Email({
                    email,
                    firstName,
                    lastName,
                    company,
                    phone,
                    subject,
                    body,
                    sendAt: new Date().toISOString()
                });
                const emailToSend = await newEmail.save();
                const general = await General.findOne();
                const emailGeneral = general.email;
                if(emailGeneral === null || !emailGeneral.match(regExValidEmail))
                    throw new Error('Sorry, you can\'t contact use for now');
                var transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: OUTLOOK_EMAIL,
                        pass: OUTLOOK_PASSWORD
                    }
                });
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var mailOptions = {
                    from: `"NEW EMAIL from ACPLV" <${OUTLOOK_EMAIL}>`,
                    to: emailGeneral,
                    subject: emailToSend.subject,
                    text: body,
                    html: `
                    <h1>
                        ${emailToSend.firstName} ${emailToSend.lastName} ${emailToSend.company ? "(" : ""} ${emailToSend.company ? emailToSend.comany : ""} ${emailToSend.company ? ")" : ""} vous a envoyé un message
                    </h1>
                    <h2>
                        le ${new Date(emailToSend.sendAt).toLocaleDateString('fr-FR', options)} a ${new Date(emailToSend.sendAt).getHours()} heure ${new Date(emailToSend.sendAt).getMinutes()}
                    </h2>
                    <br/>
                    <h3>email: <a href="mailto:${emailToSend.email ? emailToSend.email : ''}">${emailToSend.email ? emailToSend.email : ''}</a></h3>
                    <h3>${emailToSend.phone ? 'phone:' : ''} ${emailToSend.phone ? emailToSend.phone : ''}</h3>
                    <br />
                    <p>${emailToSend.body}</p>
                    `
                };
                await transporter.sendMail(mailOptions);
                return 'Email successfully send.'
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}