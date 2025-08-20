import db from '../models/index';
import CRUDService from '../services/CRUDService';

let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll();
        console.log ('................');
        console.log(data);
        console.log ('................');
        return res.render('homepage.ejs', { data: JSON.stringify(data) });
    } catch (error) {
        console.log(error);
        return res.send('Error from server');
    }
}

let getAboutPage = (req, res) => {
    return res.render('about.ejs');
};

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
};

let getFindAllCRUD = async (req, res) => {
    try {
        let data = await CRUDService.getAllUsers();
        return res.render('users/findAllUser.ejs', { 
              datalist: data 
        });
    } catch (error) {
        console.log(error);
        return res.send('Error from server');
    }
};

let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.send('User created successfully');
};

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('users/updateUser.ejs', { 
            data: userData 
        });
    }
    return res.send('User not found');
};

let putCRUD = async (req, res) => {
    let data = req.body;
    let data1 = await CRUDService.updateUser(data);
    return res.render( 'users/findAllUser.ejs', { 
        datalist: data1 
    });
};

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if(id) {
        await CRUDService.deleteUserById(id);
        return res.send('User deleted successfully');
    } else {
        return res.send('User not found');
    }
}

module.exports = {
    getHomePage,
    getAboutPage,
    getCRUD,
    getFindAllCRUD,
    postCRUD,
    getEditCRUD,
    putCRUD,
    deleteCRUD
};
