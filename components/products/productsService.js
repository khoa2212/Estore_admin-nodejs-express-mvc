const {models} = require('../../models/index');
const loai = models.loai;
const kichthuoc = models.kichthuoc;
const thuonghieu = models.thuonghieu;
const quanao = models.quanao;
const cloudinary = require('../../uploads/cloudinary');
const { Op } = require("sequelize");

exports.countTotalProducts = () =>{
    return quanao.count();
};

exports.countProductsOfName = (name) => {
    return quanao.count({
        include: [{
            model: kichthuoc,
            as:"kichthuocs",
            require: true
        },{
            model: loai,
            as: 'LOAI',
            require: true,
            where: [{
                TEN_LOAI: {[Op.substring]: name}
            }]
        },{
            model: thuonghieu,
            as: "THUONGHIEU",
            require: true
        }]
    }).catch((err) => {throw err});
};

exports.listProductsOfName = (itemPerPage =6, page = 0, name) => {
    return quanao.findAll({
        offset: page * itemPerPage,
        limit: itemPerPage,
        attribute:['MAU', 'GIA', 'SO_LUONG', 'GIOI_TINH'],
        include: [{
            model: kichthuoc,
            as:"kichthuocs",
            require: true
        },{
            model: loai,
            as: 'LOAI',
            require: true,
            where: [{
                TEN_LOAI: {[Op.substring]: name}
            }]
        },{
            model: thuonghieu,
            as: "THUONGHIEU",
            require: true
        }]
    }).catch((err) => {throw err});
};

exports.listProducts = (itemPerPage =6, page = 0) => {
    return quanao.findAll({
        offset: page * itemPerPage,
        limit: itemPerPage,
        attribute:['MAU', 'GIA', 'SO_LUONG', 'GIOI_TINH'],
        include: [{
            model: kichthuoc,
            as:"kichthuocs",
            require: true
        },{
            model: loai,
            as: 'LOAI',
            require: true
        },{
            model: thuonghieu,
            as: "THUONGHIEU",
            require: true
        }]
    }).catch((err) => {throw err});
};

exports.updateLockStatusOfProduct = async (id, lockStatus) => {
    try{
        await quanao.update({DA_XOA: lockStatus}, {where:{QUANAO_ID: id}});
    }
    catch (err) {throw err;}
}

exports.saveChangeToProduct = async (id, productType, color, gender, brand, number, price) => {
    //Check productType and brand validity. If not exists, add that new type or brand
    const {typeId, brandId} = await checkTypeAndBrandValidity(productType, brand);

    //save change to product
    try {
        await quanao.update({
            LOAI_ID: typeId,
            MAU: color,
            THUONGHIEU_ID: brandId,
            GIA: price,
            SO_LUONG: number,
            GIOI_TINH: gender
        }, {where: {QUANAO_ID: id}})
    } catch (e) {throw e;}
}

exports.addNewProduct = async (imagePath, productType, color, gender, brand, quantity, price) => {
    //TODO:check undefined parameters

    //upload image to cloudinary and save image path (from cloud)
    let cloudImagePath = null;
    await cloudinary.uploader.upload(imagePath, {resource_type: "image"}, function (err, result) {
        if(err){
            throw err;
        }
        cloudImagePath = result.secure_url;
    });

    //Check productType and brand validity. If not exists, add that new type or brand
    const {typeId, brandId} = await checkTypeAndBrandValidity(productType, brand);

    //create new product in db
    await quanao.create({
        LOAI_ID: typeId,
        MAU: color,
        THUONGHIEU_ID: brandId,
        GIA: price,
        SO_LUONG: quantity,
        GIOI_TINH: gender,
        LINK: cloudImagePath
    })
}

//Check productType and brand validity. If not exists, add that new type or brand.
//Return approriate typeId and brandId
async function checkTypeAndBrandValidity(productType, brand){
    const existedType = await findProductTypeOfName(productType);
    const existedBrand = await findBrandOfName(brand);
    let typeId, brandId;

    if (!existedType) {  //Cannot found type of such name
        const newType = await addNewType(productType);
        typeId = newType.LOAI_ID;
    } else {
        typeId = existedType.LOAI_ID;
    }
    if(!existedBrand){  //Cannot found such brand in db
        const newBrand = await addNewBrand(brand);
        brandId = newBrand.THUONGHIEU_ID;
    }
    else{
        brandId = existedBrand.THUONGHIEU_ID;
    }

    return {typeId, brandId};
}

async function addNewBrand(name) {
    return await thuonghieu.create({TEN_THUONG_HIEU: name});
}

async function addNewType(name) {
    return await loai.create({TEN_LOAI: name});
}

async function findBrandOfName(name) {
    return await thuonghieu.findOne({
        raw: true,
        where:{
            TEN_THUONG_HIEU: name
        }
    });
}

async function findProductTypeOfName(name) {
    return await loai.findOne({
        raw: true,
        where:{
            TEN_LOAI: name
        }
    });
}