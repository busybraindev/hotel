export const getUser=async(req,res)=>{
    try{
        const role =req.user.role
        const rs =req.user.recentSearchedCities
        res.json({success:true,role,rs})

    }
    catch(err){
        res.json({success:false,message:err.message})

    }
}

export const SRs =async(req,res)=>{
    try{
        const {recentSearchedCities}=req.body
        const user =await req.user
        if(user.recentSearchedCities.length<3){
            user.recentSearchedCities.push(recentSearchedCities)
        }else{
            user.recentSearchedCities.shift()
            user.recentSearchedCities.push(recentSearchedCities)
        }
         await user.save()
    res.json({success:true,message:"City added"})
    }
    catch(errr){
        res.json({success:false, message:err.message})
    }
   
}