# Hyperledger Identity Management


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
node index
```
