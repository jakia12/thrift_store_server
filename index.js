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
var jwt = require('jsonwebtoken');

const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });

function verifyJWT(req, res, next) {
    //console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader) {
        return res.status(401).send('unauthorized user')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        console.log({ err, decoded });
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }

        req.decoded = decoded;
        next()
    });
}



async function run() {
    const productCollection = client.db("vendorStore").collection('products');

    const userCollection = client.db('vendorStore').collection('users');

    const bookingCollection = client.db('vendorStore').collection('bookings');
    const advertisedCollection = client.db('vendorStore').collection('advertisedProducts');

    const reportedCollection = client.db('vendorStore').collection('reportedProducts');

    const verifiedSellerCollections = client.db('vendorStore').collection('verifiedSellers');


    try {


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

        //verify a seller
        app.put('/users/verified/:id', async (req, res) => {
            // const decodedEmail = req.decoded.email;
            // // const query = { email: decodedEmail };

            // const query = { email: decodedEmail };
            // const user = await userCollection.findOne(query);

            // if (user.role !== 'admin') {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verificationStatus: 'Verified'
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

        //verify a seller
        app.post('/users/verifiedSellers', async (req, res) => {
            const verifiedSeller = req.body;
            const result = await verifiedSellerCollections.insertOne(verifiedSeller);
            res.send(result);
        });

        // get all verified sellers
        app.get('/users/verifiedSellers', async (req, res) => {
            const query = {};
            const verifiedSellers = await verifiedSellerCollections.find(query).toArray();
            res.send(verifiedSellers);
        });

        //add product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log(result);
            res.send(result);
        });


        //get all the products
        app.get('/products', async (req, res) => {
            const sellerEmail = req.query.sellerEmail;


            // const decodedEmail = req.decoded.email;

            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' });
            // }

            let query = {};

            if (sellerEmail) {
                query = {
                    sellerEmail: sellerEmail
                }
            }

            const products = await productCollection.find(query).toArray();
            res.send(products);
        });

        //update product to advertise 
        app.put('/advertiseProducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    isAdvertised: true
                }
            };

            const result = await productCollection.updateOne(filter, updatedDoc, options);

            res.send(result);
        })


        //delete individual product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.deleteOne(query);
            res.send(product);
        })

        //get single category by id

        app.get('/products/:categoryId', async (req, res) => {
            const categoryId = req.params.categoryId;

            const query = { categoryId: categoryId };
            const category = await productCollection.find(query).toArray();

            res.send(category);
        })

        //add booking data
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        //get all booking data
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;


            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            let query = {};

            if (email) {
                query = {
                    email: email
                }
            }

            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);


        });

        //get single booking 
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingCollection.findOne(query);
            res.send(booking);
        });

        // delete the individual booking
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingCollection.deleteOne(query);
            res.send(booking);


        })

        //receive the advertised data 
        app.post('/advertisedProducts', async (req, res) => {
            const product = req.body;
            const result = await advertisedCollection.insertOne(product);
            res.send(result);
        })

        //get the advertised data
        app.get('/advertisedProducts', async (req, res) => {
            const query = {};
            const products = await advertisedCollection.find(query).toArray();
            res.send(products);
        });

        //receive the reported items
        app.post('/reportedProducts', async (req, res) => {
            const product = req.body;
            const result = await reportedCollection.insertOne(product);
            res.send(result);
        })

        //get the reported products
        app.get('/reportedProducts', async (req, res) => {
            const query = {};
            const products = await reportedCollection.find(query).toArray();
            res.send(products);
        });

        // delete the reported products
        app.delete('/reportedProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const reportedProduct = await reportedCollection.deleteOne(query);
            res.send(reportedProduct);


        })


        // jwt token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email
            };

            const user = await userCollection.findOne(query);
            console.log(user);

            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });

                console.log(token);
                return res.send({ accessToken: token })
            };

            res.status(403).send({ accessToken: '' })

        })

    }
    finally {

    }
}

run().catch(console.dir)


app.listen(port, () => {
    console.log(`server is listening to ${port}`)
});