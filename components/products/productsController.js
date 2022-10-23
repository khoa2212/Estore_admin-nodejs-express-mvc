const productsService = require('./productsService');
const sizeOf = require("image-size");
const itemPerPage = 6;

exports.showPage = async (req, res) => {
    try {
        //validate info from query string
        let page = req.query.page;
        if(isNaN(page) || page <= 0 || page == null){
            page = 1;
        }
        let name = req.query.name;
        const originalUrl = req.originalUrl;

        //choose service
        let products;
        let maxNumberOfPages;
        if(name){
            maxNumberOfPages = Math.ceil(await productsService.countProductsOfName(name) / itemPerPage);
            products = await productsService.listProductsOfName(itemPerPage, page - 1, name);
        }
        else{
            maxNumberOfPages = Math.ceil(await productsService.countTotalProducts() / itemPerPage);
            products = await productsService.listProducts(itemPerPage,page - 1);
        }

        //pass data to view and render
        const paginateInfo = {page, maxNumberOfPages, originalUrl, formLink: '/products?page='};
        const editProductError = req.session.editProductError;
        res.render('products', {title: "Products Table", products,
            tablesActive: req.app.locals.activeSideBarClass,
            paginateInfo, editProductError});

        //reset session parameters
        req.session['editProductError'] = false;
    }
    catch (err) {
        res.render('error', {err});
    }

}

exports.postProduct = async (req, res) => {
    const request = req.body.btn;

    try {
        switch (request) {
            case 'lock':
                await lockProduct(req);
                break;
            case 'unlock':
                await unlockProduct(req);
                break;
            case 'save':
                await saveChangeToProduct(req);
                break;
            case 'add':
                await addNewProduct(req, res);
                break;
            default:
                //do nothing
                break;
        }
    } catch (e) {
        req.session['editProductError'] = true;
    }
    finally {
        res.redirect('back');
    }
}

async function lockProduct(req) {
    const productId = req.body.productId;
    try{
        await productsService.updateLockStatusOfProduct(productId, true);
    }
    catch (error){throw error;}
}

async function unlockProduct(req) {
    const productId = req.body.productId;
    try{
        await productsService.updateLockStatusOfProduct(productId, false);
    }
    catch (error){throw error;}
}

async function saveChangeToProduct(req) {
    const productId = req.body.productId;
    const productType = req.body.productType;
    const color = req.body.color;
    const gender = req.body.gender;
    const brand = req.body.brand;
    const quantity = req.body.quantity;
    const price = req.body.price;

    try {
        await productsService.saveChangeToProduct(productId, productType, color, gender, brand, quantity, price);
    } catch (err) {
        throw err;
    }
}

async function addNewProduct(req, res) {
    const productType = req.body.productType;
    const color = req.body.color;
    const gender = req.body.gender;
    const brand = req.body.brand;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const imagePath = res.locals.imagePath;

    if(!imagePath){ //No image has been submitted to add new product
        throw new Error('no image has been submitted');
    }
    else if(!productType || !color || !gender || !brand || !quantity || !price){
        throw new Error('need to fill all info');
    }
    else{
        try{
            await productsService.addNewProduct(imagePath, productType, color, gender, brand, quantity, price);
            req.session.imagePath = undefined;
        }
        catch (err){
            throw err;
        }
    }
}

exports.uploadImage = (req, res) => {
    //Check file type: must be image
    if (!req.file.mimetype.startsWith('image/')) {
        return res.status(422).json({
            error :'The uploaded file must be an image'
        });
    }

    //Check dimension
    const dimensions = sizeOf(req.file.path);
    if ((dimensions.width < 640) || (dimensions.height < 480)) {
        return res.status(422).json({
            error :'The image must be at least 640 x 480px'
        });
    }

    req.session['imagePath'] = req.file.path;
    return res.status(200).send(req.file);
}
