const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const { APIError, BadRequestError } = require('../utils/app-errors')


// All Business logic will be here
class CustomerService {

    constructor(){
        this.repository = new CustomerRepository();
    }

    async SignIn(userInputs){

        const { email, password } = userInputs;
        
        try {
            
            const existingCustomer = await this.repository.FindCustomer({ email});

            if(existingCustomer){
            
                const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);
                
                if(validPassword){
                    const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id});
                    return FormateData({id: existingCustomer._id, token });
                } 
            }
    
            return FormateData(null);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }

       
    }

    async SignUp(userInputs){
        
        const { email, password, phone } = userInputs;
        
        try{
            // create salt
            let salt = await GenerateSalt();
            
            let userPassword = await GeneratePassword(password, salt);
            
            const existingCustomer = await this.repository.CreateCustomer({ email, password: userPassword, phone, salt});
            
            const token = await GenerateSignature({ email: email, _id: existingCustomer._id});

            return FormateData({id: existingCustomer._id, token });

        }catch(err){
            throw new APIError('Data Not found', err)
        }

    }

    async AddNewAddress(_id,userInputs){
        
        const { street, postalCode, city,country} = userInputs;
        
        try {
            const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city,country})
            return FormateData(addressResult);
            
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
        
    
    }

    async GetProfile(id){

        try {
            const existingCustomer = await this.repository.FindCustomerById({id});
            return FormateData(existingCustomer);
            
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetShopingDetails(id){

        try {
            const existingCustomer = await this.repository.FindCustomerById({id});
    
            if(existingCustomer){
               return FormateData(existingCustomer);
            }       
            return FormateData({ msg: 'Error'});
            
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetWishList(customerId){

        try {
            const wishListItems = await this.repository.Wishlist(customerId);
            return FormateData(wishListItems);
        } catch (err) {
            throw new APIError('Data Not found', err)           
        }
    }

    async AddToWishlist(customerId, product){
        try {
            const wishlistResult = await this.repository.AddWishlistItem(customerId, product);        
           return FormateData(wishlistResult);
    
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageCart(customerId, product, qty, isRemove){
        try {
            const cartResult = await this.repository.AddCartItem(customerId, product, qty, isRemove);        
            return FormateData(cartResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageOrder(customerId, order){
        try {
            const orderResult = await this.repository.AddOrderToProfile(customerId, order);
            return FormateData(orderResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async SubscribeEvents(payload) {
        try {
            payload = JSON.parse(payload);
            const { event, data } = payload || {};
    
            if (!data) {
                console.error("Invalid payload structure:", payload);
                throw new BadRequestError("Payload is missing data");
            }
    
            const userId = data.userId || null;
            const product = data.product || null;
            const order = data.order || null;
            const qty = data.qty || 0;
    
            if (!userId) {
                console.error("Missing userId in the event data:", data);
                throw new BadRequestError("UserId is required");
            }
    
            switch (event) {
                case 'ADD_TO_WISHLIST':
                case 'REMOVE_FROM_WISHLIST':
                    if (product) {
                        await this.AddToWishlist(userId, product);
                    } else {
                        console.error("Product data missing for wishlist operation");
                    }
                    break;
                case 'ADD_TO_CART':
                    await this.ManageCart(userId, product, qty, false);
                    break;
                case 'REMOVE_FROM_CART':
                    await this.ManageCart(userId, product, qty, true);
                    break;
                case 'CREATE_ORDER':
                    if (order) {
                        await this.ManageOrder(userId, order);
                    } else {
                        console.error("Order data missing for create order operation");
                    }
                    break;
                case 'TEST':
                    console.log("Working... Subscriber");
                    break;
                default:
                    console.warn("Unhandled event type:", event);
                    break;
            }
        } catch (err) {
            console.error("Error processing payload:", err.message);
            throw new APIError("Error processing event", err);
        }
    }
    

}

module.exports = CustomerService;