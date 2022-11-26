const express = require('express');
const app = express();

//require cors

const cors = require('cors');

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

//require mongo db
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
            const userType = req.query.userType;
            let query = {};

            if (userType) {
                query = {
                    userType: userType
                }
            }
            const users = await userCollection.find(query).toArray();
            res.send(users);
        });

        //delete the users
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await userCollection.deleteOne(query);
            res.send(user);
        })

        //edit all users
        app.put('/users/admin/:id', async (req, res) => {
            // const decodedEmail = req.decoded.email;
            // // const query = { email: decodedEmail };

            // const query = { email: decodedEmail };
            // const user = await userCollections.findOne(query);

            // if (user.role !== 'admin') {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }



            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            };


            const result = await userCollection.updateOne(filter, updatedDoc, options);

            res.send(result);
        });

        //get the admin data

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email };
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });

        })
        //get the seller data
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email };
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user?.userType === 'seller' });

        })

        //get the buyer data
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email };
            const user = await userCollection.findOne(query);
            res.send({ isBuyer: user?.userType === 'buyer' });

        });

        //add product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        //get all the products
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productCollection.find(query).toArray();
            res.send(products);
        });

        //get single category by id

        app.get('/products/:categoryId', async (req, res) => {
            const categoryId = req.params.categoryId;

            const query = { categoryId: categoryId };
            const category = await productCollection.find(query).toArray();

            res.send(category);
        })
    }
    finally {

    }
}

run().catch(console.dir)


app.listen(port, () => {
    console.log(`server is listening to ${port}`)
});