
const { StatusCodes } = require('http-status-codes');
const { UserRepository, RoleRepository} = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { Auth, Enums } = require('../utils/common');
const user = require('../models/user');
const userRepo = new UserRepository();
const roleRepo = new RoleRepository();


async function create(data){
    try {
        const user = await userRepo.create(data);   
        const role = await roleRepo.getRoleByName(Enums.USER_ROLES_ENUMS.CUSTOMER);
        user.addRole(role);
        return user;
    } catch (error){
        if(error.name === 'SequelizeValidationError'||error.name === 'SequelizeUniqueConstraintError'){
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            })
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError("Not able to create user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function signin(data){
    try{
        const user = await userRepo.getUserByEmail(data.email);
        if(!user){
            throw new AppError("User email not found", StatusCodes.NOT_FOUND);
        }
        const passwordMatch = Auth.checkPassword(data.password, user.password);
        if(!passwordMatch){
            throw new AppError("Password is incorrect", StatusCodes.BAD_REQUEST);
        }
        const jwt = Auth.createToken({id: user.id, email: user.email});
        return jwt;
    }
    catch(error){
        if(error instanceof AppError){
            throw error;
        }
        console.log(error);
        throw new AppError('something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

  async function isAuthenticated(token){
       try {
         if(!token){
            throw new AppError('Missing JWT token',StatusCodes.BAD_REQUEST);
         }
         const response=Auth.verifyToken(token);

         const user=await userRepo.get(response.id);
         if(!user){
            throw new AppError('No user found',StatusCodes.BAD_REQUEST);
         }
         return user.id;
       } catch (error) {
        if(error instanceof AppError) throw error; 
           if(error.name=='JsonWebTokenError'){
            throw new AppError('Invalid JWT token',StatusCodes.BAD_REQUEST);
           }

           if(error.name=='TokenExpiredError'){
             throw new AppError('JWT token expired',StatusCodes.BAD_REQUEST);
           }
           console.log(error);
           throw new AppError('something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
       }  
  }

  async function addRoleToUser(data){
    try{
        const user = await userRepo.get(data.id);
        if(!user){
            throw new AppError("User not found for the given id", StatusCodes.NOT_FOUND);
        }
        const role = await roleRepo.getRoleByName(data.role);
        if(!role){
            throw new AppError("no user found for the given role", StatusCodes.NOT_FOUND);
        }
        user.addRole(role);
        return user;
    }
    catch(error){
        if(error instanceof AppError){
            throw error;
        }
        console.log(error);
        throw new AppError('something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async function isAdmin(id){
       try{
        const user = await userRepo.get(id);
        if(!user){
            throw new AppError("User not found for the given id", StatusCodes.NOT_FOUND);
        }
        const adminrole = await roleRepo.getRoleByName(Enums.USER_ROLES_ENUMS.ADMIN);
        if(!adminrole){
            throw new AppError("no user found for the given role", StatusCodes.NOT_FOUND);
        }
        return user.hasRole(adminrole);
    }
    catch(error){
        if(error instanceof AppError){
            throw error;
        }
        console.log(error);
        throw new AppError('something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

module.exports = {
    create,
    signin,
    isAuthenticated,
    addRoleToUser,
    isAdmin
}