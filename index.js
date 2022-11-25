const express = require('express');
const app = express();

//require cors

const cors = require('cors');

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

//require mongo db
const { MongoClient, ServerApiVersion } = require('mongodb');

//require dotenv
require('dotenv').config();

//require jwt
const jwt = require('jsonwebtoken');

const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });

async function run() {
    const productCollection = client.db("vendorStore").collection('products');

    const userCollection = client.db('vendorStore').collection('users');

    try {

        //jwt token
        // app.get('/jwt', async (req, res) => {
        //     const email = req.query.email;
        //     const query = {
        //         email: email
        //     };

        //     const user = await userCollection.findOne(query);
        //     console.log(user);

        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });

        //         console.log(token);
        //         res.send({ accessToken: token })
        //     };

        //     res.status(403).send({ accessToken: '' })

        // })

        app.post('/users', async (req, res) => {
            const user = req.body;

            const result = await userCollection.insertOne(user);
            res.send(result);

        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        });

        //get the seller data
        app.get('/users/:userType', async (req, res) => {
            const userType = req.params.userType;

            // let query = {};

            // if (userType) {
            //     query = {
            //         userType: userType
            //     }
            //

            const query = { userType };
            const user = await userCollection.findOne(query);
            res.send(user);



        })
    }
    finally {

    }
}

run().catch(console.dir)


app.listen(port, () => {
    console.log(`server is listening to ${port}`)
});