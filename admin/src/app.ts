import * as express from 'express';
import { DataSource, Db } from 'typeorm';
import * as cors from 'cors';
import { Product } from './entity/product';
import * as amqp from "amqplib/callback_api"

const dataSource = new DataSource({
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "your_password",
    "database": "your_db_name",
    "entities": [
        "src/entity/*.js"
    ],
    "logging": true,
    "synchronize": true
});

//connecting to our database
dataSource.initialize()
    .then(async (db) => {

        //Connecting to rabbitMQ
        amqp.connect('your_amqpsURL', (error, connection) => {
            if (error) {
                throw error
            }

            connection.createChannel((err, channel) => {
                if (err) {
                    throw err
                }

                const app = express();

                app.use(cors({
                    origin: ['http://localhost:3000']
                }));

                app.use(express.json());

                const productRepository = db.getRepository(Product)
                const PORT = 3000;

                app.listen(PORT, () => {
                    console.log(`Server is launched at port ${PORT}`);
                    console.log('Database connected');
                });

                app.get('/api/products', async (req, res) => {
                    const products = await productRepository.find()

                    res.json(products)
                })

                app.post('/api/products', async (req, res) => {
                    const product = await productRepository.create(
                        req.body
                    )
                    const result = await productRepository.save(product)

                    // initializing an event
                    // setting the product
                    channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))

                    return res.send(result)
                })

                app.post('/api/products/:id/like', async (req, res) => {
                    const productId: any = req.params.id

                    const product = await productRepository.findOne({ where: { id: productId } })

                    product.likes++

                    const result = await productRepository.save(product)
                    return res.send(result)

                })


                app.get('/api/products/:id', async (req, res) => {
                    const productId: any = req.params.id
                    const product = await productRepository.findOne({ where: { id: productId } })
                    if (product) {
                        res.send(product)
                    } else {
                        res.status(404).json({ message: "Product not found" })
                    }
                })

                app.put('/api/products/:id', async (req, res) => {
                    const productId: any = req.params.id
                    const product = await productRepository.findOne({ where: { id: productId } })

                    productRepository.merge(product, req.body)
                    const result = await productRepository.save(product)

                     // initializing an event
                    // setting the product
                    channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))

                    return res.send(result)
                })

                app.delete('/api/products/:id', async (req, res) => {
                    const productId: any = req.params.id;

                    const product = await productRepository.findOne({ where: { id: productId } });

                    if (!product) {
                        return res.status(404).json({ message: 'Product not found' });
                    }

                    const deleteResult = await productRepository.delete(product);

                     // initializing an event
                    // setting the product
                    channel.sendToQueue('product_deleted', Buffer.from(JSON.stringify(product)))

                    res.send(deleteResult);
                });

                process.on('beforeExit', () => {
                    console.log('closing')
                    connection.close()
                })
            })
        })
    })
    .catch((err) => {
        console.log('Could not connect to the database', err)
    })


