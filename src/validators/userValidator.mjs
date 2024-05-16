 const userSchema = {
   email: {
     notEmpty: true,
     isLength: {
       options: { min: 5 },
       errorMessage: 'Username must be at least 8 characters long!',
      
         },
      isEmail: {
         errorMessage: 'Please enter a valid email'
     }
   },
  
 }

 export default userSchema