import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req, res) => {
   //get user deatails from frontend/postman
   //validation - empty
   // check if user already exist: username, email
   // check gor images, check for avatar 
   //upload them to cloudinary, avatar
   // create user object - create entry in database(.create)
   // remove password and refresh token field from response
   // check for user creation
   // return res 

   const { fullName, email, username, password } = req.body
   console.log("email", email);


// THIS IS FOR NUB
//    if(fullName === "") {
//     throw new ApiError(400,"fullName is required");
//    }

// THIS IS FOR PRO:=

if(
    [fullName, email, username, password].some((field) =>
    field?.trim() === "")
) {
    throw new ApiError(400, "All fields are required");
}

    //Check user is present or not
  const existeUser = User.findOne({
        $or: [{ username },{ email }]
    })

    if( existeUser ) {
        throw new ApiError(409, "User with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export { registerUser }