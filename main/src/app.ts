import * as express from "express"
import * as cors from "cors"
import { DataSource } from "typeorm"
import * as amqp from "amqplib/callback_api"
import { Product } from "./entity/product";
import axios from "axios"

const dataSource = new DataSource({
    "type": "mongodb",
    "url": "mongodb_url",
    "synchronize": true,
    "logging": true,
    "entities": [
        "src/entity/*.js"
    ]
});

dataSource.initialize()
    .then(async (db) => {

        const productRepository = db.getMongoRepository(Product)

        amqp.connect('your_amqps_url', (error, connection) => {
            if (error) {
                throw error
            }

            connection.createChannel((err, channel) => {
                if (err) {
                    throw err
                }

                // getting the events
                channel.assertQueue('product_created', { durable: true })
                channel.assertQueue('product_updated', { durable: true })
                channel.assertQueue('product_deleted', { durable: true })

                const app = express()

                app.use(cors())

                app.use(express.json())

                // getting the message
                channel.consume('product_created', async (msg) => {
                    const eventProduct: Product = JSON.parse(msg.content.toString())

                    const product = new Product()
                    product.admin_id = parseInt(eventProduct.id)
                    product.title = eventProduct.title
                    product.image = eventProduct.image
                    product.likes = eventProduct.likes

                    await productRepository.save(product)
                    console.log('Product created')
                }, { noAck: true })

                channel.consume('product_updated', async (msg) => {
                    const eventProduct: Product = JSON.parse(msg.content.toString())
                    const product = await productRepository.findOne({
                        where: { admin_id: parseInt(eventProduct.id) }
                    })

                    productRepository.merge(product, {
                        title: eventProduct.title,
                        image: eventProduct.image,
                        likes: eventProduct.likes,
                    })

                    await productRepository.save(product)
                    console.log('Product updated')
                }, { noAck: true })

                channel.consume('product_deleted', async (msg) => {
                    const admin_id = parseInt(msg.content.toString());

                    await productRepository.deleteOne({ admin_id });

                    console.log('Product deleted');
                }, {noAck: true})


                app.get('/api/products', async (req, res) => {
                    const products = await productRepository.find()

                    return res.send(products)
                })

                app.post('/api/products/:id/like', async (req, res) => {

                    const productId = parseInt(req.params.id)
                    const product  = await productRepository.findOne({where: {id: productId}})


                    if(!product) {
                        return res.status(404).json({
                            message: "Product not found"
                        })
                    }

                    // increase the likes 
                    // in the admin app too
                    await axios.post(`http://localhost:8000/api/products/${product.admin_id}/like`, {})

                    product.likes++
                    await productRepository.save(product)
                    res.send(product)
                })

                app.listen(8001, () => {
                    console.log('Server running at port 8001')
                    console.log('Database Connected')
                })

                process.on('beforeExit', () => {
                    console.log('closing')
                    connection.close()
                })
            })

        })
    })
    .catch((err) => {
        console.error('Connection failed', err)
    })


