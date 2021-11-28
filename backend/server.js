// const express = require('express')
// const dotenv = require('dotenv')
// const products = require('./data/products')

//when importing files in the backend make sure to use .js at the end
import path from 'path'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import dotenv from 'dotenv'
// import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import colors from 'colors'
import morgan from 'morgan'
// import connectDB from './config/db.js'

import { notFound, errorHandler } from './middleware/errorMiddleware.js'

dotenv.config()

// connectDB()

//initialize express
const app = express()

//pug template enginre
// app.set('view engine', 'pug')

//set the path to view folder where templates are located
// app.set('views', path.join(__dirname, 'views'))

//Global Middleware

//Helmet: Security HTTP headers
app.use(helmet())

//Development Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

//Limit the number of API requests received in a specified time
const limiter = rateLimit({
	max: 100, // limit each IP to 100 requests per windowMs
	windowMs: 15 * 60 * 1000, // 15 minutes
	message: 'Too many requests from this IP, Please try again latter!!!',
})
app.use('/api', limiter)

//Body parser, reading data from body into request.body Accepts JSON requests in the body
// app.use(express.json({ limit: '100kb' }))   //limit the json data size
app.use(express.json())

//Data sanitization against NoSQL query injection
// app.use(mongoSanitize())

//Data sanitization against XSS
app.use(xss())

//prevent http parameter pollution (hpp)
// app.use(hpp({whitelist: ['price']}))
app.use(hpp())

// Serving static files
// app.use(express.static(path.join(__dirname, 'public')))

//Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString()
	//console.log(req.headers);
	next()
})

//Since we are using ES6 we need to add extra step to resolve __dirname used in common JS
const __dirname = path.resolve()
//Make uploads folder static so that browser has folder access
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

//Access the front end build folder heroku deployment. (Prod)
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '/frontend/build')))
	app.get('*', (req, res) =>
		res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
	)
} else {
	//development mode, receive get request
	app.get('/', (req, res) => {
		res.send('API is running....')
	})
}

app.use(notFound)

app.use(errorHandler)

//listen to the app
const PORT = process.env.PORT || 5000

app.listen(
	PORT,
	console.log(
		`Server running ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
)
