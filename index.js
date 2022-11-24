const express = require('express');
const app = express();

//require cors

const cors = require('cors');

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`server is listening to ${port}`)
});