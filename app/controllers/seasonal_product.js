const SeasonalProduct = require('../models/seasonal_product');


// get ALL seasonal products by lng
exports.getAllSeasonalProducts = function (req, res, next) {
    if (!req.params.lng) {
        return res.status(500).json({error: "lng is required."});
    }
    SeasonalProduct.find({lng: req.params.lng, is_active: true}, {
            season: 1,
            lng: 1,
            is_active: 1,
            products: 1,
        }, function (err, seasonal_products) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }


            const current_season = require('./../helpers').getCurrentSeasonTime();
            seasonal_products.current_season = current_season;

            return res.status(200).json({current_season:current_season,seasonal_products: seasonal_products});
        }
    );

};

// get  seasonal products by season
exports.getSeasonalProducts = function (req, res, next) {
    if (!req.params.lng) {
        return res.status(500).json({error: "lng is required."});
    }
    if (!req.params.season) {
        return res.status(500).json({error: "season is required."});
    }
    SeasonalProduct.find({season: req.params.season, lng: req.params.lng, is_active: true}, {
            season: 1,
            lng: 1,
            is_active: 1,
            products: 1,
        }, function (err, seasonal_products) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }
        const current_season = require('./../helpers').getCurrentSeasonTime();

            return res.status(200).json({current_season:current_season,seasonal_products: seasonal_products});
        }
    );

};
