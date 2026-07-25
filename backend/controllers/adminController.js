import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';    


// API for adding doctor

const addDoctor = async (req, res) =>{
    try{
        const {name, email, password, image, speciality, degree, experience, about, fees, address} = req.body;
        const imageFile = req.file;

        console.log({name, email, password, image, speciality, degree, experience, about, fees, address}, imageFile)


        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
            return res.json({success:false, message: "Incomplete info"});            
        }

        // validating email format
        if(!validator.isEmail(email)){
            return res.json({success:false, message: "Invalid email format"});
        }

        if(password.length<8){
            return res.json({success:false, message: "Please enter a strong password"});    
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
        const imageUrl = imageUpload.secure_url;

        // create doctor object
        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: date.now()
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({success:true, message: "Doctor added successfully"});
    }
    catch(error){
       res.json({success:false, message: error.message}); 
    }
}

// API for admin login
const loginAdmin = async (req, res) =>{
    try{
        const {email, password} = req.body;
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET_KEY);

            res.json({success:true, token});


        }else{
            res.json({success:false, message: "Invalid credentials"});
        }
    }catch(error){ 

    }
}

export {addDoctor, loginAdmin}