const {StatusCodes}=require('http-status-codes');

const {ErrorResponse}=require('../utils/common');
const AppError = require('../utils/errors/app-error');
const UserService=require('../services/user-service');

function validateAuthRequest(req,res,next){
    if(!req.body.email){
        ErrorResponse.message='something went wrong while authenticating user';
        ErrorResponse.error=new AppError(['Email was not found in incoming request'],StatusCodes.BAD_REQUEST);

        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.body.password){
        ErrorResponse.message='something went wrong while authenticating user';
        ErrorResponse.error=new AppError(['Password was not found in incoming request'],StatusCodes.BAD_REQUEST);

        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

async function checkAuth(req,res,next){
    try {
         const response= await UserService.isAuthenticated(req.headers['x-access-token']);
           if(response){
            req.user=response;//setting userid in the request object;
            next();
           }
    } catch (error) {
        return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json(error);
    }
}

async function isAdmin(req,res,next){
    const response=await UserService.isAdmin(req.user);
    if(!response){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message:'User not authorised for this action'
        });
    }
    next();
}
module.exports={
    validateAuthRequest,
    checkAuth,
    isAdmin
}