# Bank-API-nodeJS

This project was taken as a part of my participance in Appleseed academy fullstack bootcamp.  
In this project I built a bank API with nodeJS, express, fs. All methods were tested with Postman.  
All routes methods have error handling for different cases.  
The bank manager has access to the users of the bank and can perform many operations as described in the following documentation.

## API documentation

Bank API , base endpoint:  
https://bank-api-liat.herokuapp.com/api

There are 2 main jsons, one for the users and one for the accounts.

Each user holds an array for all his/her accounts.  
User object from the users json:  
![user](/images/user.JPG)

The accounts json contains all the users' accounts.  
Account objects from accounts json:  
![accounts](/images/accounts.JPG)

**ROUTES:**

- Get all users data, GET method:  
   https://bank-api-liat.herokuapp.com/api/users

- Get user by id, GET method:  
  https://bank-api-liat.herokuapp.com/api/users/:userId  
  for exmaple: https://bank-api-liat.herokuapp.com/api/users/123

- Add new user, POST method:  
  https://bank-api-liat.herokuapp.com/api/users

  In Postman:  
  {  
  "userId": _enter number_,  
  "name": "_enter string_",  
  "accounts": _enter array with numbers_  
  }

- Get all Accounts data, GET method:  
  https://bank-api-liat.herokuapp.com/api/accounts

- Get account by user id and account id, GET method:  
   https://bank-api-liat.herokuapp.com/api/accounts/:userId/:accountId  
   for example: https://bank-api-liat.herokuapp.com/api/accounts/123/1-2

- Define an account of a user (add it to the accounts json file, matched by the accounts id's in the user object and only if they're not defined yet), POST method:  
  https://bank-api-liat.herokuapp.com/api/accounts/:userId

  In Postman:  
  {  
  accountId: _enter string_,  
  cash: _enter number_,  
  credit: _enter number_,  
  isActive: _enter boolean-true or false_,  
  }

- Deposit cash to a user by user id and account id, PUT method:  
  https://bank-api-liat.herokuapp.com/api/deposit/:userId/:accountId

  In Postman:  
  {  
  "newCash": _enter number_  
  }

- Update credit by user id and account id, PUT method:  
  https://bank-api-liat.herokuapp.com/api/credit/:userId/:accountId

  In Postman:  
  {  
  "newCredit": _enter number_  
  }

- Withdraw money from the user by user id and account id.  
  Can withdraw money until the cash and credit run out. PUT method:  
   https://bank-api-liat.herokuapp.com/api/withdraw/:userId/:accountId

  In Postman:  
  {  
  "withdraw": _enter number_  
  }

- Transfer money from one user to another, users' id's and accounts' id's. Can transfer money until the cash and credit run out. User 1 tranfers to user 2.  
  PUT method:  
  https://bank-api-liat.herokuapp.com/api/transfer/:userId1/:accountId1/:userId2/:accountId2

  In Postman:  
  {  
  "transfer": _enter number_  
  }

  &copy; Liat Pardo Grinbaum
