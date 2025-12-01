**echo-guide-backend**

basic project folder structure-

echo-guide-backend/
│── package.json
│── tsconfig.json
│── .env
│── .gitignore
│── README.md
│
└── src/
    │── app.ts
    │── server.ts   
    │
    │── config/
    │   ├── index.ts
    │   ├── database.ts
    │   ├── logger.ts
    │   ├── cloudinary.ts       
    │   └── payment.ts  
    │
    │── utils/
    │   ├── ApiError.ts
    │   ├── ApiResponse.ts
    │   ├── catchAsync.ts
    │   ├── generateToken.ts
    │   ├── hashPassword.ts        
    │   └── helpers.ts     
    │
    │── middlewares/
    │   ├── auth.ts               
    │   ├── roleCheck.ts        
    │   ├── validateRequest.ts   
    │   ├── errorHandler.ts      
    │   ├── uploadHandler.ts  
    │   └── notFound.ts
    │
    │── modules/
    │   ├── auth/
    │   │   ├── auth.controller.ts
    │   │   ├── auth.routes.ts
    │   │   ├── auth.service.ts
    │   │   ├── auth.validation.ts
    │   │   ├── auth.interface.ts  
    │   │   └── auth.model.ts
    │   │
    │   ├── users/
    │   │   ├── user.controller.ts
    │   │   ├── user.routes.ts
    │   │   ├── user.service.ts
    │   │   ├── user.validation.ts
    │   │   ├── user.interface.ts 
    │   │   └── user.model.ts
    │   │
    │   ├── listings/
    │   │   ├── listing.controller.ts
    │   │   ├── listing.routes.ts
    │   │   ├── listing.service.ts
    │   │   ├── listing.validation.ts
    │   │   ├── listing.interface.ts 
    │   │   └── listing.model.ts
    │   │
    │   ├── bookings/
    │   │   ├── booking.controller.ts
    │   │   ├── booking.routes.ts
    │   │   ├── booking.service.ts
    │   │   ├── booking.validation.ts
    │   │   ├── booking.interface.ts 
    │   │   └── booking.model.ts
    │   │
    │   ├── reviews/
    │   │   ├── review.controller.ts
    │   │   ├── review.routes.ts
    │   │   ├── review.service.ts
    │   │   ├── review.validation.ts
    │   │   ├── review.interface.ts  
    │   │   └── review.model.ts
    │   │
    │   ├── payments/
    │   │   ├── payment.controller.ts
    │   │   ├── payment.routes.ts
    │   │   ├── payment.service.ts
    │   │   ├── payment.validation.ts
    │   │   ├── payment.interface.ts
    │   │   └── payment.model.ts
    │   │
    │   └── admin/               
    │       ├── admin.controller.ts
    │       ├── admin.routes.ts
    │       ├── admin.service.ts
    │       └── admin.validation.ts
    │
    │── routes/
    │   └── index.ts       
    │
    │── types/                    
    │   ├── express.d.ts           
    │   └── index.d.ts
    │
    └── constants/
        ├── roles.ts
        ├── bookingStatus.ts
        ├── tourCategories.ts      
        ├── paymentStatus.ts     
        └── index.ts