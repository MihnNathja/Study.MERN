import express from 'express';
import homeController from '../controller/HomeController.js';

let router = express.Router();

let initWebRoutes = (app) => {
    // Cách 1
    router.get('/', (req, res) => {
        return res.send('Đặng Minh Nhật');
    });

    // Cách 2: gọi hàm trong controller
    router.get('/home', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/crud', homeController.getCRUD);
    router.post('/post-crud', homeController.postCRUD);
    router.get('/get-crud', homeController.getFindAllCRUD);
    router.get('/edit-crud', homeController.getEditCRUD);
    router.post('/put-crud', homeController.putCRUD);
    router.get('/delete-crud', homeController.deleteCRUD);

    return app.use('/', router);
};

module.exports = initWebRoutes;
