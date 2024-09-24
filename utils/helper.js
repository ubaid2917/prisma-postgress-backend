import { supportedMimes } from "../config/fileSystem.js";
import { v4 as uuidv4 } from "uuid";
import fs from 'fs'
export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2 MB";
  } else if (supportedMimes.includes(mime)) {
    return "Image must be type png,jpg,svg, webp, gif";
  }
  ;
  return null;
};

export const bytesToMb = (bytes) => {
  // convert bytes to mb
  return bytes / (1024 * 1024);
};

// generate unique id
export const generateUniqueName = () => {
  return uuidv4();
};
   

export const genImageUrl = (imgName) => {
   return `${process.env.APP_URL}/images/${imgName}`
} 


// delete old image 
export const removeImage = (imageName) => {
 const path  = process.cwd() + '/public/images/' +  imageName 
 if(fs.existsSync(path)){
    fs.unlinkSync(path)
 }
}


// upload image 
export const uploadImage = (image) => {
  const imageExt = image?.name.split(".");

  console.log("image Ext", imageExt);
  const imageName = generateUniqueName() + "." + imageExt[1];
  console.log("unique name for image", generateUniqueName());

  const uploadPath = process.cwd() + "/public/images/" + imageName;

  image.mv(uploadPath, (err) => {
    if (err) throw err;
  });

  return imageName
}