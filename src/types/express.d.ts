
import { TokenPayload } from "../utils/generateToken";

declare global {
  namespace Express {
    
    interface Request {
     
      user?: TokenPayload;

    
      listing?: any;

    
      booking?: any;

     
      review?: any;

      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };

      file?: Express.Multer.File;

     
      rawBody?: Buffer;
    }

    
    interface User {
      id: string;
      email: string;
      role: "tourist" | "guide" | "admin";
      name?: string;
      profilePic?: string;
    }

    
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer: Buffer;
      }
    }
  }
}


declare module "*.json" {
  const value: any;
  export default value;
}

export {};