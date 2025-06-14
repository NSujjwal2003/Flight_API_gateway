const express = require('express');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const role = require('./models/role');

const app = express();

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 30, // Limit each IP to 3 requests per `window` (here, per 15 minutes).
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.use('/flightsService', createProxyMiddleware({
    target: ServerConfig.FLIGHT_SERVICE, 
    changeOrigin: true,
    pathRewrite: {
        '^/flightsService': '/', // Remove the base path when forwarding to the target
    }
}));

app.use('/BookingService', createProxyMiddleware({
    target: ServerConfig.BOOKING_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/BookingService': '/', // Remove the base path when forwarding to the target
    }
}));


app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    // user = await User.findByPk(6);
    // role = await role.findByPk(1);
    // console.log(role, user);
    // user.addRole(role);
});
