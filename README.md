A8

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
    │   └── logger.ts
    │
    │── utils/
    │   ├── ApiError.ts
    │   ├── ApiResponse.ts
    │   ├── catchAsync.ts
    │   └── generateToken.ts
    │
    │── middlewares/
    │   ├── auth.ts               
    │   ├── validateRequest.ts   
    │   ├── errorHandler.ts      
    │   └── notFound.ts
    │
    │── modules/
    │   ├── auth/
    │   │   ├── auth.controller.ts
    │   │   ├── auth.routes.ts
    │   │   ├── auth.service.ts
    │   │   ├── auth.validation.ts
    │   │   └── auth.model.ts
    │   │
    │   ├── users/
    │   │   ├── user.controller.ts
    │   │   ├── user.routes.ts
    │   │   ├── user.service.ts
    │   │   ├── user.validation.ts
    │   │   └── user.model.ts
    │   │
    │   ├── listings/
    │   │   ├── listing.controller.ts
    │   │   ├── listing.routes.ts
    │   │   ├── listing.service.ts
    │   │   ├── listing.validation.ts
    │   │   └── listing.model.ts
    │   │
    │   ├── bookings/
    │   │   ├── booking.controller.ts
    │   │   ├── booking.routes.ts
    │   │   ├── booking.service.ts
    │   │   ├── booking.validation.ts
    │   │   └── booking.model.ts
    │   │
    │   ├── reviews/
    │   │   ├── review.controller.ts
    │   │   ├── review.routes.ts
    │   │   ├── review.service.ts
    │   │   ├── review.validation.ts
    │   │   └── review.model.ts
    │   │
    │   ├── payments/
    │   │   ├── payment.controller.ts
    │   │   ├── payment.routes.ts
    │   │   ├── payment.service.ts
    │   │   └── payment.model.ts
    │
    │── routes/
    │   └── index.ts       
    │
    └── constants/
        ├── roles.ts
        ├── bookingStatus.ts
        └── index.ts
