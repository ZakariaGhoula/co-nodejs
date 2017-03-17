

// get ALL tags by lng
exports.getTraitementRecipe = function (req, res, next) {
    Tag.find({lng: 'dd', suggest: true, is_active: true}, {
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

            var normalizedPath = require("path").join(__dirname, "json");
            var normalizedPath = require("path").join(__dirname, "./../../public/json");

            fs.readdirSync(normalizedPath).forEach(function(file) {
                if(file!=".DS_Store"){


                    var obj = require("./../../public/json/" + file);




                    if (typeof obj[0] === "undefined" ) {
                        res.status(500).send({error: "impossible d'ouvire le fichier"});
                        return next("impossible d'ouvire le fichier");
                    }


                    var recipeObj = new Recipe();

                    //--- default data
                    recipeObj.title = obj[0].title;
                    recipeObj.ingredient = obj[0].ingredient;
                    recipeObj.content = obj[0].content;
                    recipeObj.website = obj[0].website;
                    recipeObj.date_created =moment(obj[0].date_created).format("YYYY-MM-DD hh:mm:ss");
                    recipeObj.date_updated =moment(obj[0].date_updated).format("YYYY-MM-DD hh:mm:ss");
                    recipeObj.private    = (obj[0].private=="2")?true:false;
                    recipeObj.activated    = (obj[0].activated==1)?true:false;
                    recipeObj.in_slider    = (obj[0].in_slider==1)?true:false;
                    recipeObj.id_owner    =  (obj[0].id_owner==null || obj[0].id_owner=="")?null:mongoose.Types.ObjectId(obj[0].id_owner);
                    recipeObj.id_user    =   (obj[0].id_user==null || obj[0].id_user=="")?null:mongoose.Types.ObjectId(obj[0].id_user);
                    var media_obj = [];
                    var tags_obj = [];
                    var current_Date = new Date();

                    var tok = (obj[0].id_owner==null || obj[0].id_owner=="")?"x_"+current_Date.getSeconds():obj[0].id_owner;
                    var tok2 = (obj[0].id_user==null || obj[0].id_user=="")?"y_"+current_Date.getSeconds():obj[0].id_user;
                    var folder = 'recipe_' + tok+ "_" +tok2 + '_' + current_Date.getYear() + current_Date.getMonth() + current_Date.getDay() + current_Date.getHours() + current_Date.getMinutes() + current_Date.getSeconds();
                    mkdirp("public/recipes/photo/"+folder, function (err) {

                        // path exists unless there was an error

                    });
                    for (var i in obj[0].media) {

                        var url_64 = (     obj[0].media[i].base_64);

                        var imageBuffer = require('./../helpers').decodeBase64Images(url_64);

                        var file_name = "media_" + parseInt(i + 1) + "_" + current_Date.getYear() + current_Date.getMonth() + current_Date.getDay() + current_Date.getHours() + current_Date.getMinutes() + current_Date.getSeconds();

                        var obj_media = {
                            folder:folder,
                            value:file_name,
                        }

                        /*  var is_build = require('./../helpers').imageRecipeBulder(imageBuffer, 'public/recipes/photo/'+folder, file_name, function (err, data) {

                         });
                         */media_obj.push(obj_media);
                    }

                    recipeObj.media = media_obj;
                    recipeObj.tags = obj[0].tags;


                    //recipeObj.save();
                }
            });






            /*fs.readdirSync("public/json").forEach(function(file) {
             var d = JSON.parse(require("./../../public/json/" + file));
             });*/
            return res.status(200).json({tags: tags});
        }
    );

};

