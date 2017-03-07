const Tag = require('../models/tag');


// get ALL tags by lng
exports.getAllTags = function (req, res, next) {

    if (!req.params.lng) {
        return res.status(500).json({error: "lng is required."});
    }
    Tag.find({lng: req.params.lng, is_active: true}, {
            name: 1,
            lng: 1,
            is_active: 1,
            suggest: 1,
        }, function (err, tags) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }

            return res.status(200).json({tags: tags});
        }
    );

};
//--- retrieve all tag suggest
exports.getAllTagsSuggest = function (req, res, next) {
    if (!req.params.lng) {
        return res.status(500).json({error: "lng is required."});
    }
    Tag.find({lng: req.params.lng, suggest: true, is_active: true}, {
            name: 1,
            lng: 1,
            is_active: 1,
            suggest: 1,
        }, function (err, tags) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }

            return res.status(200).json({tags: tags});
        }
    );

};

// tag autocomplete

exports.getAllTagsAutoComplete = function (req, res, next) {
    if (!req.params.lng) {
        return res.status(500).json({error: "lng is required."});
    }
    if (!req.params.name) {
        return res.status(500).json({error: "name is required."});
    }

    Tag.find({is_active: true,lng: req.params.lng,name:{ $regex:new RegExp(req.params.name, "ig")}}, {
            name: 1,
            lng: 1,
            is_active: 1,
            suggest: 1,
        }, function (err, tags) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }

            return res.status(200).json({tags: tags});
        }
    );

};

