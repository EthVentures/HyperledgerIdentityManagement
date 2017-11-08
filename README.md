# Hyperledger Identity Management

##### The Problem.

Throughout the hackathon, the Spot Exchange team has been working to create a fully functioning application with secure token JWT authentication and hyperledger communications. Unfortunately, the initial approach proved to be troublesome. Upon installing the passport-github middleware for authentication on the ledger, we found that although the user could sucessfully log-in via OAuth, we did not know which user that token was associated with or if they were even a registered user on the ledger. 

##### HIM.

This is where the Hyperledger Identity Manager (HIM) comes into play. HIM is the glue that lies on top of the hyperledger. It funnels all the ledger requests and authentication requests through one access point that can filter out non-autherized users via token validation and backup to mongoDB the user's profile as well as sync them on the ledger. At the foundation, HIM is a plain node.js server that has auth routes and routes that reflect the business logic on the ledger. In the case of registration, the client will POST a user profile to the register route which would in turn create a mongoDB and ledger user entry with matching information. Once the registration is sucessfully completed, the client will have to log-in through the same auth route to which a JWT token is issued (stored on the client side) and used on all future requests to the glue (HIM). Whenever the client makes a business request to HIM, the route will fire **tokenMiddleware.verifyToken** which will determine if the token is valid and to whom it belongs. If the token is valid, it will query the hyperledger; if not, it will throw an error (401 Unauthorized). With HIM we were able to sucessfully build/deploy an application with registration, authentication, spot creation, and maps populating. By designing the Hyperledger Identity Management (HIM), the Spot Exchange team was able to design an innovative application which can securely utilize the blockchain ledger despite its auth middleware shortcommings. 

##### Dependencies

```
npm install
```

##### Config Server

```
{
  "server": {
    "hostName": "localhost",
    "port": "8888"
  },
  "token": {
    "secret": "secretapplication",
    "expiresInSeconds": "2628000"
  },
  "database": {
    "address":"mongodb://localhost:27017/spot-network"
  }
}

```
##### Run
```
node glue
```
