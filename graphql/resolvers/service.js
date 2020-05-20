const Service = require('../../models/Service');

module.exports = {
    Query: {
        async getServices(){
            try{
                const services = await Service.find();
                return services;
            } catch(err) {
                throw new Error(err);
            }
        }
    }
}