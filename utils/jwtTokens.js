export const generateToken= (user , message , statuscode , res)=>{
    const token = user.generateJsonWebToken();

    res.status
}